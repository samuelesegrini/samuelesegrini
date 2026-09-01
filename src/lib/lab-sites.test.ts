import { describe, expect, it } from 'vitest';
import type { PostDocument, ProjectDocument } from './portfolio';
import {
	labSitePages,
	labSitePath,
	labSiteThemes,
	selectLabSiteContent,
} from './lab-sites';

const projectDocument = (translationKey: string, featuredRank?: 1 | 2 | 3) => ({
	id: `${translationKey}.mdx`,
	collection: 'projects',
	data: {
		translationKey,
		locale: 'en',
		slug: translationKey,
		title: translationKey === 'easymanager' ? 'EasyManager' : translationKey === 'galaxy-trucker' ? 'Galaxy Trucker' : 'SpinGO',
		excerpt: `${translationKey} verified result.`,
		draft: false,
		coverImage: `/${translationKey}.svg`,
		coverAlt: `${translationKey} artwork`,
		kind: 'package',
		lifecycle: 'verified',
		authorship: 'individual',
		year: 2026,
		role: 'Engineer',
		technologies: ['Swift'],
		featuredRank,
		outcomes: [],
		links: [],
		relatedPosts: [],
	},
}) as ProjectDocument;

const articleDocument = {
	id: 'my-first-video-game.mdx',
	collection: 'posts',
	data: {
		translationKey: 'my-first-video-game',
		locale: 'en',
		slug: 'my-first-video-game-was-a-distributed-system',
		title: 'My first video game was a distributed system',
		excerpt: 'Several players need one shared world.',
		draft: false,
		coverImage: '/galaxy.svg',
		coverAlt: 'Shared multiplayer state',
		publishedAt: new Date('2026-08-27'),
		tags: ['Distributed systems'],
	},
} as PostDocument;

describe('lab site contract', () => {
	it('publishes three themes with four routes each', () => {
		expect(labSiteThemes).toEqual(['signal', 'monograph', 'atlas']);
		expect(labSitePages).toEqual(['home', 'projects', 'article', 'project']);
		expect(labSiteThemes.flatMap((theme) => labSitePages.map((page) => labSitePath(theme, page)))).toHaveLength(12);
		expect(labSitePath('signal', 'home')).toBe('/lab/sites/signal/');
		expect(labSitePath('atlas', 'project')).toBe('/lab/sites/atlas/project/');
	});

	it('selects the same ranked work and detail records for every theme', () => {
		const selected = selectLabSiteContent([
			projectDocument('spingo-sustainable-micromobility', 3),
			projectDocument('easymanager', 1),
			projectDocument('galaxy-trucker', 2),
		], [articleDocument]);
		expect(selected.featuredProjects.map(({ data }) => data.title)).toEqual(['EasyManager', 'Galaxy Trucker', 'SpinGO']);
		expect(selected.projectDocument.data.translationKey).toBe('easymanager');
		expect(selected.articleDocument.data.translationKey).toBe('my-first-video-game');
	});

	it('fails instead of substituting missing portfolio evidence', () => {
		expect(() => selectLabSiteContent([projectDocument('easymanager', 1)], [articleDocument])).toThrow('Lab sites require exactly three ranked English projects.');
	});
});
