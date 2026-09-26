// Le anteprime non elencate dei racconti di progetto, una per progetto, nell'ordine in cui si
// leggono, in inglese (/en/preview/) e in italiano (/it/anteprima/). Servono a lavorarci sopra prima
// di farne le pagine vere: la fila le collega tra loro (precedente e successiva) e l'indice di
// ciascuna lingua le elenca tutte. Fuori dalla sitemap.
import { withBase } from './base';

export type PreviewTone = 'acid' | 'blue' | 'violet' | 'orange' | 'paper';
export type PreviewLang = 'en' | 'it';

interface Copy {
	text: string;
	/** Lo stato del racconto: quanto della pagina è già scritto con materiale vero. */
	status: string;
}

export interface Preview {
	key: string;
	title: string;
	tone: PreviewTone;
	en: Copy;
	it: Copy;
}

export const previews: readonly Preview[] = [
	{ key: 'poliverse', title: 'PoliVerse', tone: 'blue',
		en: { text: 'Your whole Politecnico, in one app.', status: 'Full story, illustrated' },
		it: { text: 'Tutto il tuo Politecnico, in un’app.', status: 'Racconto completo, illustrato' } },
	{ key: 'easymanager', title: 'EasyManager', tone: 'acid',
		en: { text: 'A restaurant’s orders, from the table to the fiscal printer.', status: 'Full story · screens to add' },
		it: { text: 'Le comande di un ristorante, dal tavolo alla stampante fiscale.', status: 'Racconto completo · schermate da aggiungere' } },
	{ key: 'galaxy-trucker', title: 'Galaxy Trucker', tone: 'violet',
		en: { text: 'A board game, as a distributed system.', status: 'Full story · captures to add' },
		it: { text: 'Un gioco da tavolo, come sistema distribuito.', status: 'Racconto completo · catture da aggiungere' } },
	{ key: 'spingo', title: 'SpinGO', tone: 'orange',
		en: { text: 'A safer ride, with the phone in your pocket.', status: 'Full story · prototype exports to add' },
		it: { text: 'Un giro più sicuro, con il telefono in tasca.', status: 'Racconto completo · esportazioni del prototipo da aggiungere' } },
	{ key: 'highway-route-planner', title: 'Highway Route Planner', tone: 'paper',
		en: { text: 'The fewest stops, and never an arbitrary one.', status: 'Short report · source to add' },
		it: { text: 'Il minor numero di tappe, e mai uno a caso.', status: 'Relazione breve · sorgente da aggiungere' } },
	{ key: 'priority-task-queue-manager', title: 'Priority Task Queue Manager', tone: 'paper',
		en: { text: 'When it says done, the memory already agrees.', status: 'Short report · waveform to draw' },
		it: { text: 'Quando dice fatto, la memoria è già d’accordo.', status: 'Relazione breve · forma d’onda da disegnare' } },
];

export const previewIndex = (lang: PreviewLang = 'en') => withBase(lang === 'it' ? '/it/anteprima/' : '/en/preview/');
export const previewPath = (key: string, lang: PreviewLang = 'en') => `${previewIndex(lang)}${key}/`;
export const previewCover = (key: string) => withBase(`/images/projects/covers/${key}.svg`);

/** La precedente e la successiva nella fila, per KeepExploring: la fila gira su sé stessa. */
export function neighbours(key: string, lang: PreviewLang = 'en') {
	const i = previews.findIndex((p) => p.key === key);
	const at = (k: number) => previews[(k + previews.length) % previews.length];
	const words = lang === 'it' ? { next: 'Anteprima successiva', previous: 'Anteprima precedente' } : { next: 'Next preview', previous: 'Previous preview' };
	const card = (p: Preview, label: string) => ({ label, title: p.title, text: p[lang].text, href: previewPath(p.key, lang), image: previewCover(p.key), tone: p.tone });
	return { next: card(at(i + 1), words.next), previous: card(at(i - 1), words.previous) };
}
