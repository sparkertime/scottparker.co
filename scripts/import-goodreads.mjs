#!/usr/bin/env node
/**
 * import-goodreads.mjs
 *
 * Imports Goodreads reviews into src/content/reviews/ by reading your
 * public RSS feed. Idempotent — skips files already on disk. Downloads
 * book covers to public/images/headers/.
 *
 * Only imports items with a non-empty review body.
 *
 * Usage:
 *   node scripts/import-goodreads.mjs           # full import
 *   node scripts/import-goodreads.mjs --dry-run # preview without writing files
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const RSS_URL     = 'https://www.goodreads.com/review/list_rss/5400288?key=PU884zocHTefJ5PXmICXHM7JBVENXyNb-I997_dWXgh2vyDd&shelf=read';
const DRY_RUN     = process.argv.includes('--dry-run');
const REVIEWS_DIR = join(process.cwd(), 'src/content/reviews');
const HEADERS_DIR = join(process.cwd(), 'public/images/headers');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── XML helpers ───────────────────────────────────────────────────────────────

/** Pull a plain tag value, e.g. <user_rating>5</user_rating> */
function tagPlain(name, xml) {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`));
  return m ? m[1].trim() : null;
}

/** Pull a CDATA tag value, e.g. <title><![CDATA[…]]></title> */
function tagCdata(name, xml) {
  const m = xml.match(new RegExp(`<${name}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${name}>`));
  return m ? m[1].trim() : null;
}

/** Get a field that could be plain or CDATA */
function field(name, xml) {
  return tagCdata(name, xml) ?? tagPlain(name, xml) ?? null;
}

// ── HTML → Markdown ───────────────────────────────────────────────────────────

function htmlToMarkdown(html) {
  if (!html) return '';
  return html
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) =>
      htmlToMarkdown(inner).trim().split('\n').map(l => `> ${l}`).join('\n') + '\n\n'
    )
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) =>
      inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item) =>
        `- ${htmlToMarkdown(item).trim()}\n`
      ) + '\n'
    )
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
      let n = 0;
      return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item) =>
        `${++n}. ${htmlToMarkdown(item).trim()}\n`
      ) + '\n';
    })
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, level, inner) =>
      '#'.repeat(+level) + ' ' + htmlToMarkdown(inner).trim() + '\n\n'
    )
    .replace(/<hr\s*\/?>/gi, '\n---\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '_$1_')
    .replace(/<i>([\s\S]*?)<\/i>/gi, '_$1_')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Slug generation ───────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/['']/g, '')           // smart quotes
    .replace(/[^a-z0-9]+/g, '-')   // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '');       // trim hyphens
}

// ── Date parsing ──────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0, 10);
}

// ── Cover image ───────────────────────────────────────────────────────────────

/**
 * Goodreads image URLs look like:
 *   https://i.gr-assets.com/.../books/1234567890l/12345._SY475_.jpg
 * Removing the size token (._SY475_) gives the largest available version.
 */
function enlargeCoverUrl(url) {
  return url.replace(/\._[A-Z]{2}\d+_(\.\w+)$/, '$1');
}

async function downloadCover(url, filename) {
  if (!url) return null;
  const dest = join(HEADERS_DIR, filename);
  if (existsSync(dest)) return `/images/headers/${filename}`;

  for (const candidate of [enlargeCoverUrl(url), url]) {
    try {
      const res = await fetch(candidate);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (!DRY_RUN) writeFileSync(dest, buf);
      return `/images/headers/${filename}`;
    } catch { /* try fallback */ }
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync(REVIEWS_DIR, { recursive: true });
  mkdirSync(HEADERS_DIR, { recursive: true });

  if (DRY_RUN) console.log('(dry run — no files will be written)\n');

  let imported = 0, skipped = 0, page = 1;

  while (true) {
    const url = `${RSS_URL}&page=${page}`;
    process.stdout.write(`Page ${page}… `);

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; feed-reader/1.0)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
    // Goodreads doesn't flag end-of-feed, so stop when we get < 2 real items
    if (items.length < 2) { console.log('end of feed'); break; }
    console.log(`${items.length} items`);

    for (const item of items) {
      // ── Review body — skip if empty ──────────────────────────────────
      const reviewHtml = field('user_review', item) ?? '';
      if (!reviewHtml.trim()) { skipped++; continue; }

      // ── Core fields ──────────────────────────────────────────────────
      const rawTitle  = field('title', item) ?? '';
      // Strip series info: "Book Title (Series, #2)" → title = "Book Title", keep series for description
      const titleMatch = rawTitle.match(/^(.*?)\s*(\(.*?\))?$/);
      const title      = titleMatch?.[1]?.trim() || rawTitle;
      const series     = titleMatch?.[2]?.trim() || null;

      const author     = field('author_name', item) ?? '';
      const ratingRaw  = parseInt(tagPlain('user_rating', item) ?? '0', 10);
      const coverUrl   = field('book_large_image_url', item) ?? '';
      const reviewUrl  = field('link', item) ?? field('guid', item) ?? '';
      const bookId     = tagPlain('book_id', item) ?? '';

      // Date: prefer read_at, fall back to date_added
      const date =
        parseDate(field('user_read_at', item)) ??
        parseDate(field('user_date_added', item));

      if (!title || !date || ratingRaw < 1) { skipped++; continue; }
      const rating = Math.min(5, Math.max(1, ratingRaw));

      // ── Slug & filename ──────────────────────────────────────────────
      // Use title slug + short book_id hash to avoid collisions between editions
      const slug     = toSlug(title);
      const filename = `${date}-${slug}.md`;
      const dest     = join(REVIEWS_DIR, filename);

      if (existsSync(dest)) {
        skipped++;
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        console.log(`  – ${filename}  ${stars}  ${title}`);
        continue;
      }

      // ── Cover image ──────────────────────────────────────────────────
      let headerImage = null;
      if (coverUrl) {
        const ext = (coverUrl.split('.').pop()?.split('?')[0]) ?? 'jpg';
        const coverFilename = `${slug}-gr${bookId}.${ext}`;
        try {
          headerImage = await downloadCover(coverUrl, coverFilename);
          await sleep(150);
        } catch { /* no cover is fine */ }
      }

      // ── Build markdown file ──────────────────────────────────────────
      const body = htmlToMarkdown(reviewHtml);

      const lines = [
        '---',
        `title: "${title.replace(/"/g, '\\"')}"`,
        `date: ${date}`,
        `type: book`,
        `rating: ${rating}`,
      ];
      if (author)      lines.push(`description: "By ${author.replace(/"/g, '\\"')}${series ? ` ${series}` : ''}"`);
      if (reviewUrl)   lines.push(`externalUrl: "${reviewUrl}"`);
      if (headerImage) lines.push(`headerImage: "${headerImage}"`);
      lines.push('tags: []', '---', '', body, '');

      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

      if (DRY_RUN) {
        console.log(`  [dry-run] ${filename}  ${stars}  ${title}${author ? ` — ${author}` : ''}`);
      } else {
        writeFileSync(dest, lines.join('\n'));
        console.log(`  ✓ ${filename}  ${stars}  ${title}${author ? ` — ${author}` : ''}`);
      }
      imported++;

      await sleep(300);
    }

    page++;
    await sleep(500);
  }

  console.log(`\nDone.  Imported: ${imported}  Skipped: ${skipped}`);
}

main().catch(err => { console.error(err); process.exit(1); });
