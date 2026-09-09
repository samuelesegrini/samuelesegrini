import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	use: {
		baseURL: 'http://127.0.0.1:4321',
		trace: 'retain-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: {
		command: 'ASTRO_DEV_BACKGROUND=0 npm run dev -- --ignore-lock --host 127.0.0.1',
		url: 'http://127.0.0.1:4321',
		reuseExistingServer: true,
	},
});
