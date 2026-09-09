// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeBaseImages from './src/lib/rehype-base-images.mjs';

// Su GitHub Pages il sito vive sotto /samuelesegrini/: base e site arrivano dal workflow.
// La radice del sito, prefisso di GitHub Pages incluso: '/' in locale, '/samuelesegrini/' in produzione.
const radice = `/${(process.env.BASE_URL ?? '').replace(/^\/|\/$/g, '')}/`.replace('//', '/');

export default defineConfig({
	site: process.env.PUBLIC_SITE_URL ?? 'https://samuelesegrini.github.io',
	base: process.env.BASE_URL ?? undefined,
	integrations: [
		mdx(),
		// La radice serve la home italiana ma il suo canonico manda a /it/: tenerla anche in
		// sitemap significherebbe proporre due indirizzi per la stessa pagina. Ne resta uno.
		// Le alternative di lingua non passano di qui: l'opzione i18n accoppia gli indirizzi
		// solo quando combaciano dopo il prefisso, e qui gli slug sono tradotti
		// (/en/about/ e /it/chi-sono/). Restano i <link rel="alternate"> nel <head>, che le
		// dichiarano per intero pagina per pagina.
		sitemap({ filter: (page) => new URL(page).pathname !== radice }),
	],
	markdown: {
		processor: unified({
			rehypePlugins: [rehypeBaseImages],
		}),
	},
});
