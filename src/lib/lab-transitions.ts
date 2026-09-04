import type { TransitionDirectionalAnimations } from 'astro';

const toolbarTiming = {
	duration: 760,
	easing: 'linear',
	fillMode: 'both',
} as const;

/** Mantiene la barra condivisa ferma sopra i due snapshot completi della viewport. */
export const labToolbarTransition: TransitionDirectionalAnimations = {
	forwards: {
		old: { name: 'lab-toolbar-hide', ...toolbarTiming },
		new: { name: 'lab-toolbar-hold', ...toolbarTiming },
	},
	backwards: {
		old: { name: 'lab-toolbar-hide', ...toolbarTiming },
		new: { name: 'lab-toolbar-hold', ...toolbarTiming },
	},
};
