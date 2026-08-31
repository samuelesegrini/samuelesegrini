export type FeaturedProjectKey =
	| 'easymanager'
	| 'galaxy-trucker'
	| 'spingo-sustainable-micromobility';

export type FeaturedArtworkTreatment =
	| 'easy-service-pulse'
	| 'galaxy-network'
	| 'spingo-route';

const featuredArtworkTreatments: Record<FeaturedProjectKey, FeaturedArtworkTreatment> = {
	easymanager: 'easy-service-pulse',
	'galaxy-trucker': 'galaxy-network',
	'spingo-sustainable-micromobility': 'spingo-route',
};

export function getFeaturedArtworkTreatment(translationKey: string): FeaturedArtworkTreatment {
	if (Object.hasOwn(featuredArtworkTreatments, translationKey)) {
		return featuredArtworkTreatments[translationKey as FeaturedProjectKey];
	}

	throw new Error(`No featured artwork treatment is registered for "${translationKey}".`);
}
