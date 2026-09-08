// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeBaseImages from './src/lib/rehype-base-images.mjs';

// Su GitHub Pages il sito vive sotto /samuelesegrini/: base e site arrivano dal workflow.
export default defineConfig({
	site: process.env.PUBLIC_SITE_URL ?? 'https://samuelesegrini.github.io',
	base: process.env.BASE_URL ?? undefined,
	integrations: [mdx(), sitemap()],
	markdown: {
		processor: unified({
			rehypePlugins: [rehypeBaseImages],
		}),
	},
});
