import type { PostDocument, ProjectDocument } from './portfolio';

export const labSiteThemes = ['signal', 'monograph', 'atlas'] as const;
export const labSitePages = ['home', 'projects', 'article', 'project'] as const;
export type LabSiteTheme = (typeof labSiteThemes)[number];
export type LabSitePage = (typeof labSitePages)[number];

export interface LabSiteContent {
	allProjects: readonly ProjectDocument[];
	featuredProjects: readonly ProjectDocument[];
	projectDocument: ProjectDocument;
	articleDocument: PostDocument;
}

export function labSitePath(theme: LabSiteTheme, page: LabSitePage): string {
	return page === 'home' ? `/lab/sites/${theme}/` : `/lab/sites/${theme}/${page}/`;
}

export function selectLabSiteContent(
	projectDocuments: readonly ProjectDocument[],
	postDocuments: readonly PostDocument[],
): LabSiteContent {
	const allProjects = projectDocuments.filter(({ data }) => !data.draft && data.locale === 'en');
	const featuredProjects = allProjects
		.filter(({ data }) => data.featuredRank !== undefined)
		.toSorted((left, right) => left.data.featuredRank! - right.data.featuredRank!);
	if (featuredProjects.length !== 3) throw new Error('Lab sites require exactly three ranked English projects.');
	const projectDocument = allProjects.find(({ data }) => data.translationKey === 'easymanager');
	if (!projectDocument) throw new Error('Lab sites require the English EasyManager project.');
	const articleDocument = postDocuments.find(({ data }) => !data.draft && data.locale === 'en' && data.translationKey === 'my-first-video-game');
	if (!articleDocument) throw new Error('Lab sites require the English first-game article.');
	return { allProjects, featuredProjects, projectDocument, articleDocument };
}

export async function getLabSiteContent(): Promise<LabSiteContent> {
	const { getPortfolioContent } = await import('./portfolio');
	const { projectDocuments, postDocuments } = await getPortfolioContent();
	return selectLabSiteContent(projectDocuments, postDocuments);
}
