/**
 * Elementi della barra che non cambiano da pagina a pagina: rotte, lingue, curriculum,
 * etichette. Stanno qui una volta sola, così le pagine del banco di prova non li ricopiano.
 */
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

export const experimentTicker =
	'Software engineer · Swift & iOS · Product engineering · Sistemi affidabili ·';

const rotte: ChromeRoute[] = [
	{ href: '/lab/index-experiment/', label: 'Home', kicker: '01 · Inizio', preview: 'preview-home', previewHtml: 'SS' },
	{ href: '/lab/progetti/', label: 'Progetti', kicker: '02 · Lavori selezionati', preview: 'preview-projects', previewHtml: '<i></i><i></i><i></i>' },
	{ href: '/lab/articoli/', label: 'Articoli', kicker: '03 · Note tecniche', preview: 'preview-writing', previewHtml: '<b>Aa</b><i></i><i></i>' },
	{ href: '/lab/chi-sono/', label: 'Chi sono', kicker: '04 · Profilo e CV', preview: 'preview-about', previewHtml: '' },
];

/** Le stesse rotte, con quella corrente marcata: la barra la evidenzia e ne mostra il nome. */
export function experimentRoutes(currentHref: string): ChromeRoute[] {
	return rotte.map((route) => ({ ...route, current: route.href === currentHref }));
}

export const experimentLanguages = (currentHref: string) =>
	[
		{ href: currentHref, label: 'IT', current: true },
		{ href: '/en/', label: 'EN', current: false },
	] as const;

// Nel repo non esiste ancora un PDF: finché non c'è, il curriculum porta alla pagina profilo.
export const experimentCv = {
	kicker: 'Curriculum',
	long: 'Scarica il PDF',
	short: 'PDF',
	aria: 'Scarica il curriculum in PDF',
	href: '/lab/chi-sono/',
};

export const experimentLabels = {
	top: 'Torna all’inizio',
	topCaption: 'Turna sü',
	mail: 'Invia una email',
	mailCaption: 'Scrìvum',
	language: 'Lingua',
	openMenu: 'Apri menu',
};
