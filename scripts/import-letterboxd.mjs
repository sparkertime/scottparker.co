#!/usr/bin/env node
/**
 * import-letterboxd.mjs
 *
 * Imports Letterboxd reviews into src/content/reviews/ by reading your
 * public RSS feed. Idempotent — skips files already on disk. Downloads
 * film posters to public/images/headers/.
 *
 * Usage:
 *   node scripts/import-letterboxd.mjs           # import from RSS
 *   node scripts/import-letterboxd.mjs --dry-run # preview without writing files
 *
 * Note: Letterboxd's RSS feed returns your ~50 most recent reviews.
 * For a full historical import, download your data from
 * letterboxd.com/settings/data/ and run:
 *   node scripts/import-letterboxd.mjs --csv /path/to/reviews.csv
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const USERNAME   = 'hellosparker';
const DRY_RUN    = process.argv.includes('--dry-run');
const CSV_INDEX  = process.argv.indexOf('--csv');
const CSV_FILE   = CSV_INDEX !== -1 ? process.argv[CSV_INDEX + 1] : null;
const REVIEWS_DIR = join(process.cwd(), 'src/content/reviews');
const HEADERS_DIR = join(process.cwd(), 'public/images/headers');

// ── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Pull a tag value from an XML string, e.g. tag("letterboxd:filmTitle", item) */
function tag(name, xml) {
  const escaped = name.replace(':', '\\:');
  const m = xml.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`));
  return m ? m[1].trim() : null;
}

/** Pull the CDATA block out of <description> */
function cdata(xml) {
  const m = xml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
  return m ? m[1].trim() : '';
}

/** Convert HTML (from Letterboxd review bodies) to Markdown */
function htmlToMarkdown(html) {
  if (!html) return '';
  return html
    // Blockquotes — recurse so inner formatting is preserved
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) =>
      htmlToMarkdown(inner).trim().split('\n').map(l => `> ${l}`).join('\n') + '\n\n'
    )
    // Unordered lists
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) =>
      inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item) =>
        `- ${htmlToMarkdown(item).trim()}\n`
      ) + '\n'
    )
    // Ordered lists
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
      let n = 0;
      return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item) =>
        `${++n}. ${htmlToMarkdown(item).trim()}\n`
      ) + '\n';
    })
    // Headings
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, level, inner) =>
      '#'.repeat(+level) + ' ' + htmlToMarkdown(inner).trim() + '\n\n'
    )
    // Horizontal rules
    .replace(/<hr\s*\/?>/gi, '\n---\n\n')
    // Line breaks and paragraphs
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    // Inline formatting
    .replace(/<em>([\s\S]*?)<\/em>/gi, '_$1_')
    .replace(/<i>([\s\S]*?)<\/i>/gi, '_$1_')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
    // Links
    .replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    // Strip any remaining tags
    .replace(/<[^>]+>/g, '')
    // HTML entities
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Slugify a film title to match Letterboxd's URL convention */
function toSlug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Minimal CSV parser that handles quoted fields with embedded commas/newlines */
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuote = false;
      else field += ch;
    } else if (ch === '"') {
      inQuote = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n') {
      row.push(field); field = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field || row.length) { row.push(field); if (row.some(Boolean)) rows.push(row); }
  return rows;
}

async function downloadPoster(url, filename) {
  if (!url) return null;
  const dest = join(HEADERS_DIR, filename);
  if (existsSync(dest)) return `/images/headers/${filename}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (!DRY_RUN) writeFileSync(dest, buf);
  return `/images/headers/${filename}`;
}

function reviewFileExists(date, filmSlug) {
  return existsSync(join(REVIEWS_DIR, `${date}-${filmSlug}.md`));
}

function writeReview({ filename, title, date, rating, letterboxdUrl, headerImage, body }) {
  const lines = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: ${date}`,
    `type: movie`,
    `rating: ${rating}`,
    `externalUrl: "${letterboxdUrl}"`,
  ];
  if (headerImage) lines.push(`headerImage: "${headerImage}"`);
  lines.push('tags: []', '---', '');
  if (body) lines.push(body, '');
  writeFileSync(join(REVIEWS_DIR, filename), lines.join('\n'));
}

function logReview(action, filename, title, rating) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  console.log(`  ${action} ${filename}  ${stars}  ${title}`);
}

// ── RSS import ────────────────────────────────────────────────────────────────

async function importFromRSS() {
  const feedUrl = `https://letterboxd.com/${USERNAME}/rss/`;
  console.log(`Fetching ${feedUrl} …`);

  const res = await fetch(feedUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; feed-reader/1.0)' },
  });
  if (!res.ok) throw new Error(`RSS fetch failed: HTTP ${res.status}`);
  const xml = await res.text();

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  console.log(`Found ${items.length} items in feed\n`);

  let imported = 0, skipped = 0;

  for (const item of items) {
    // Only process entries that are written reviews (guid contains "review")
    const guid = tag('guid', item) ?? '';
    if (!guid.includes('review')) { skipped++; continue; }

    const filmTitle = htmlToMarkdown(tag('letterboxd:filmTitle', item) ?? '');
    const filmYear  = tag('letterboxd:filmYear', item) ?? '';
    const ratingRaw = parseFloat(tag('letterboxd:memberRating', item) ?? '0');
    const date      = tag('letterboxd:watchedDate', item);
    const link      = item.match(/<link>(https?:\/\/[^<]+)<\/link>/)?.[1] ?? '';

    if (!filmTitle || !date || !ratingRaw) { skipped++; continue; }

    const rating     = Math.max(1, Math.floor(ratingRaw));
    let   filmSlug   = link.replace(/.*\/film\//, '').replace(/\/$/, '');
    // Letterboxd appends the year to disambiguate (e.g. "the-mastermind-2025");
    // strip it so slugs stay consistent with the CSV importer's toSlug(title).
    if (filmYear && filmSlug.endsWith(`-${filmYear}`)) {
      filmSlug = filmSlug.slice(0, -(filmYear.length + 1));
    }
    const filename = `${date}-${filmSlug}.md`;

    if (reviewFileExists(date, filmSlug)) {
      logReview('–', filename, filmTitle, rating);
      skipped++;
      continue;
    }

    // Description CDATA: first <p> is the poster <img>, rest is review HTML
    const desc      = cdata(item);
    const posterSrc = desc.match(/<img src="([^"]+)"/)?.[1] ?? null;
    const bodyHtml  = desc.replace(/<p><img[^>]+\/?><\/p>/, '')
                         .replace(/<p>\s*This review may contain spoilers\.\s*<\/p>/i, '')
                         .trim();
    const body      = htmlToMarkdown(bodyHtml);

    // Download poster
    let headerImage = null;
    if (posterSrc) {
      const ext      = (posterSrc.split('.').pop()?.split('?')[0]) ?? 'jpg';
      const filename = `${filmSlug}${filmYear ? `-${filmYear}` : ''}.${ext}`;
      try {
        headerImage = await downloadPoster(posterSrc, filename);
        await sleep(150);
      } catch { /* no poster is fine */ }
    }

    if (DRY_RUN) {
      logReview('[dry-run]', filename, filmTitle, rating);
    } else {
      writeReview({
        filename,
        title: filmYear ? `${filmTitle} (${filmYear})` : filmTitle,
        date,
        rating,
        letterboxdUrl: link,
        headerImage,
        body,
      });
      logReview('✓', filename, filmTitle, rating);
    }
    imported++;
  }

  return { imported, skipped };
}

// ── CSV import ────────────────────────────────────────────────────────────────
//
// Letterboxd data export (letterboxd.com/settings/data/) includes reviews.csv
// with columns: Date, Name, Year, Letterboxd URI, Rating, Rewatch, Tags,
// Watched Date, Review
//
// No posters are available from the CSV — add headerImage manually or via
// fetch-headers if you find poster URLs separately.

async function importFromCSV(csvPath) {
  if (!existsSync(csvPath)) throw new Error(`CSV file not found: ${csvPath}`);
  console.log(`Reading ${csvPath} …`);

  const rows = parseCSV(readFileSync(csvPath, 'utf8'));
  if (rows.length < 2) throw new Error('CSV appears empty');

  // Map header names to indices (case-insensitive)
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name) => headers.indexOf(name);

  const iDate      = col('date');
  const iName      = col('name');
  const iYear      = col('year');
  const iURI       = col('letterboxd uri');
  const iRating    = col('rating');
  const iWatched   = col('watched date');
  const iReview    = col('review');

  if ([iName, iURI, iRating, iReview].some((i) => i === -1)) {
    throw new Error(`CSV missing expected columns. Headers found: ${rows[0].join(', ')}`);
  }

  console.log(`Found ${rows.length - 1} rows\n`);

  let imported = 0, skipped = 0;

  for (const row of rows.slice(1)) {
    const title     = row[iName]?.trim();
    const uri       = row[iURI]?.trim();   // e.g. https://letterboxd.com/film/slug/
    const reviewTxt = row[iReview]?.trim();
    const ratingRaw = parseFloat(row[iRating] ?? '0');
    const date      = (iWatched !== -1 ? row[iWatched] : row[iDate])?.trim();

    if (!title || !ratingRaw || !date || !reviewTxt) { skipped++; continue; }

    const rating   = Math.max(1, Math.floor(ratingRaw));
    const filmSlug = toSlug(title);
    const filename = `${date}-${filmSlug}.md`;
    const userUrl  = `https://letterboxd.com/${USERNAME}/film/${filmSlug}/`;

    if (reviewFileExists(date, filmSlug)) {
      logReview('–', filename, title, rating);
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      logReview('[dry-run]', filename, title, rating);
    } else {
      writeReview({
        filename,
        title,
        date,
        rating,
        letterboxdUrl: userUrl,
        headerImage: null,
        body: reviewTxt ?? '',
      });
      logReview('✓', filename, title, rating);
    }
    imported++;
  }

  return { imported, skipped };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync(REVIEWS_DIR, { recursive: true });
  mkdirSync(HEADERS_DIR, { recursive: true });

  if (DRY_RUN) console.log('(dry run — no files will be written)\n');

  let stats;
  if (CSV_FILE) {
    stats = await importFromCSV(CSV_FILE);
  } else {
    stats = await importFromRSS();
  }

  console.log(`\nDone.  Imported: ${stats.imported}  Skipped: ${stats.skipped}`);
  if (!CSV_FILE) {
    console.log('\nNote: Letterboxd RSS returns your ~50 most recent reviews.');
    console.log('For a full historical import, download your data at:');
    console.log('  letterboxd.com/settings/data/');
    console.log('Then run: node scripts/import-letterboxd.mjs --csv /path/to/reviews.csv');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
