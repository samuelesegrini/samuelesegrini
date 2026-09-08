import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../../lib/content';
import { getPortfolioContent, postPath } from '../../lib/portfolio';
import { base } from '../../lib/base';

export async function GET(context: APIContext) {
	const { posts } = await getPortfolioContent();
	return rss({
		title: 'Writing — Samuele Segrini',
		description: 'Technical decisions, process, and lessons from building.',
		site: new URL(`${base}/`, context.site!).href,
		items: getPublishedPosts(posts, 'en').map((post) => ({
			title: post.title,
			description: post.excerpt,
			pubDate: post.publishedAt,
			link: postPath(post),
			categories: [...post.tags],
		})),
		customData: '<language>en</language>',
	});
}
