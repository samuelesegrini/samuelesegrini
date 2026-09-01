// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: process.env.PUBLIC_SITE_URL ?? 'https://portfolio-placeholder.pages.dev',
	integrations: [mdx(), react(), sitemap({ filter: (page) => !page.includes('/lab/') })],
});
