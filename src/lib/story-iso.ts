/**
 * La geometria dello spaccato isometrico (ExplodedStack): piastre impilate e separate, con i
 * moduli in rilievo sopra. Tutto in coordinate del disegno (u lungo la larghezza, v lungo la
 * profondità), proiettato a 30°: il componente riceve solo poligoni già pronti da disegnare.
 */
export const COS30 = Math.sqrt(3) / 2;
export const SIN30 = 0.5;

export type IsoTint = 'acid' | 'violet' | 'blue' | 'orange' | 'paper';
export interface IsoChip { label: string; accent?: boolean }
export interface IsoLayer { name: string; tint: IsoTint; chips: readonly IsoChip[] }

export interface IsoOptions {
	/** Larghezza (u), profondità (v) e spessore di ogni piastra. */
	width: number;
	depth: number;
	thickness: number;
	/** Distanza verticale tra una piastra e la successiva. */
	spacing: number;
	/** Quanto sporgono i moduli sopra la piastra. */
	raise: number;
	/** Margine attorno al disegno, perché il tratto non venga tagliato. */
	pad: number;
}

export const defaultIso: IsoOptions = { width: 420, depth: 260, thickness: 18, spacing: 230, raise: 14, pad: 12 };

type Point = readonly [number, number];
export interface IsoFaces { top: string; left: string; right: string }
export interface IsoChipShape extends IsoFaces { label: string; accent: boolean; fontSize: number; textTransform: string }
export interface IsoPlateShape extends IsoFaces {
	name: string;
	tint: IsoTint;
	chips: IsoChipShape[];
	/** Dove attaccare le note: l'angolo destro e quello sinistro, in proporzione al disegno. */
	anchors: { right: Point; left: Point };
}
export interface IsoStack { width: number; height: number; plates: IsoPlateShape[]; connectors: string[] }

const round = (n: number) => Math.round(n * 10) / 10;
export const points = (...ps: Point[]) => ps.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');

/** La proiezione: un punto (u, v) della piastra alta y0, sollevato di `lift`, sul foglio. */
export function project(u: number, v: number, x0: number, y0: number, lift = 0): Point {
	return [x0 + COS30 * (u - v), y0 + SIN30 * (u + v) - lift];
}

/** I moduli stanno in fila lungo la larghezza, alla stessa distanza tra loro e dai bordi. */
export function chipSlots(count: number, width: number, margin = 20, gap = 17): { u: number; w: number }[] {
	if (count <= 0) return [];
	const w = (width - 2 * margin - (count - 1) * gap) / count;
	return Array.from({ length: count }, (_, i) => ({ u: margin + i * (w + gap), w }));
}

/** Le tre facce visibili di un parallelepipedo che parte da (u0, v0) alto `lift` e spesso `t`. */
function box(u0: number, v0: number, w: number, d: number, x0: number, y0: number, lift: number, t: number): IsoFaces {
	const top = (u: number, v: number) => project(u, v, x0, y0, lift);
	const bottom = (u: number, v: number) => project(u, v, x0, y0, lift - t);
	return {
		top: points(top(u0, v0), top(u0 + w, v0), top(u0 + w, v0 + d), top(u0, v0 + d)),
		left: points(top(u0, v0 + d), top(u0 + w, v0 + d), bottom(u0 + w, v0 + d), bottom(u0, v0 + d)),
		right: points(top(u0 + w, v0 + d), top(u0 + w, v0), bottom(u0 + w, v0), bottom(u0 + w, v0 + d)),
	};
}

export function isoStack(layers: readonly IsoLayer[], options: Partial<IsoOptions> = {}): IsoStack {
	const o = { ...defaultIso, ...options };
	const x0 = o.pad + COS30 * o.depth;
	const width = 2 * o.pad + COS30 * (o.width + o.depth);
	const height = 2 * o.pad + Math.max(0, layers.length - 1) * o.spacing + SIN30 * (o.width + o.depth) + o.thickness;
	const plateY = (k: number) => o.pad + k * o.spacing;

	const plates = layers.map((layer, k): IsoPlateShape => {
		const y0 = plateY(k);
		const d = 80;
		const v0 = (o.depth - d) / 2;
		const chips = chipSlots(layer.chips.length, o.width).map(({ u, w }, i): IsoChipShape => {
			const chip = layer.chips[i];
			const [tx, ty] = project(u + 14, v0 + d * 0.64, x0, y0, o.raise);
			const fontSize = Math.min(21, Math.floor((w - 28) / (chip.label.length * 0.56)));
			return { ...box(u, v0, w, d, x0, y0, o.raise, o.raise), label: chip.label, accent: chip.accent ?? false, fontSize, textTransform: `matrix(0.866 0.5 -0.866 0.5 ${round(tx)} ${round(ty)})` };
		});
		const right = project(o.width, 0, x0, y0);
		const left = project(0, o.depth, x0, y0);
		return {
			...box(0, 0, o.width, o.depth, x0, y0, 0, o.thickness),
			name: layer.name,
			tint: layer.tint,
			chips,
			anchors: { right: [right[0] / width, (right[1] + o.thickness / 2) / height], left: [left[0] / width, (left[1] + o.thickness / 2) / height] },
		};
	});

	// i tratteggi uniscono gli spigoli esterni di una piastra a quelli della successiva
	const connectors = layers.slice(1).flatMap((_, k) => [[o.width, 0], [0, o.depth]].map(([u, v]) => {
		const [x, y1] = project(u, v, x0, plateY(k));
		const [, y2] = project(u, v, x0, plateY(k + 1));
		return `M${round(x)} ${round(y1 + o.thickness)}V${round(y2)}`;
	}));

	return { width: round(width), height: round(height), plates, connectors };
}
