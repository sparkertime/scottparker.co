import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://scottparker.co',
  integrations: [
    mdx(),
    tailwind({ configFile: './tailwind.config.mjs', applyBaseStyles: false }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
