/**
 * Elementi della barra che non cambiano da pagina a pagina, declinati per lingua.
 * I percorsi sono quelli veri del sito, con il prefisso di GitHub Pages davanti.
 */
import { siteConfig } from '../../config/site';
import { base } from '../../lib/base';

export type LabLocale = 'it' | 'en';

export interface ToolbarSection {
	kicker: string;
	value: string;
	detail: { kicker: string; value: string };
}

export interface ToolbarLanguage { href: string; label: string; current: boolean }

export interface ChromeRoute {
	href: string;
	label: string;
	kicker: string;
	preview: string;
	previewHtml: string;
	current?: boolean;
}

export const labPaths: Record<LabLocale, { home: string; work: string; writing: string; about: string }> = {
	it: { home: `${base}/it/`, work: `${base}/it/progetti/`, writing: `${base}/it/articoli/`, about: `${base}/it/chi-sono/` },
	en: { home: `${base}/en/`, work: `${base}/en/projects/`, writing: `${base}/en/writing/`, about: `${base}/en/about/` },
};

export const labProjectPath = (lang: LabLocale, slug: string) => `${labPaths[lang].work}${slug}/`;
export const labPostPath = (lang: LabLocale, slug: string) => `${labPaths[lang].writing}${slug}/`;

export const mailHref = `mailto:${siteConfig.email}`;

/**
 * Le rotte della lingua, con quella corrente marcata. Un dettaglio non coincide con nessuna
 * voce: `sezione` permette di evidenziare comunque l'archivio da cui proviene.
 */
/** Struttura e ordine stanno qui; le etichette arrivano dalla collection dei testi. */
const anatomia = [
	{ chiave: 'home', preview: 'preview-home', previewHtml: 'SS' },
	{ chiave: 'work', preview: 'preview-projects', previewHtml: '<i></i><i></i><i></i>' },
	{ chiave: 'writing', preview: 'preview-writing', previewHtml: '<b>Aa</b><i></i><i></i>' },
	{ chiave: 'about', preview: 'preview-about', previewHtml: '' },
] as const;

export function experimentRoutes(
	lang: LabLocale,
	currentHref: string,
	nav: readonly { label: string; kicker: string }[],
): ChromeRoute[] {
	return anatomia.map((voce, i) => {
		const href = labPaths[lang][voce.chiave];
		// un dettaglio non coincide con nessuna voce: evidenzia comunque il suo archivio
		const current = href === labPaths[lang].home ? currentHref === href : currentHref.startsWith(href);
		return { href, label: nav[i].label, kicker: nav[i].kicker, preview: voce.preview, previewHtml: voce.previewHtml, current };
	});
}

/** L'altra lingua punta alla pagina corrispondente, non alla sua home. */
export function experimentLanguages(lang: LabLocale, itHref: string, enHref: string): readonly [ToolbarLanguage, ToolbarLanguage] {
	return [
		{ href: itHref, label: 'IT', current: lang === 'it' },
		{ href: enHref, label: 'EN', current: lang === 'en' },
	] as const;
}

