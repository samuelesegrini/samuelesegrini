import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const labPagePath = join(process.cwd(), 'src/pages/lab/styles.astro');

describe('style lab prototype contract', () => {
	it('publishes an isolated no-index gallery with five variants for every requested surface', () => {
		expect(existsSync(labPagePath)).toBe(true);

		const source = readFileSync(labPagePath, 'utf8');
		expect(source).toContain('<meta name="robots" content="noindex, nofollow" />');

		for (const [name, path] of [
			['Signal System', '/lab/sites/signal/'],
			['Editorial Monograph', '/lab/sites/monograph/'],
			['Living Atlas', '/lab/sites/atlas/'],
		] as const) {
			expect(source).toContain(name);
			expect(source).toContain(path);
		}

		for (const category of ['hero', 'cards', 'articles', 'project-detail']) {
			const variants = source.match(new RegExp(`data-variation="${category}-`, 'g')) ?? [];
			expect(variants, `${category} should expose five prototypes`).toHaveLength(5);
		}

		const astroConfig = readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf8');
		expect(astroConfig).toContain("sitemap({ filter: (page) => !page.includes('/lab/') })");
		expect(astroConfig).toContain("!page.includes('/lab/')");
	});
});
