#!/usr/bin/env node
/**
 * One-time migration script: Jekyll _posts/ → src/content/posts/
 *
 * Transforms:
 *  - tags: "tag1 tag2"  →  tags: ["tag1", "tag2"]
 *  - teaser:            →  headerImage: (renamed)
 *  - date synthesized from filename if missing in frontmatter
 *  - layout: field removed
 *  - {% include figure image_path="X" %}  →  <Figure src="X" />
 *  - {% include figure image_path="X" class="full" %}  →  <Figure src="X" maxHeight="none" />
 *  - {{ "/images/foo" | absolute_url }}  →  /images/foo
 *  - Files with <Figure become .mdx
 *
 * After running, manually copy images:
 *   cp -r images/ public/images/
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import matter from 'gray-matter';

const INPUT_DIR = resolve(process.cwd(), '_posts');
const OUTPUT_DIR = resolve(process.cwd(), 'src/content/posts');

mkdirSync(OUTPUT_DIR, { recursive: true });

function dateFromFilename(filename) {
  const match = basename(filename).match(/^(\d{4}-\d{2}-\d{2})-/);
  return match ? match[1] : null;
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  return String(tags).trim().split(/\s+/).filter(Boolean);
}

function convertFigures(body) {
  // Match {% include figure ... %} with any attribute ordering
  return body.replace(/\{%[-\s]*include figure\s+((?:[^%]|%(?!}))*?)\s*[-\s]*%\}/g, (match, attrs) => {
    const srcMatch = attrs.match(/image_path=["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : '';

    const captionMatch = attrs.match(/caption=["']([^"']+)["']/);
    const caption = captionMatch ? captionMatch[1] : null;

    const classMatch = attrs.match(/class=["']([^"']+)["']/);
    const isFull = classMatch?.includes('full') || (classMatch && classMatch[1].includes('full'));

    let props = `src="${src}"`;
    if (caption) props += ` caption="${caption.replace(/"/g, "'")}"`;
    if (isFull) props += ` maxHeight="none"`;

    return `<Figure ${props} />`;
  });
}

function convertAbsoluteUrls(body) {
  // {{ "/images/foo" | absolute_url }} → /images/foo
  let result = body.replace(/\{\{[-\s]*"([^"]+)"[-\s]*\|[-\s]*absolute_url[-\s]*\}\}/g, '$1');
  // {{"..."}} bare double-curly wrapping a path
  result = result.replace(/\{\{["']([^"']+)["']\}\}/g, '$1');
  return result;
}

const files = readdirSync(INPUT_DIR).filter(f => f.endsWith('.md') || f.endsWith('.markdown'));
let mdxCount = 0;
let skipped = 0;

for (const filename of files) {
  const inputPath = resolve(INPUT_DIR, filename);
  let raw;
  try {
    raw = readFileSync(inputPath, 'utf-8');
  } catch {
    console.warn(`  SKIP: could not read ${filename}`);
    skipped++;
    continue;
  }

  const parsed = matter(raw);
  const data = { ...parsed.data };

  // Remove Jekyll-specific fields
  delete data.layout;

  // Normalize tags
  data.tags = normalizeTags(data.tags);

  // Rename teaser → headerImage
  if (data.teaser) {
    data.headerImage = data.teaser;
    delete data.teaser;
  }

  // Synthesize date from filename if missing
  if (!data.date) {
    const d = dateFromFilename(filename);
    if (d) data.date = d;
  }

  // Body transforms
  let content = parsed.content;
  content = convertFigures(content);
  content = convertAbsoluteUrls(content);

  // Determine output extension
  const hasFigure = content.includes('<Figure ');

  // In MDX, raw <hr> must be self-closing JSX
  if (hasFigure) {
    content = content.replace(/<hr>/g, '<hr />');
  }
  const outputExt = hasFigure ? '.mdx' : '.md';
  const outputName = filename.replace(/\.(md|markdown)$/, outputExt);
  const outputPath = resolve(OUTPUT_DIR, outputName);

  writeFileSync(outputPath, matter.stringify(content, data));
  if (hasFigure) mdxCount++;
}

console.log(`\nMigrated ${files.length - skipped} posts (${mdxCount} as .mdx, ${skipped} skipped)`);
console.log('\nNext step — copy images into public/:');
console.log('  cp -r images/ public/images/');
