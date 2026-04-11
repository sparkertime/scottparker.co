import defaultTheme from 'tailwindcss/defaultTheme.js';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.astro',
    './src/**/*.html',
    './src/**/*.{ts,tsx}',
    './src/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Alegreya Sans', ...defaultTheme.fontFamily.sans],
        serif: ['Merriweather', ...defaultTheme.fontFamily.serif],
      },
      typography: () => ({
        DEFAULT: {
          css: {
            // Body prose uses Merriweather
            fontFamily: 'Merriweather, serif',
            fontSize: '1.0625rem',
            lineHeight: '1.8',
            // Headings use Alegreya Sans (the font-sans stack)
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'Alegreya Sans, sans-serif',
            },
            // Tighter heading margins — plugin defaults feel too open in a
            // post-list context where the § divider needs to read as a
            // stronger break than any heading gap within an article.
            h2: {
              marginTop: '1.4em',
              marginBottom: '0.6em',
            },
            h3: {
              marginTop: '1.2em',
              marginBottom: '0.4em',
            },
            h4: {
              marginTop: '1em',
              marginBottom: '0.3em',
            },
            // Tighter figure / image margins
            figure: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            img: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            // Link colours matching the site palette
            a: {
              color: 'rgb(192 38 211)',
              textDecorationLine: 'underline',
              '&:hover': { color: 'rgb(134 25 143)' },
            },
            // Inline code — no backtick pseudo-elements
            code: {
              backgroundColor: '#eee',
              paddingLeft: '2px',
              paddingRight: '2px',
              fontWeight: '400',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            // Blockquotes — no curly-quote artifacts
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:last-of-type::after': { content: 'none' },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
