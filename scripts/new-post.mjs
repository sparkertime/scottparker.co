#!/usr/bin/env node
/**
 * Interactive CLI for creating new blog posts and reviews.
 * Run with: npm run new-post
 */

import { input, select } from '@inquirer/prompts';
import { writeFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import slugify from 'slugify';

const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

function toSlug(title) {
  return slugify(title, { lower: true, strict: true });
}

function buildFrontmatter(data) {
  const lines = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      lines.push(value.length === 0
        ? `${key}: []`
        : `${key}: [${value.map(v => `"${v}"`).join(', ')}]`);
    } else if (typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: "${String(value).replace(/"/g, '\\"')}"`);
    }
  }
  return `---\n${lines.join('\n')}\n---\n\n`;
}

/** Return the top N [tag, count] pairs sorted by frequency */
function topTags(n = 12) {
  const counts = {};
  const dir = resolve(process.cwd(), 'src/content/posts');
  for (const f of readdirSync(dir)) {
    const text = readFileSync(resolve(dir, f), 'utf8');
    const inline = text.match(/^tags:\s*\[([^\]]+)\]/m);
    if (inline) {
      for (const t of inline[1].matchAll(/"([^"]+)"|'([^']+)'|([\w][\w-]*)/g)) {
        const tag = (t[1] || t[2] || t[3]).toLowerCase();
        counts[tag] = (counts[tag] || 0) + 1;
      }
      continue;
    }
    const multiStart = text.search(/^tags:\s*$/m);
    if (multiStart !== -1) {
      const after = text.slice(multiStart);
      for (const t of after.matchAll(/^\s+-\s+["']?([^"'\n]+)["']?/gm)) {
        const tag = t[1].trim().toLowerCase();
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/** Open a file in the system default editor / app for that file type */
function openInEditor(filePath) {
  try {
    execSync(`cursor "${filePath}"`, { stdio: 'ignore' });
  } catch {
    // Non-macOS or open not available — silently skip
  }
}

const DESCRIPTION_HINTS = {
  book: 'Author / series (e.g. "Becky Chambers (Monk & Robot #1)"):',
  tv: 'Network and year (e.g. "Netflix, 2025"):',
  game: 'Developer and year (e.g. "Megacrit, 2025"):',
  boardgame: 'Creator(s) and year (e.g. "Vlaada Chvátil, 2000"):',
  other: 'Attribution and year (optional):',
};

async function main() {
  const postType = await select({
    message: 'What are you creating?',
    choices: [
      { name: 'Blog Post', value: 'post' },
      { name: 'Review', value: 'review' },
    ],
  });

  const title = await input({
    message: 'Title:',
    validate: v => v.trim().length > 0 || 'Title is required',
  });

  const headerImage = await input({
    message: 'Header image URL (optional, press Enter to skip):',
  });

  const slug = toSlug(title.trim());
  let frontmatter = { title: title.trim(), date: today };
  let dir, filename;

  if (postType === 'post') {
    const description = await input({
      message: 'Description / headline (optional):',
    });

    const tags = await (async () => {
      const popular = topTags();
      if (popular.length) {
        console.log('  Popular tags: ' + popular.map(([t, n]) => `${t} (${n})`).join(', '));
      }
      const raw = await input({ message: 'Tags (comma-separated, optional):' });
      return raw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    })();

    frontmatter = {
      ...frontmatter,
      ...(description.trim() && { description: description.trim() }),
      tags,
      ...(headerImage.trim() && { headerImage: headerImage.trim() }),
    };

    dir = 'src/content/posts';
    filename = `${today}-${slug}`;

  } else {
    const reviewType = await select({
      message: 'Review type:',
      choices: [
        { name: 'Movie', value: 'movie' },
        { name: 'Book', value: 'book' },
        { name: 'Game', value: 'game' },
        { name: 'TV', value: 'tv' },
        { name: 'Board Game', value: 'boardgame' },
        { name: 'Other', value: 'other' },
      ],
    });

    // Description prompt is type-specific; skip entirely for movies
    let description = '';
    const descHint = DESCRIPTION_HINTS[reviewType];
    if (descHint) {
      description = await input({ message: descHint });
    }

    const rating = await select({
      message: 'Rating:',
      choices: [
        { name: '★★★★★  (5 — outstanding)', value: 5 },
        { name: '★★★★☆  (4 — great)', value: 4 },
        { name: '★★★☆☆  (3 — good)', value: 3 },
        { name: '★★☆☆☆  (2 — mediocre)', value: 2 },
        { name: '★☆☆☆☆  (1 — poor)', value: 1 },
      ],
    });

    const dateInput = await input({
      message: `Date watched/read/played (YYYY-MM-DD, Enter for today: ${today}):`,
      validate: v => !v.trim() || /^\d{4}-\d{2}-\d{2}$/.test(v.trim()) || 'Use YYYY-MM-DD format',
    });
    const date = dateInput.trim() || today;

    let externalUrl = '';
    if (reviewType === 'movie') {
      externalUrl = await input({ message: 'Letterboxd URL (optional):' });
    } else if (reviewType === 'book') {
      externalUrl = await input({ message: 'Goodreads URL (optional):' });
    }

    frontmatter = {
      ...frontmatter,
      date,
      type: reviewType,
      rating,
      ...(description.trim() && { description: description.trim() }),
      tags: [],
      ...(externalUrl.trim() && { externalUrl: externalUrl.trim() }),
      ...(headerImage.trim() && { headerImage: headerImage.trim() }),
    };

    dir = 'src/content/reviews';
    filename = `${date}-${slug}`;
  }

  const outputDir = resolve(process.cwd(), dir);
  mkdirSync(outputDir, { recursive: true });

  const filePath = resolve(outputDir, `${filename}.md`);

  if (existsSync(filePath)) {
    console.error(`\nError: file already exists: ${filePath}`);
    process.exit(1);
  }

  writeFileSync(filePath, buildFrontmatter(frontmatter), 'utf-8');
  console.log(`\nCreated: ${dir}/${filename}.md`);

  if (!headerImage.trim()) {
    console.log('\nNo header image set. To add one later, set this in the frontmatter:');
    console.log('  headerImage: "https://example.com/image.jpg"');
    if (postType === 'post') console.log('It will be downloaded locally when you build.');
  }

  openInEditor(filePath);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
