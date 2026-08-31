import { describe, expect, it } from 'vitest';
import { collectLaunchFailures } from './launch-readiness.mjs';

const productionInputs = {
	isProduction: true,
	siteConfigSource: 'export const siteConfig = { isPlaceholder: true };',
	environment: {},
	existingFiles: new Set<string>(),
	contentSources: new Map<string, string>(),
};

describe('collectLaunchFailures', () => {
	it('allows preview builds to run without launch inputs', () => {
		expect(collectLaunchFailures({ ...productionInputs, isProduction: false })).toEqual([]);
	});

	it('reports every missing production launch input', () => {
		const failures = collectLaunchFailures({
			...productionInputs,
			contentSources: new Map([
				['src/content/posts/it/learning-in-public.mdx', 'Articolo dimostrativo.'],
			]),
		});

		expect(failures).toEqual([
			'siteConfig.isPlaceholder is not false',
			'PUBLIC_SITE_URL is missing or still a placeholder',
			'TinaCloud credentials are missing',
			'public/cv/cv-it.pdf is missing',
			'public/cv/cv-en.pdf is missing',
			'src/content/posts/it/learning-in-public.mdx still contains demonstration copy',
		]);
	});

	it('accepts a complete production input', () => {
		expect(
			collectLaunchFailures({
				isProduction: true,
				siteConfigSource: 'const siteConfig = { isPlaceholder: false };',
				environment: {
					PUBLIC_SITE_URL: 'https://samuelesegrini.dev',
					TINA_PUBLIC_CLIENT_ID: 'client-id',
					TINA_TOKEN: 'token',
				},
				existingFiles: new Set(['public/cv/cv-it.pdf', 'public/cv/cv-en.pdf']),
				contentSources: new Map([
					['src/content/projects/it/easymanager.mdx', '# EasyManager\nA complete case study.'],
				]),
			}),
		).toEqual([]);
	});
});
