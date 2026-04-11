/**
 * Generates a natural-language excerpt from raw markdown/MDX body text.
 * Ends at a sentence boundary rather than mid-word or mid-sentence.
 */
export function excerpt(body: string, targetLength = 220): string {
  const clean = body
    // Remove MDX/JSX components and HTML tags
    .replace(/<[^>]+\/?>/g, '')
    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]+`/g, '')
    // Remove images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove links but keep link text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headings (# ## etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
    // Remove blockquote markers
    .replace(/^>\s*/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove frontmatter if somehow present
    .replace(/^---[\s\S]*?---\n/m, '')
    // Collapse multiple blank lines / leading whitespace
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (clean.length <= targetLength) return clean;

  // Search for a sentence-ending punctuation in the window [targetLength * 0.6 .. targetLength * 1.4]
  const lo = Math.floor(targetLength * 0.6);
  const hi = Math.min(Math.floor(targetLength * 1.4), clean.length);
  const window = clean.slice(lo, hi);

  // Find the first sentence-ending punctuation followed by a space or end of window
  const sentenceEnd = window.search(/[.!?](?:\s|$)/);
  if (sentenceEnd !== -1) {
    return clean.slice(0, lo + sentenceEnd + 1) + '…';
  }

  // Fallback: nearest word boundary at or before targetLength
  const truncated = clean.slice(0, targetLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}
