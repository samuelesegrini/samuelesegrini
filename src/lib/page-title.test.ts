import { describe, expect, test } from 'vitest';
import { pageTitle } from './page-title';

const name = 'Samuele Segrini';

describe('pageTitle', () => {
	test('appends the site name when the page does not already name the author', () => {
		expect(pageTitle('Projects', name)).toBe('Projects — Samuele Segrini');
		expect(pageTitle('EasyManager — From a SwiftUI restaurant app to a modular Swift toolkit', name)).toBe(
			'EasyManager — From a SwiftUI restaurant app to a modular Swift toolkit — Samuele Segrini',
		);
	});

	test('leaves titles that already include the site name', () => {
		expect(pageTitle('Samuele Segrini — Software Engineer', name)).toBe('Samuele Segrini — Software Engineer');
		expect(pageTitle('About — Samuele Segrini, iOS developer', name)).toBe('About — Samuele Segrini, iOS developer');
	});

	test('falls back to the site name when the page title is empty', () => {
		expect(pageTitle('  ', name)).toBe(name);
	});
});
