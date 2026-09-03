/**
 * Elementi della barra che non cambiano da pagina a pagina, declinati per lingua.
 * I percorsi rispecchiano quelli veri del sito (progetti/projects, articoli/writing),
 * così sostituire le rotte definitive sarà un cambio di prefisso, non di struttura.
 */
import { siteConfig } from '../../config/site';

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

export const labPaths = {
	it: { home: '/lab/it/', work: '/lab/it/progetti/', writing: '/lab/it/articoli/', about: '/lab/it/chi-sono/' },
	en: { home: '/lab/en/', work: '/lab/en/projects/', writing: '/lab/en/writing/', about: '/lab/en/about/' },
} as const;

export const labProjectPath = (lang: LabLocale, slug: string) => `${labPaths[lang].work}${slug}/`;
export const labPostPath = (lang: LabLocale, slug: string) => `${labPaths[lang].writing}${slug}/`;

export const mailHref = `mailto:${siteConfig.email}`;

export const experimentTicker: Record<LabLocale, string> = {
	it: 'Software engineer · Swift & iOS · Product engineering · Sistemi affidabili ·',
	en: 'Software engineer · Swift & iOS · Product engineering · Reliable systems ·',
};

const voci: Record<LabLocale, ChromeRoute[]> = {
	it: [
		{ href: labPaths.it.home, label: 'Home', kicker: '01 · Inizio', preview: 'preview-home', previewHtml: 'SS' },
		{ href: labPaths.it.work, label: 'Progetti', kicker: '02 · Lavori selezionati', preview: 'preview-projects', previewHtml: '<i></i><i></i><i></i>' },
		{ href: labPaths.it.writing, label: 'Articoli', kicker: '03 · Note tecniche', preview: 'preview-writing', previewHtml: '<b>Aa</b><i></i><i></i>' },
		{ href: labPaths.it.about, label: 'Chi sono', kicker: '04 · Profilo e CV', preview: 'preview-about', previewHtml: '' },
	],
	en: [
		{ href: labPaths.en.home, label: 'Home', kicker: '01 · Start', preview: 'preview-home', previewHtml: 'SS' },
		{ href: labPaths.en.work, label: 'Projects', kicker: '02 · Selected work', preview: 'preview-projects', previewHtml: '<i></i><i></i><i></i>' },
		{ href: labPaths.en.writing, label: 'Writing', kicker: '03 · Technical notes', preview: 'preview-writing', previewHtml: '<b>Aa</b><i></i><i></i>' },
		{ href: labPaths.en.about, label: 'About', kicker: '04 · Profile and CV', preview: 'preview-about', previewHtml: '' },
	],
};

/**
 * Le rotte della lingua, con quella corrente marcata. Un dettaglio non coincide con nessuna
 * voce: `sezione` permette di evidenziare comunque l'archivio da cui proviene.
 */
export function experimentRoutes(lang: LabLocale, currentHref: string): ChromeRoute[] {
	return voci[lang].map((route) => ({ ...route, current: currentHref.startsWith(route.href) && route.href !== labPaths[lang].home
		? true
		: route.href === currentHref }));
}

/** L'altra lingua punta alla pagina corrispondente, non alla sua home. */
export function experimentLanguages(lang: LabLocale, itHref: string, enHref: string): readonly [ToolbarLanguage, ToolbarLanguage] {
	return [
		{ href: itHref, label: 'IT', current: lang === 'it' },
		{ href: enHref, label: 'EN', current: lang === 'en' },
	] as const;
}

// Nel repo non esiste ancora un PDF: finché non c'è, il curriculum porta alla pagina profilo.
export const experimentCv = (lang: LabLocale) => lang === 'it'
	? { kicker: 'Curriculum', long: 'Scarica il PDF', short: 'PDF', aria: 'Scarica il curriculum in PDF', href: labPaths.it.about }
	: { kicker: 'Résumé', long: 'Download the PDF', short: 'PDF', aria: 'Download the résumé as PDF', href: labPaths.en.about };

export const experimentLabels = (lang: LabLocale) => lang === 'it'
	? {
		top: 'Torna all’inizio',
		topCaption: 'Turna sü',
		mail: `Scrivimi a ${siteConfig.email}`,
		mailSending: 'Apertura del client di posta',
		mailSent: 'Client di posta aperto',
		mailCaption: 'Scrìvum',
		language: 'Lingua',
		openMenu: 'Apri menu',
	}
	: {
		top: 'Back to the top',
		topCaption: 'Turna sü',
		mail: `Email me at ${siteConfig.email}`,
		mailSending: 'Opening your mail client',
		mailSent: 'Mail client opened',
		mailCaption: 'Scrìvum',
		language: 'Language',
		openMenu: 'Open menu',
	};
