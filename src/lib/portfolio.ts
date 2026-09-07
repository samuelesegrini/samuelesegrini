import { getCollection, type CollectionEntry } from 'astro:content';
import { validateContentSet, type Locale, type PostEntry, type ProjectEntry } from './content';
import { withBase } from './base';

export type ProjectDocument = CollectionEntry<'projects'>;
export type PostDocument = CollectionEntry<'posts'>;
export type AboutDocument = CollectionEntry<'pages'>;

export interface PortfolioContent {
	projectDocuments: ProjectDocument[];
	postDocuments: PostDocument[];
	aboutDocuments: AboutDocument[];
	projects: ProjectEntry[];
	posts: PostEntry[];
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
	const [projectDocuments, postDocuments, aboutDocuments] = await Promise.all([
		getCollection('projects'),
		getCollection('posts'),
		getCollection('pages'),
	]);
	const projects = projectDocuments.map(({ data }) => data) satisfies ProjectEntry[];
	const posts = postDocuments.map(({ data }) => data) satisfies PostEntry[];
	const errors = validateContentSet(projects, posts);
	validateAboutPages(aboutDocuments, errors);

	if (errors.length > 0) {
		throw new Error(`Portfolio content validation failed:\n- ${[...new Set(errors)].join('\n- ')}`);
	}

	return { projectDocuments, postDocuments, aboutDocuments, projects, posts };
}

export function findProjectDocument(
	documents: readonly ProjectDocument[],
	translationKey: string,
	locale: Locale,
): ProjectDocument | undefined {
	return documents.find(
		(document) =>
			!document.data.draft &&
			document.data.translationKey === translationKey &&
			document.data.locale === locale,
	);
}

export function findPostDocument(
	documents: readonly PostDocument[],
	translationKey: string,
	locale: Locale,
): PostDocument | undefined {
	return documents.find(
		(document) =>
			!document.data.draft &&
			document.data.translationKey === translationKey &&
			document.data.locale === locale,
	);
}

export function projectPath(project: ProjectEntry): string {
	return withBase(project.locale === 'it' ? `/it/progetti/${project.slug}/` : `/en/projects/${project.slug}/`);
}

export function postPath(post: PostEntry): string {
	return withBase(post.locale === 'it' ? `/it/articoli/${post.slug}/` : `/en/writing/${post.slug}/`);
}

function validateAboutPages(documents: readonly AboutDocument[], errors: string[]) {
	for (const locale of ['it', 'en'] as const) {
		const matches = documents.filter(
			(document) => !document.data.draft && document.data.locale === locale,
		);
		if (matches.length !== 1) {
			errors.push(`Locale "${locale}" must contain exactly one published About page.`);
		}
	}
}
