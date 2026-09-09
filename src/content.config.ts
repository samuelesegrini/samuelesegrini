import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const locale = z.enum(['it', 'en']);
const slug = z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const localizedFields = {
	translationKey: z.string().min(1),
	locale,
	slug,
	title: z.string().min(1),
	/**
	 * The deck. For a project this is one sentence stating a result — see the deck rules in
	 * README.md; `validateProjectDecks` in src/lib/content.ts enforces the mechanical half.
	 */
	excerpt: z.string().min(1),
	draft: z.boolean().default(true),
	coverImage: z.string().min(1),
	coverAlt: z.string().trim().min(1),
	/** Overrides `coverImage` for og:image and twitter:image when a crop reads badly at card size. */
	socialImage: z.string().min(1).optional(),
	seoTitle: z.string().min(1).optional(),
	seoDescription: z.string().min(1).optional(),
};

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		...localizedFields,
		kind: z.enum(['app', 'package', 'open-source', 'experiment']),
		lifecycle: z.enum(['verified', 'archived', 'prototype', 'in-progress']),
		authorship: z.enum(['individual', 'team', 'contribution']),
		year: z.number().int().min(1990).max(2100),
		role: z.string().min(1),
		technologies: z.array(z.string().min(1)).min(1),
		featuredRank: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
		outcomes: z
			.array(
				z.object({
					value: z.string().min(1),
					label: z.string().min(1),
					/** How the value was obtained. A portfolio has no customer name to serve as warrant. */
					method: z.string().min(1).optional(),
				}),
			)
			.max(4)
			.default([]),
		/** The displaced baseline: what the work was measured against, in one line. */
		startingPoint: z.string().min(1).optional(),
		/** At most one, and only for a judgement the narrator cannot honestly make about themselves. */
		testimonial: z
			.object({
				quote: z.string().min(1),
				name: z.string().min(1),
				role: z.string().min(1),
			})
			.optional(),
		links: z
			.array(
				z.object({
					url: z.url(),
					label: z.string().min(1),
					relationship: z.enum([
						'my-repository',
						'team-repository',
						'live-demo',
						'write-up',
						'course-page',
					]),
				}),
			)
			.default([]),
		relatedPosts: z
			.array(z.object({ key: z.string().min(1), reason: z.string().min(1) }))
			.default([]),
	}),
});

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		...localizedFields,
		publishedAt: z.coerce.date(),
		updatedAt: z.coerce.date().optional(),
		tags: z.array(z.string().min(1)).default([]),
		relatedProjectKey: z.string().min(1).optional(),
	}),
});

const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		translationKey: z.literal('about'),
		locale,
		title: z.string().min(1),
		excerpt: z.string().min(1),
		draft: z.boolean().default(true),
		seoTitle: z.string().min(1).optional(),
		seoDescription: z.string().min(1).optional(),
	}),
});

/**
 * Testi del banco di prova. Stanno in una collection e non nei componenti, così la copy si
 * modifica dove sta il resto dei contenuti e le due lingue restano allineate per costruzione:
 * lo schema vale per entrambe, quindi una chiave dimenticata da un lato non compila.
 */
const labCopy = defineCollection({
	loader: glob({ base: './src/content/lab-copy', pattern: '*.json' }),
	schema: z.object({
		locale,
		/** Il riassunto del sito per motori di ricerca e anteprime social. */
		description: z.string().min(1),
		ticker: z.string().min(1),
		nav: z.array(z.object({ label: z.string().min(1), kicker: z.string().min(1) })).length(4),
		toolbar: z.object({
			top: z.string().min(1),
			topCaption: z.string().min(1),
			/** Contiene {email}, sostituito con l'indirizzo di siteConfig. */
			mail: z.string().min(1),
			mailSending: z.string().min(1),
			mailSent: z.string().min(1),
			mailCaption: z.string().min(1),
			language: z.string().min(1),
			openMenu: z.string().min(1),
		}),
		cv: z.object({ kicker: z.string().min(1), long: z.string().min(1), short: z.string().min(1), aria: z.string().min(1) }),
		footer: z.object({ invito: z.string().min(1), scrivimi: z.string().min(1), navigazione: z.string().min(1), altrove: z.string().min(1), colofone: z.string().min(1), fattoCon: z.string().min(1), caratteri: z.string().min(1), diritti: z.string().min(1), lingua: z.string().min(1) }),
		common: z.object({ section: z.string().min(1), one: z.string().min(1), many: z.string().min(1), label: z.string().min(1), ready: z.string().min(1) }),
		home: z.object({
			title: z.string().min(1), headline: z.string().min(1), emphasis: z.string().min(1), intro: z.string().min(1),
			work: z.string().min(1), workText: z.string().min(1), allWork: z.string().min(1),
			writing: z.string().min(1), writingText: z.string().min(1), allWriting: z.string().min(1),
			path: z.string().min(1), pathText: z.string().min(1), aboutLink: z.string().min(1),
			/** Le tappe del percorso, in ordine cronologico. `project` è lo slug locale da collegare. */
			milestones: z.array(z.object({
				year: z.string().min(1), where: z.string().min(1), label: z.string().min(1),
				text: z.string().min(1), project: z.string().min(1).optional(),
			})).min(1),
			contact: z.string().min(1), contactText: z.string().min(1), mailLink: z.string().min(1),
			projects: z.string().min(1), articles: z.string().min(1), experience: z.string().min(1),
			years: z.string().min(1), reply: z.string().min(1), within: z.string().min(1),
		}),
		work: z.object({
			title: z.string().min(1), eyebrow: z.string().min(1), headline: z.string().min(1), emphasis: z.string().min(1),
			intro: z.string().min(1), one: z.string().min(1), many: z.string().min(1),
			kinds: z.record(z.enum(['app', 'package', 'open-source', 'experiment']), z.object({ label: z.string().min(1), text: z.string().min(1) })),
		}),
		writing: z.object({
			title: z.string().min(1), eyebrow: z.string().min(1), topic: z.string().min(1), headline: z.string().min(1),
			emphasis: z.string().min(1), intro: z.string().min(1), on: z.string().min(1), one: z.string().min(1), many: z.string().min(1),
		}),
		about: z.object({
			title: z.string().min(1), fallbackTitle: z.string().min(1), fallbackExcerpt: z.string().min(1), mailLink: z.string().min(1),
			sections: z.array(z.object({
				id: z.string().min(1), label: z.string().min(1), text: z.string().min(1),
				detailKicker: z.string().min(1),
				/** Può contenere {projects}, sostituito con il numero in archivio. */
				detailValue: z.string().min(1),
			})).length(3),
		}),
		projectDetail: z.object({
			eyebrow: z.string().min(1), body: z.string().min(1), results: z.string().min(1),
			tech: z.string().min(1), role: z.string().min(1), year: z.string().min(1), back: z.string().min(1),
		}),
		postDetail: z.object({
			eyebrow: z.string().min(1), body: z.string().min(1), topics: z.string().min(1),
			published: z.string().min(1), back: z.string().min(1),
		}),
	}),
});

export const collections = { projects, posts, pages, labCopy };
