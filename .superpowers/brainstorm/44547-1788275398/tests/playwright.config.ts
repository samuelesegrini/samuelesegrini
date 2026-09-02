import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: '.',
	fullyParallel: false,
	use: {
		baseURL: 'http://127.0.0.1:59314',
		...devices['Desktop Chrome'],
	},
});
