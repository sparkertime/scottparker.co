/**
 * Strips the YYYY-MM-DD- date prefix that Astro includes in slugs
 * derived from Jekyll-style filenames.
 *
 * "2016-12-06-edge-of-the-empire-review" → "edge-of-the-empire-review"
 */
export function cleanSlug(slug: string): string {
  return slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}
