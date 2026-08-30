import { describe, expect, test } from 'vitest';
import {
	getFeaturedProjects,
	getProjectKinds,
	getPublishedPosts,
	getTranslationPair,
	validateContentSet,
	type PostEntry,
	type ProjectEntry,
} from './content';

const projects = [
	{
		translationKey: 'project-one',
		locale: 'it',
		slug: 'progetto-uno',
		title: 'Progetto uno',
		excerpt: 'Tre schermate sostituiscono un flusso manuale di quindici passaggi.',
		draft: false,
		coverImage: '/images/placeholders/project-one.png',
		coverAlt: 'Composizione astratta verde',
		kind: 'app',
		lifecycle: 'verified',
		authorship: 'individual',
		year: 2026,
		role: 'Software Engineer',
		technologies: ['Swift'],
		featuredRank: 1,
		outcomes: [{ value: '3', label: 'schermate' }],
		links: [
			{
				url: 'https://example.com/repo',
				label: 'Repository',
				relationship: 'my-repository',
			},
		],
		relatedPosts: [{ key: 'post-one', reason: 'Come sono arrivato a tre schermate.' }],
	},
	{
		translationKey: 'project-one',
		locale: 'en',
		slug: 'project-one',
		title: 'Project one',
		excerpt: 'Three screens replace a fifteen-step manual flow.',
		draft: false,
		coverImage: '/images/placeholders/project-one.png',
		coverAlt: 'Abstract green composition',
		kind: 'app',
		lifecycle: 'verified',
		authorship: 'individual',
		year: 2026,
		role: 'Software Engineer',
		technologies: ['Swift'],
		featuredRank: 1,
		outcomes: [{ value: '3', label: 'screens' }],
		links: [
			{
				url: 'https://example.com/repo',
				label: 'Repository',
				relationship: 'my-repository',
			},
		],
		relatedPosts: [{ key: 'post-one', reason: 'How the flow became three screens.' }],
	},
	...(['two', 'three'] as const).flatMap<ProjectEntry>((name, index) => [
		{
			translationKey: `project-${name}`,
			locale: 'it',
			slug: `progetto-${name}`,
			title: `Progetto ${name}`,
			excerpt: 'Il modulo dimezza il tempo di build su ogni commit.',
			draft: false,
			coverImage: `/images/placeholders/project-${name}.png`,
			coverAlt: 'Composizione astratta',
			kind: index === 0 ? 'package' : 'experiment',
			lifecycle: index === 0 ? 'verified' : 'prototype',
			authorship: 'individual',
			year: 2026,
			role: 'Software Engineer',
			technologies: ['TypeScript'],
			featuredRank: (index + 2) as 2 | 3,
			outcomes: [],
			links: [],
			relatedPosts: [],
		},
		{
			translationKey: `project-${name}`,
			locale: 'en',
			slug: `project-${name}`,
			title: `Project ${name}`,
			excerpt: 'The module halves build time on every commit.',
			draft: false,
			coverImage: `/images/placeholders/project-${name}.png`,
			coverAlt: 'Abstract composition',
			kind: index === 0 ? 'package' : 'experiment',
			lifecycle: index === 0 ? 'verified' : 'prototype',
			authorship: 'individual',
			year: 2026,
			role: 'Software Engineer',
			technologies: ['TypeScript'],
			featuredRank: (index + 2) as 2 | 3,
			outcomes: [],
			links: [],
			relatedPosts: [],
		},
	]),
] satisfies readonly ProjectEntry[];

const posts = [
	{
		translationKey: 'post-one',
		locale: 'it',
		slug: 'nota-uno',
		title: 'Nota uno',
		excerpt: 'Descrizione italiana.',
		draft: false,
		coverImage: '/images/placeholders/post-one.png',
		coverAlt: 'Composizione editoriale',
		publishedAt: new Date('2026-08-20'),
		tags: ['Swift'],
		relatedProjectKey: 'project-one',
	},
	{
		translationKey: 'post-one',
		locale: 'en',
		slug: 'note-one',
		title: 'Note one',
		excerpt: 'English description.',
		draft: false,
		coverImage: '/images/placeholders/post-one.png',
		coverAlt: 'Editorial composition',
		publishedAt: new Date('2026-08-20'),
		tags: ['Swift'],
		relatedProjectKey: 'project-one',
	},
] satisfies readonly PostEntry[];

describe('validateContentSet', () => {
	test('accepts complete bilingual content with exactly three featured projects', () => {
		expect(validateContentSet(projects, posts)).toEqual([]);
	});

	test('rejects a published entry without its translation', () => {
		const italianProjects = projects.filter((project) => project.locale === 'it');
		expect(validateContentSet(italianProjects, posts)).toContain(
			'Project "project-one" must have published it and en translations.',
		);
	});

	test('rejects shared project metadata that differs between translations', () => {
		const mismatched = projects.map((project) =>
			project.translationKey === 'project-one' && project.locale === 'en'
				? { ...project, year: 2025 }
				: project,
		);
		expect(validateContentSet(mismatched, posts)).toContain(
			'Project "project-one" must share kind, lifecycle, authorship, year, technologies, rank, and relationships.',
		);
	});

	test('rejects an outcome list whose length differs between translations', () => {
		const mismatched = projects.map((project) =>
			project.translationKey === 'project-one' && project.locale === 'en'
				? { ...project, outcomes: [] }
				: project,
		);
		expect(validateContentSet(mismatched, posts)).toContain(
			'Project "project-one" must report the same number of outcomes in each locale.',
		);
	});

	test('rejects lifecycle or authorship that differs between translations', () => {
		const mismatched = projects.map((project) =>
			project.translationKey === 'project-one' && project.locale === 'en'
				? { ...project, lifecycle: 'archived' as const, authorship: 'team' as const }
				: project,
		);
		expect(validateContentSet(mismatched, posts)).toContain(
			'Project "project-one" must share kind, lifecycle, authorship, year, technologies, rank, and relationships.',
		);
	});

	test('rejects outcome values that drift between translations', () => {
		const mismatched = projects.map((project) =>
			project.translationKey === 'project-one' && project.locale === 'en'
				? { ...project, outcomes: [{ value: '4', label: 'screens' }] }
				: project,
		);
		expect(validateContentSet(mismatched, posts)).toContain(
			'Project "project-one" must report the same outcome values in each locale.',
		);
	});

	test('rejects external links that differ in destination or relationship between translations', () => {
		const mismatched = projects.map((project) =>
			project.translationKey === 'project-one' && project.locale === 'en'
				? {
						...project,
						links: [
							{
								url: 'https://example.com/repo',
								label: 'Repository',
								relationship: 'team-repository' as const,
							},
						],
					}
				: project,
		);
		expect(validateContentSet(mismatched, posts)).toContain(
			'Project "project-one" must share kind, lifecycle, authorship, year, technologies, rank, and relationships.',
		);
	});

	test('rejects shared post metadata that differs between translations', () => {
		const mismatched = posts.map((post) =>
			post.locale === 'en' ? { ...post, publishedAt: new Date('2026-08-19') } : post,
		);
		expect(validateContentSet(projects, mismatched)).toContain(
			'Post "post-one" must share publication dates, tags, and project relationship.',
		);
	});

	test('rejects related-content keys that do not resolve to published bilingual content', () => {
		const brokenProjects = projects.map((project) =>
			project.translationKey === 'project-one'
				? { ...project, relatedPosts: [{ key: 'missing-post', reason: 'Perché.' }] }
				: project,
		);
		expect(validateContentSet(brokenProjects, posts)).toContain(
			'Project "project-one" references missing published post "missing-post".',
		);
	});

	test('rejects duplicate localized slugs', () => {
		const duplicated = projects.map((project) =>
			project.translationKey === 'project-two' && project.locale === 'en'
				? { ...project, slug: 'project-one' }
				: project,
		);
		expect(validateContentSet(duplicated, posts)).toContain(
			'Project slug "en/project-one" must be unique.',
		);
	});

	test('rejects blank image alternatives and malformed project links', () => {
		const malformed = projects.map((project) =>
			project.translationKey === 'project-one' && project.locale === 'it'
				? {
						...project,
						coverAlt: ' ',
						links: [
							{ url: 'not-a-url', label: 'Repository', relationship: 'my-repository' as const },
						],
					}
				: project,
		);
		const errors = validateContentSet(malformed, posts);
		expect(errors).toContain('Project "project-one" requires cover alternative text.');
		expect(errors).toContain('Project "project-one" contains an invalid external URL.');
	});

	test('rejects missing or duplicated featured ranks per locale', () => {
		const missingRank = projects.map((project) =>
			project.translationKey === 'project-three' ? { ...project, featuredRank: undefined } : project,
		);
		expect(validateContentSet(missingRank, posts)).toContain(
			'Locale "it" must contain featured project ranks 1, 2, and 3 exactly once.',
		);
	});
});

describe('project excerpts read as outcome decks', () => {
	const withExcerpt = (excerpt: string, locale: 'it' | 'en' = 'en') =>
		projects.map((project) =>
			project.translationKey === 'project-one' && project.locale === locale
				? { ...project, excerpt }
				: project,
		);

	test.each([
		['A C program that manages service stations and electric vehicles.', 'en'],
		['An HCI project that turns user research into a mobile ecosystem.', 'en'],
		['Un componente hardware che mantiene una coda ordinata in RAM.', 'it'],
		['Una piccola esplorazione per mostrare curiosità visiva.', 'it'],
		["Un'app che riordina la coda dei task.", 'it'],
	] as const)('rejects the category-noun opening %j', (excerpt, locale) => {
		expect(validateContentSet(withExcerpt(excerpt, locale), posts)).toContain(
			`Project "project-one" (${locale}) excerpt must not open with an indefinite article.`,
		);
	});

	test('accepts a deck that opens with a number, a subject, or a definite article', () => {
		for (const excerpt of [
			'109 survey responses became an app scoring 89.2 SUS.',
			'Binary search plans the fewest-stop route while stations keep changing.',
			'The module halves build time on every commit.',
		]) {
			expect(validateContentSet(withExcerpt(excerpt), posts)).toEqual([]);
		}
	});

	test('rejects a deck longer than twenty-five words', () => {
		const longDeck = `Four people shipped ${'word '.repeat(23)}today.`;
		expect(validateContentSet(withExcerpt(longDeck), posts)).toContain(
			'Project "project-one" (en) excerpt must stay within 25 words.',
		);
	});
});

describe('content queries', () => {
	test('excludes a bilingual draft project from featured work', () => {
		const drafts: ProjectEntry[] = (['it', 'en'] as const).map((locale) => ({
			...projects.find((project) => project.locale === locale)!,
			translationKey: 'easymanager',
			slug:
				locale === 'it'
					? 'easymanager-sistema-ristorazione'
					: 'easymanager-restaurant-operations',
			title: 'EasyManager',
			draft: true,
			featuredRank: 1,
		}));

		expect(
			getFeaturedProjects([...projects, ...drafts], 'it').map(({ translationKey }) => translationKey),
		).not.toContain('easymanager');
	});

	test('returns the requested localized translation', () => {
		expect(getTranslationPair(posts, 'post-one', 'en')?.slug).toBe('note-one');
	});

	test('sorts featured projects by rank and excludes other locales', () => {
		expect(getFeaturedProjects(projects, 'it').map((project) => project.featuredRank)).toEqual([
			1, 2, 3,
		]);
	});

	test('sorts published posts newest first and excludes drafts', () => {
		const draft = { ...posts[0], translationKey: 'draft', slug: 'draft', draft: true };
		expect(getPublishedPosts([...posts, draft], 'it').map((post) => post.slug)).toEqual([
			'nota-uno',
		]);
	});

	test('derives only project kinds represented in a locale', () => {
		expect(getProjectKinds(projects, 'en')).toEqual(['app', 'package', 'experiment']);
	});
});
