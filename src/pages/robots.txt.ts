import type { APIRoute } from 'astro';
import { base } from '../lib/base';

export const GET: APIRoute = ({ site }) => {
	const origin = site ?? new URL('https://samuelesegrini.github.io');
	return new Response(
		`User-agent: *\nAllow: /\nSitemap: ${new URL(`${base}/sitemap-index.xml`, origin).href}\n`,
		{ headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
	);
};
