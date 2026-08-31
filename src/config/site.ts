import { siteDefaults } from './site-shared.mjs';

const { fallbackSiteURL, ...siteIdentity } = siteDefaults;

export const siteConfig = {
	...siteIdentity,
	siteURL: import.meta.env.PUBLIC_SITE_URL ?? fallbackSiteURL,
} as const;
