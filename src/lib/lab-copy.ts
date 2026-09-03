import { getCollection } from 'astro:content';
import type { LabLocale } from '../components/lab/chrome';
import { siteConfig } from '../config/site';

/**
 * I testi del banco di prova, per lingua. Lo schema della collection garantisce che le due
 * lingue abbiano le stesse chiavi, quindi qui non serve nessun fallback fra locali.
 */
export async function getLabCopy(lang: LabLocale) {
	const voci = await getCollection('labCopy');
	const voce = voci.find((entry) => entry.data.locale === lang);
	if (!voce) throw new Error(`Testi del banco di prova mancanti per "${lang}"`);
	return voce.data;
}

export type LabCopy = Awaited<ReturnType<typeof getLabCopy>>;

/** Sostituisce i segnaposto scritti nella copy, es. {email} o {projects}. */
export function riempi(testo: string, valori: Record<string, string | number> = {}): string {
	return testo.replace(/\{(\w+)\}/g, (intero, chiave) =>
		chiave === 'email' ? siteConfig.email : String(valori[chiave] ?? intero));
}
