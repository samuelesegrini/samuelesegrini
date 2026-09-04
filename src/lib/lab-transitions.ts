import type { TransitionDirectionalAnimations } from 'astro';

const toolbarTiming = {
	duration: 760,
	easing: 'linear',
	fillMode: 'both',
} as const;

/** Mantiene la barra condivisa ferma sopra i due snapshot completi della viewport. */
const passo = {
	old: { name: 'lab-toolbar-hide', ...toolbarTiming },
	new: { name: 'lab-toolbar-hold', ...toolbarTiming },
} as const;

/** Avanti e indietro fanno la stessa cosa: la barra non si muove in nessuna delle due direzioni. */
export const labToolbarTransition: TransitionDirectionalAnimations = { forwards: passo, backwards: passo };
