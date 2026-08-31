import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { siteDefaults } from '../src/config/site-shared.mjs';
import { collectLaunchFailures } from './launch-readiness.mjs';

const isProduction = process.env.CF_PAGES_BRANCH === 'main';
if (!isProduction) process.exit(0);

const contentSources = new Map();
const contentDirectories = ['src/content/projects', 'src/content/posts', 'src/content/pages'];
for (const directory of contentDirectories) {
	for (const localeOrFile of readdirSync(directory, { withFileTypes: true })) {
		const paths = localeOrFile.isDirectory()
			? readdirSync(join(directory, localeOrFile.name)).map((file) => join(directory, localeOrFile.name, file))
			: [join(directory, localeOrFile.name)];
		for (const path of paths) contentSources.set(path, readFileSync(path, 'utf8'));
	}
}

const existingFiles = new Set(
	['public/cv/cv-it.pdf', 'public/cv/cv-en.pdf'].filter((file) => existsSync(file)),
);
const failures = collectLaunchFailures({
	isProduction,
	isPlaceholder: siteDefaults.isPlaceholder,
	environment: process.env,
	existingFiles,
	contentSources,
});

if (failures.length > 0) {
	console.error(`Production launch blocked:\n- ${failures.join('\n- ')}`);
	process.exit(1);
}
