import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getContainerRenderer } from '@astrojs/mdx';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import Figure from '../components/Figure.astro';
import { cleanSlug } from '../utils/slugify';
import { excerpt } from '../utils/excerpt';
import type { APIContext } from 'astro';

function stars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

/** Rewrite root-relative URLs in HTML to absolute using the site base URL */
function absolutifyUrls(html: string, siteBase: string): string {
  return html
    .replace(/(src|href)="(\/((?!\/)[^"]*))/g, `$1="${siteBase}/$3`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(context: APIContext) {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });

  const posts   = await getCollection('posts',   p => !p.data.draft);
  const reviews = await getCollection('reviews', r => !r.data.draft);

  const site = context.site!.toString().replace(/\/$/, '');

  // ── Posts ─────────────────────────────────────────────────────────────────
  const postItems = await Promise.all(posts.map(async p => {
    const url  = `/posts/${cleanSlug(p.slug)}/`;
    const desc = p.data.description ?? excerpt(p.body, 220);

    const { Content } = await p.render();
    const bodyHtml = absolutifyUrls(
      await container.renderToString(Content as any, { props: { components: { Figure } } }),
      site
    );

    // Build content: optional header image + full body
    let content = '';
    if (p.data.headerImage) {
      const imgSrc = p.data.headerImage.startsWith('http')
        ? p.data.headerImage
        : `${site}${p.data.headerImage}`;
      content += `<p><img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.data.title)}" style="max-width:300px;width:100%" /></p>`;
    }
    content += bodyHtml;

    const customData = p.data.headerImage
      ? `<media:content url="${escapeHtml(p.data.headerImage.startsWith('http') ? p.data.headerImage : `${site}${p.data.headerImage}`)}" medium="image" />`
      : '';

    return {
      title: p.data.title,
      pubDate: p.data.date,
      description: desc,
      link: url,
      content,
      ...(customData ? { customData } : {}),
    };
  }));

  // ── Reviews ───────────────────────────────────────────────────────────────
  const reviewItems = await Promise.all(reviews.map(async r => {
    const url = `/reviews/${cleanSlug(r.slug)}/`;

    // Description: stars + author/series + opening line of review
    const ratingLine = `${stars(r.data.rating)} (${r.data.rating}/5)`;
    const reviewPreview = excerpt(r.body, 180);
    const descParts = [ratingLine];
    if (r.data.description) descParts.push(r.data.description);
    if (reviewPreview) descParts.push(reviewPreview);
    const desc = descParts.join(' — ');

    const { Content } = await r.render();
    const bodyHtml = absolutifyUrls(
      await container.renderToString(Content as any),
      site
    );

    // Content: poster + metadata header + review body
    let content = '';
    if (r.data.headerImage) {
      const imgSrc = r.data.headerImage.startsWith('http')
        ? r.data.headerImage
        : `${site}${r.data.headerImage}`;
      content += `<p><img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(r.data.title)}" style="max-width:200px;float:right;margin:0 0 1em 1em" /></p>`;
    }
    content += `<p><strong>${escapeHtml(ratingLine)}</strong>`;
    if (r.data.description) content += `<br />${escapeHtml(r.data.description)}`;
    if (r.data.externalUrl) {
      const linkLabel = r.data.type === 'book' ? 'View on Goodreads' : 'View on Letterboxd';
      content += `<br /><a href="${escapeHtml(r.data.externalUrl)}">${escapeHtml(linkLabel)}</a>`;
    }
    content += `</p>`;
    content += bodyHtml;

    const customData = r.data.headerImage
      ? `<media:content url="${escapeHtml(r.data.headerImage.startsWith('http') ? r.data.headerImage : `${site}${r.data.headerImage}`)}" medium="image" />`
      : '';

    return {
      title: r.data.title,
      pubDate: r.data.date,
      description: desc,
      link: url,
      content,
      ...(customData ? { customData } : {}),
    };
  }));

  const allItems = [...postItems, ...reviewItems]
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'scottparker.co',
    description: 'Scott Parker writes here sometimes',
    site: context.site!,
    xmlns: { media: 'http://search.yahoo.com/mrss/' },
    items: allItems,
  });
}
