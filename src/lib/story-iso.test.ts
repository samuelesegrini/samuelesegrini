import { describe, expect, test } from 'vitest';
import { COS30, chipSlots, defaultIso, isoStack, project } from './story-iso';
import { parseLines } from './story-code';

const parse = (list: string) => list.split(' ').map((pair) => pair.split(',').map(Number) as [number, number]);

const layers = [
	{ name: 'Features', tint: 'acid', chips: [{ label: 'Dining' }, { label: 'Kitchen' }, { label: 'Till' }] },
	{ name: 'Contracts', tint: 'violet', chips: [{ label: 'Orders' }, { label: 'Lanes' }, { label: 'Fiscal', accent: true }] },
	{ name: 'Persistence', tint: 'blue', chips: [{ label: 'SQL at the boundary' }] },
	{ name: 'Hardware', tint: 'paper', chips: [{ label: 'iPad' }, { label: 'iPad' }, { label: 'Printer', accent: true }] },
] as const;

describe('project', () => {
	test('keeps the origin in place and walks the two axes at thirty degrees', () => {
		expect(project(0, 0, 300, 40)).toEqual([300, 40]);
		const [x, y] = project(100, 0, 300, 40);
		expect(x).toBeCloseTo(300 + COS30 * 100);
		expect(y).toBeCloseTo(90);
		const [xv, yv] = project(0, 100, 300, 40);
		expect(xv).toBeCloseTo(300 - COS30 * 100);
		expect(yv).toBeCloseTo(90);
	});

	test('lifts a point straight up on the page', () => {
		expect(project(50, 50, 300, 40, 14)).toEqual([300, 40 + 50 - 14]);
	});
});

describe('chipSlots', () => {
	test('fills the width with equal chips and equal gaps', () => {
		const slots = chipSlots(3, 420);
		expect(slots[0].u).toBe(20);
		expect(slots[2].u + slots[2].w).toBeCloseTo(400);
		expect(slots[1].u - (slots[0].u + slots[0].w)).toBeCloseTo(17);
		expect(chipSlots(1, 420)).toEqual([{ u: 20, w: 380 }]);
		expect(chipSlots(0, 420)).toEqual([]);
	});
});

describe('isoStack', () => {
	const stack = isoStack(layers);

	test('keeps every face inside the drawing, stroke margin included', () => {
		const all = stack.plates.flatMap((p) => [p.top, p.left, p.right, ...p.chips.flatMap((c) => [c.top, c.left, c.right])]).flatMap(parse);
		for (const [x, y] of all) {
			expect(x).toBeGreaterThanOrEqual(defaultIso.pad - 0.1);
			expect(y).toBeGreaterThanOrEqual(defaultIso.pad - 0.1);
			expect(x).toBeLessThanOrEqual(stack.width - defaultIso.pad + 0.1);
			expect(y).toBeLessThanOrEqual(stack.height - defaultIso.pad + 0.1);
		}
	});

	test('pulls the plates apart by the same spacing and links them with two dashed edges each', () => {
		const tops = stack.plates.map((p) => parse(p.top)[0][1]);
		expect(tops.slice(1).map((y, i) => y - tops[i])).toEqual([230, 230, 230]);
		expect(stack.connectors).toHaveLength((layers.length - 1) * 2);
		for (const d of stack.connectors) expect(d).toMatch(/^M[\d.]+ [\d.]+V[\d.]+$/);
	});

	test('raises the chips above their plate and keeps labels inside them', () => {
		const plate = stack.plates[1];
		const plateTop = Math.min(...parse(plate.top).map(([, y]) => y));
		for (const chip of plate.chips) {
			expect(Math.min(...parse(chip.top).map(([, y]) => y))).toBeGreaterThan(plateTop);
			expect(chip.fontSize).toBeGreaterThan(10);
			expect(chip.fontSize).toBeLessThanOrEqual(21);
			expect(chip.textTransform).toMatch(/^matrix\(0\.866 0\.5 -0\.866 0\.5 [\d.]+ [\d.]+\)$/);
		}
		expect(plate.chips.map((c) => c.accent)).toEqual([false, false, true]);
	});

	test('anchors the notes to the outer corners, in proportion to the drawing', () => {
		for (const p of stack.plates) {
			expect(p.anchors.right[0]).toBeGreaterThan(0.9);
			expect(p.anchors.left[0]).toBeLessThan(0.1);
		}
		const rights = stack.plates.map((p) => p.anchors.right[1]);
		expect([...rights].sort((a, b) => a - b)).toEqual(rights);
	});
});

describe('parseLines', () => {
	test('reads ranges and single lines as a reviewer would write them', () => {
		expect(parseLines('3-6, 9')).toEqual([3, 4, 5, 6, 9]);
		expect(parseLines([2, 4])).toEqual([2, 4]);
		expect(parseLines(undefined)).toEqual([]);
		expect(parseLines('x, 5')).toEqual([5]);
	});
});
