#!/usr/bin/env node
/**
 * Scans all src/content files for headerImage frontmatter values that are
 * HTTP URLs, downloads them to public/images/headers/, and rewrites the
 * frontmatter to use the local path.
 *
 * Idempotent: already-local paths (starting with /) are skipped.
 * Safe to run before every build — it only fetches new URLs.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, basename, extname } from 'node:path';
import { glob } from 'node:fs/promises';
import matter from 'gray-matter';

const HEADERS_DIR = resolve(process.cwd(), 'public/images/headers');
const HEADERS_PUBLIC = '/images/headers';

mkdirSync(HEADERS_DIR, { recursive: true });

let fetched = 0;
let skipped = 0;

for await (const filePath of glob('src/content/**/*.{md,mdx}', { cwd: process.cwd() })) {
  const absPath = resolve(process.cwd(), filePath);
  const raw = readFileSync(absPath, 'utf-8');
  const parsed = matter(raw);
  const { headerImage } = parsed.data;

  if (!headerImage || !String(headerImage).startsWith('http')) {
    skipped++;
    continue;
  }

  let url;
  try {
    url = new URL(headerImage);
  } catch {
    console.warn(`  WARN: invalid URL in ${filePath}: ${headerImage}`);
    skipped++;
    continue;
  }

  const ext      = extname(basename(url.pathname)) || '.jpg';
  const slug     = basename(filePath, extname(filePath)); // e.g. "2024-03-10-best-of-2023"
  const safeName = `${slug}${ext}`;
  const localFile = resolve(HEADERS_DIR, safeName);
  const localPath = `${HEADERS_PUBLIC}/${safeName}`;

  if (!existsSync(localFile)) {
    try {
      const res = await fetch(headerImage);
      if (!res.ok) {
        console.warn(`  WARN: HTTP ${res.status} fetching ${headerImage}`);
        skipped++;
        continue;
      }
      writeFileSync(localFile, Buffer.from(await res.arrayBuffer()));
      console.log(`  Downloaded: ${safeName} (from ${filePath})`);
      fetched++;
    } catch (err) {
      console.warn(`  WARN: fetch failed for ${headerImage}: ${err.message}`);
      skipped++;
      continue;
    }
  }

  // Rewrite frontmatter to local path
  parsed.data.headerImage = localPath;
  writeFileSync(absPath, matter.stringify(parsed.content, parsed.data));
}

console.log(`fetch-headers: ${fetched} downloaded, ${skipped} skipped`);
