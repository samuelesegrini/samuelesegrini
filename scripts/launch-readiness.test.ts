import { describe, expect, it } from 'vitest';
import { collectLaunchFailures } from './launch-readiness.mjs';

const productionInputs = {
	isProduction: true,
	isPlaceholder: true,
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
			'src/content/projects/it/easymanager.mdx is missing the public later re-engineering repository link',
			'src/content/projects/en/easymanager.mdx is missing the public later re-engineering repository link',
		]);
	});

	it('accepts a complete production input', () => {
		expect(
			collectLaunchFailures({
				isProduction: true,
				isPlaceholder: false,
				environment: {
					PUBLIC_SITE_URL: 'https://samuelesegrini.dev',
					TINA_PUBLIC_CLIENT_ID: 'client-id',
					TINA_TOKEN: 'token',
				},
				existingFiles: new Set(['public/cv/cv-it.pdf', 'public/cv/cv-en.pdf']),
				contentSources: new Map([
					[
						'src/content/projects/it/easymanager.mdx',
						'links:\n  - url: https://github.com/samuelesegrini/easymanager-pos',
					],
					[
						'src/content/projects/en/easymanager.mdx',
						'links:\n  - url: https://github.com/samuelesegrini/easymanager-pos',
					],
				]),
			}),
		).toEqual([]);
	});

	it('uses the supplied placeholder boolean instead of source-code text', () => {
		expect(
			collectLaunchFailures({
				...productionInputs,
				isPlaceholder: true,
			}),
		).toContain('siteConfig.isPlaceholder is not false');
	});

	it('requires a public later re-engineering repository link in both localized case studies', () => {
		const failures = collectLaunchFailures({
			...productionInputs,
			isPlaceholder: false,
			environment: {
				PUBLIC_SITE_URL: 'https://samuelesegrini.dev',
				TINA_PUBLIC_CLIENT_ID: 'client-id',
				TINA_TOKEN: 'token',
			},
			existingFiles: new Set(['public/cv/cv-it.pdf', 'public/cv/cv-en.pdf']),
			contentSources: new Map([
				[
					'src/content/projects/it/easymanager.mdx',
					'links:\n  - url: https://github.com/samuelesegrini/easymanager-pos',
				],
				['src/content/projects/en/easymanager.mdx', '# EasyManager'],
			]),
		});

		expect(failures).toContain(
			'src/content/projects/en/easymanager.mdx is missing the public later re-engineering repository link',
		);
		expect(failures).not.toContain(
			'src/content/projects/it/easymanager.mdx is missing the public later re-engineering repository link',
		);
	});
});
