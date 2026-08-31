import { describe, expect, it } from 'vitest';
import {
	getFeaturedArtworkTreatment,
	type FeaturedProjectKey,
} from './project-artwork';

describe('featured artwork treatment contract', () => {
	it('recognizes every project in the approved featured trio', () => {
		const featuredKeys = [
			'easymanager',
			'galaxy-trucker',
			'spingo-sustainable-micromobility',
		] satisfies FeaturedProjectKey[];

		expect(featuredKeys.map(getFeaturedArtworkTreatment)).toEqual([
			'easy-service-pulse',
			'galaxy-network',
			'spingo-route',
		]);
	});

	it('rejects an unrecognized featured key instead of silently losing bespoke artwork', () => {
		expect(() => getFeaturedArtworkTreatment('unrecognized-project')).toThrow(
			'No featured artwork treatment is registered for "unrecognized-project".',
		);
	});
});
