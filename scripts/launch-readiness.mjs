/**
 * @typedef {object} LaunchInputs
 * @property {boolean} isProduction
 * @property {boolean} isPlaceholder
 * @property {NodeJS.ProcessEnv} environment
 * @property {ReadonlySet<string>} existingFiles
 * @property {ReadonlyMap<string, string>} contentSources
 */

const requiredCVFiles = ['public/cv/cv-it.pdf', 'public/cv/cv-en.pdf'];
const laterRepositoryURL = 'https://github.com/samuelesegrini/easymanager-pos';
const localizedEasyManagerPaths = [
	'src/content/projects/it/easymanager.mdx',
	'src/content/projects/en/easymanager.mdx',
];

/**
 * Collect launch blockers without reading the filesystem or process state.
 *
 * @param {LaunchInputs} inputs
 * @returns {string[]}
 */
export function collectLaunchFailures(inputs) {
	if (!inputs.isProduction) return [];

	const failures = [];
	if (inputs.isPlaceholder) {
		failures.push('siteConfig.isPlaceholder is not false');
	}

	const siteURL = inputs.environment.PUBLIC_SITE_URL?.trim();
	if (!siteURL || /placeholder/i.test(siteURL)) {
		failures.push('PUBLIC_SITE_URL is missing or still a placeholder');
	}

	if (!inputs.environment.TINA_PUBLIC_CLIENT_ID?.trim() || !inputs.environment.TINA_TOKEN?.trim()) {
		failures.push('TinaCloud credentials are missing');
	}

	for (const file of requiredCVFiles) {
		if (!inputs.existingFiles.has(file)) failures.push(`${file} is missing`);
	}

	for (const [path, source] of inputs.contentSources) {
		if (/\bdimostrativ[oa]\b|\bdemonstration\s+(?:content|article|biography)\b/i.test(source)) {
			failures.push(`${path} still contains demonstration copy`);
		}
	}

	for (const path of localizedEasyManagerPaths) {
		const source = inputs.contentSources.get(path);
		if (!source?.includes(`url: ${laterRepositoryURL}`)) {
			failures.push(`${path} is missing the public later re-engineering repository link`);
		}
	}

	return failures;
}
