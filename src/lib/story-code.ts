/**
 * I colori del codice nei racconti: gli stessi pastelli del sito su inchiostro, e le loro versioni
 * scure su carta. Ogni coppia testo-fondo supera 4.5:1, anche sulle righe attenuate di CodeSteps
 * (opacità .78), per questo commenti e punteggiatura sul nero sono più chiari del solito.
 */
import type { ShikiTransformer, ThemeRegistration } from 'shiki';

interface Palette { background: string; foreground: string; comment: string; punctuation: string; keyword: string; type: string; func: string; string: string; number: string; tag: string; attribute: string }

function theme(name: string, type: 'dark' | 'light', p: Palette): ThemeRegistration {
	const rule = (scope: string[], foreground: string, fontStyle?: string) => ({ scope, settings: fontStyle ? { foreground, fontStyle } : { foreground } });
	return {
		name,
		type,
		colors: { 'editor.background': p.background, 'editor.foreground': p.foreground },
		settings: [
			{ settings: { background: p.background, foreground: p.foreground } },
			rule(['comment', 'punctuation.definition.comment'], p.comment, 'italic'),
			rule(['punctuation', 'meta.brace', 'keyword.operator'], p.punctuation),
			rule(['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.other', 'variable.language'], p.keyword),
			rule(['entity.name.type', 'entity.name.class', 'entity.other.inherited-class', 'support.type', 'support.class', 'entity.name.namespace'], p.type),
			rule(['entity.name.function', 'support.function', 'meta.function-call entity.name.function', 'variable.function'], p.func),
			rule(['string', 'punctuation.definition.string', 'string.quoted'], p.string),
			rule(['constant.numeric', 'constant.language', 'constant.character', 'constant.other', 'support.constant'], p.number),
			rule(['entity.name.tag', 'punctuation.definition.tag', 'meta.tag.preprocessor'], p.tag),
			rule(['entity.other.attribute-name'], p.attribute),
		],
	};
}

export const storyDark = theme('story-dark', 'dark', {
	background: '#171713', foreground: '#f4f1e9', comment: '#a9a59b', punctuation: '#c9c5bc',
	keyword: '#ded1ff', type: '#ffd4b8', func: '#cdefff', string: '#c7ff9f', number: '#ffd4b8', tag: '#ded1ff', attribute: '#cdefff',
});

export const storyLight = theme('story-light', 'light', {
	background: '#fffefb', foreground: '#171713', comment: '#6b6760', punctuation: '#5e5a53',
	keyword: '#6b4fbb', type: '#2a6f97', func: '#8a4b14', string: '#3d6b1f', number: '#8a4b14', tag: '#6b4fbb', attribute: '#2a6f97',
});

/** Numeri di riga come attributi, più le righe accese dall'inizio: CodeSteps le cambia a ogni passo. */
export function storyLines(lit: readonly number[] = []): ShikiTransformer {
	const accese = new Set(lit);
	return {
		name: 'story-lines',
		pre(node) { this.addClassToHast(node, 'st-pre'); },
		line(node, line) {
			node.properties['data-line'] = line;
			if (accese.has(line)) this.addClassToHast(node, 'is-lit');
		},
	};
}

/** "3-6, 9" → [3, 4, 5, 6, 9]: gli intervalli scritti come nelle note di un revisore. */
export function parseLines(spec: string | readonly number[] | undefined): number[] {
	if (spec === undefined) return [];
	if (typeof spec !== 'string') return [...spec];
	return spec.split(',').flatMap((part) => {
		const [a, b] = part.trim().split('-').map(Number);
		if (!Number.isInteger(a)) return [];
		const end = Number.isInteger(b) ? b : a;
		return Array.from({ length: Math.max(0, end - a + 1) }, (_, i) => a + i);
	});
}
