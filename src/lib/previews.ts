// Le anteprime non elencate dei racconti di progetto, una per progetto, nell'ordine in cui si
// leggono. Servono a lavorarci sopra prima di farne le pagine vere: la fila le collega tra loro
// (precedente e successiva) e l'indice di /en/preview/ le elenca tutte. Fuori dalla sitemap.
import { withBase } from './base';

export type PreviewTone = 'acid' | 'blue' | 'violet' | 'orange' | 'paper';

export interface Preview {
	key: string;
	title: string;
	text: string;
	/** Lo stato del racconto: quanto della pagina è già scritto con materiale vero. */
	status: string;
	tone: PreviewTone;
}

export const previews: readonly Preview[] = [
	{ key: 'poliverse', title: 'PoliVerse', text: 'Your whole Politecnico, in one app.', status: 'Full story, illustrated', tone: 'blue' },
	{ key: 'easymanager', title: 'EasyManager', text: 'A restaurant’s orders, from the table to the fiscal printer.', status: 'Full story · screens to add', tone: 'acid' },
	{ key: 'galaxy-trucker', title: 'Galaxy Trucker', text: 'A board game, as a distributed system.', status: 'Full story · captures to add', tone: 'violet' },
	{ key: 'spingo', title: 'SpinGO', text: 'A safer ride, with the phone in your pocket.', status: 'Full story · prototype exports to add', tone: 'orange' },
	{ key: 'highway-route-planner', title: 'Highway Route Planner', text: 'The fewest stops, and never an arbitrary one.', status: 'Short report · source to add', tone: 'paper' },
	{ key: 'priority-task-queue-manager', title: 'Priority Task Queue Manager', text: 'When it says done, the memory already agrees.', status: 'Short report · waveform to draw', tone: 'paper' },
];

export const previewPath = (key: string) => withBase(`/en/preview/${key}/`);
export const previewCover = (key: string) => withBase(`/images/projects/covers/${key}.svg`);

/** La precedente e la successiva nella fila, per KeepExploring: la fila gira su sé stessa. */
export function neighbours(key: string) {
	const i = previews.findIndex((p) => p.key === key);
	const at = (k: number) => previews[(k + previews.length) % previews.length];
	const card = (p: Preview, label: string) => ({ label, title: p.title, text: p.text, href: previewPath(p.key), image: previewCover(p.key), tone: p.tone });
	return { next: card(at(i + 1), 'Next preview'), previous: card(at(i - 1), 'Previous preview') };
}
