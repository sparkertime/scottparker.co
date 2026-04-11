#!/usr/bin/env node
/**
 * scripts/publish.mjs  —  unified import → validate → commit pipeline
 *
 * 1. Runs Letterboxd + Goodreads RSS imports (live output)
 * 2. Halts for review if new content was imported
 * 3. Fetches any new header images
 * 4. Validates frontmatter (duplicate keys, unknown keys)
 * 5. Summarises all pending git changes with titles
 * 6. Prompts for a commit message and optionally pushes
 *
 * Usage:
 *   node scripts/publish.mjs
 *   node scripts/publish.mjs --dry-run   # skip git commit/push
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { confirm, input } from '@inquirer/prompts';
import matter from 'gray-matter';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT    = process.cwd();

// ── Known frontmatter keys (mirrors src/content/config.ts) ───────────────────

const KNOWN_KEYS = {
  posts:   new Set(['title', 'description', 'date', 'tags', 'categories', 'headerImage', 'draft']),
  reviews: new Set(['title', 'description', 'date', 'type', 'rating', 'externalUrl', 'headerImage', 'tags', 'draft']),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Run a command with live output. Returns exit code. */
function run(cmd, args = []) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT });
  return result.status ?? 1;
}

/** Run a command and capture stdout. Throws on non-zero exit. */
function capture(cmd, args = []) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', cwd: ROOT });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(' ')}: ${result.stderr?.trim()}`);
  return result.stdout ?? '';
}

/** Parse `git status --porcelain` into [{code, file}] */
function gitStatus() {
  const out = capture('git', ['status', '--porcelain']);
  return out.split('\n').filter(Boolean).map(line => ({
    code: line.slice(0, 2),
    // git quotes filenames with spaces/special chars; strip those quotes
    file: line.slice(3).trim().replace(/^"(.*)"$/, '$1'),
  }));
}

function collectionOf(file) {
  if (file.includes('src/content/posts/'))   return 'post';
  if (file.includes('src/content/reviews/')) return 'review';
  return null;
}

function isContentFile(file) {
  return /src\/content\/(posts|reviews)\/[^/]+\.(md|mdx)$/.test(file);
}

function isNew(code)      { return code === '??' || code[0] === 'A'; }
function isDeleted(code)  { return code[0] === 'D' || code[1] === 'D'; }

function titleFrom(file) {
  try {
    const { data } = matter(readFileSync(join(ROOT, file), 'utf8'));
    return data.title ?? null;
  } catch { return null; }
}

function label(code, collection) {
  const verb   = isNew(code) ? 'New' : isDeleted(code) ? 'Deleted' : 'Edited';
  const noun   = collection ?? 'file';
  return `${verb} ${noun}`;
}

function pad(s, n) { return s.padEnd(n); }

/** Count commits ahead of the remote tracking branch. Returns 0 if no upstream. */
function unpushedCount() {
  try {
    const out = capture('git', ['log', '@{u}..HEAD', '--oneline']);
    return out.trim().split('\n').filter(Boolean).length;
  } catch { return 0; }
}

// ── Frontmatter validation ────────────────────────────────────────────────────

function validateFrontmatter() {
  const issues = [];

  for (const [collection, known] of Object.entries(KNOWN_KEYS)) {
    const dir = join(ROOT, 'src/content', collection);
    let files;
    try { files = readdirSync(dir); } catch { continue; }

    for (const fname of files) {
      if (!/\.(md|mdx)$/.test(fname)) continue;
      const relPath = `src/content/${collection}/${fname}`;
      const raw = readFileSync(join(dir, fname), 'utf8');

      // Duplicate key check — scan raw frontmatter text since gray-matter
      // silently overwrites dupes and js-yaml may too
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (fmMatch) {
        const seen = new Map();
        for (const line of fmMatch[1].split('\n')) {
          const m = line.match(/^(\w[\w-]*):/);
          if (!m) continue;
          seen.set(m[1], (seen.get(m[1]) ?? 0) + 1);
        }
        for (const [key, count] of seen) {
          if (count > 1) issues.push({ file: relPath, kind: 'duplicate key', key });
        }
      }

      // Unknown key check
      try {
        const { data } = matter(raw);
        for (const key of Object.keys(data)) {
          if (!known.has(key)) issues.push({ file: relPath, kind: 'unknown key', key });
        }
      } catch (e) {
        issues.push({ file: relPath, kind: 'parse error', key: String(e.message) });
      }
    }
  }

  return issues;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n━━━  scottparker.co publish  ━━━━━━━━━━━━━━━━━━━━━━━━\n');
  if (DRY_RUN) console.log('(dry run — no files will be committed or pushed)\n');

  // 1. Snapshot git state before imports so we can detect what came in
  const before = new Set(gitStatus().map(e => e.file));

  // 2. Run imports (live output so progress is visible)
  console.log('── Letterboxd import ──────────────────────────────────\n');
  const lbStatus = run('node', ['scripts/import-letterboxd.mjs']);
  if (lbStatus !== 0) console.log('\n⚠️  Letterboxd import exited with errors (continuing)\n');

  console.log('\n── Goodreads import ───────────────────────────────────\n');
  const grStatus = run('node', ['scripts/import-goodreads.mjs']);
  if (grStatus !== 0) console.log('\n⚠️  Goodreads import exited with errors (continuing)\n');

  // 3. Detect new content files the imports brought in
  const afterImport  = gitStatus();
  const newImports   = afterImport.filter(e => isContentFile(e.file) && !before.has(e.file));

  if (newImports.length > 0) {
    console.log(`\n✨  ${newImports.length} new item(s) imported:\n`);
    for (const { file } of newImports) {
      const title = titleFrom(file);
      console.log(`    ${title ? `"${title}"` : file}`);
    }
    console.log('');

    const proceed = await confirm({
      message: 'New content imported. Continue to image fetch + commit?',
      default: true,
    });
    if (!proceed) {
      console.log('\nHalted. Review the files above, then re-run when ready.\n');
      process.exit(0);
    }
    console.log('');
  } else {
    console.log('\n(No new content from imports)\n');
  }

  // 4. Fetch header images
  console.log('── Fetch header images ────────────────────────────────\n');
  run('node', ['scripts/fetch-headers.mjs']);
  console.log('');

  // 5. Validate frontmatter
  console.log('── Frontmatter validation ─────────────────────────────\n');
  const issues = validateFrontmatter();
  if (issues.length === 0) {
    console.log('    No issues found.\n');
  } else {
    console.log(`⚠️   ${issues.length} issue(s) found:\n`);
    for (const { file, kind, key } of issues) {
      console.log(`    ${pad(kind, 14)}  "${key}"   ${file}`);
    }
    console.log('');
    const proceed = await confirm({
      message: 'Frontmatter issues found. Continue anyway?',
      default: false,
    });
    if (!proceed) {
      console.log('\nHalted. Fix the issues above, then re-run.\n');
      process.exit(1);
    }
    console.log('');
  }

  // 6. Summarise all pending git changes
  const changes        = gitStatus();
  const contentChanges = changes.filter(e => isContentFile(e.file));
  const otherChanges   = changes.filter(e => !isContentFile(e.file));

  const ahead = unpushedCount();

  if (changes.length === 0 && ahead === 0) {
    console.log('ℹ️   Nothing to commit or push. Working tree is clean.\n');
    process.exit(0);
  }

  if (changes.length === 0 && ahead > 0) {
    console.log(`ℹ️   Nothing to commit — but ${ahead} unpushed commit(s) on this branch.\n`);
    const doPush = await confirm({ message: 'Push now?', default: true });
    if (doPush) {
      spawnSync('git', ['push'], { stdio: 'inherit', cwd: ROOT });
      console.log('\n✅  Done.\n');
    } else {
      console.log('\nNot pushed.\n');
    }
    process.exit(0);
  }

  console.log('── Pending changes ────────────────────────────────────\n');

  for (const { code, file } of contentChanges) {
    const collection = collectionOf(file);
    const title      = isDeleted(code) ? null : titleFrom(file);
    const lbl        = pad(label(code, collection), 14);
    console.log(`    ${lbl}  ${title ? `"${title}"` : file}`);
  }

  if (otherChanges.length > 0) {
    console.log('');
    for (const { code, file } of otherChanges) {
      const verb = isNew(code) ? 'New' : isDeleted(code) ? 'Deleted' : 'Edited';
      console.log(`    ${pad(verb + ' file', 14)}  ${file}`);
    }
  }

  console.log('');
  const doCommit = await confirm({ message: 'Commit these changes?', default: true });
  if (!doCommit) {
    console.log('\nNothing committed.\n');
    process.exit(0);
  }

  // 7. Commit message
  const message = await input({
    message: 'Commit message:',
    validate: v => v.trim().length > 0 || 'A commit message is required',
  });

  if (DRY_RUN) {
    console.log(`\n[dry-run] Would run: git add -A && git commit -m "${message}"\n`);
    process.exit(0);
  }

  // 8. Stage + commit
  console.log('');
  spawnSync('git', ['add', '-A'],                      { stdio: 'inherit', cwd: ROOT });
  spawnSync('git', ['commit', '-m', message.trim()],   { stdio: 'inherit', cwd: ROOT });
  console.log('');

  // 9. Optionally push
  const doPush = await confirm({ message: `Push to remote? (${unpushedCount()} commit(s) ahead)`, default: true });
  if (doPush) {
    spawnSync('git', ['push'], { stdio: 'inherit', cwd: ROOT });
    console.log('\n✅  Done.\n');
  } else {
    console.log('\n✅  Committed locally (not pushed).\n');
  }
}

main().catch(err => {
  console.error('\n❌ ', err.message ?? String(err));
  process.exit(1);
});
