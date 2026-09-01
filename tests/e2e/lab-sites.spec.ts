import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const signalRoutes = [
	'/lab/sites/signal/',
	'/lab/sites/signal/projects/',
	'/lab/sites/signal/article/',
	'/lab/sites/signal/project/',
];

for (const path of signalRoutes) {
	test(`Signal route ${path} is private and navigable`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response?.ok()).toBe(true);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
		await expect(page.locator('body')).toHaveClass(/lab-site--signal/);
		await expect(page.locator('[data-lab-site-nav] a')).toHaveCount(4);
		await expect(page.locator('[data-lab-switcher]')).toBeVisible();
		const results = await new AxeBuilder({ page }).analyze();
		const serious = results.violations.filter(
			({ impact }) => impact === 'serious' || impact === 'critical',
		);
		expect(serious).toEqual([]);
	});
}

test('Signal uses the approved content and structural signatures', async ({ page }) => {
	await page.goto('/lab/sites/signal/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('SYSTEMS');
	await expect(page.locator('[data-featured-project]')).toHaveCount(3);
	await page.goto('/lab/sites/signal/article/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('My first video game was a distributed system');
	await expect(page.locator('[data-signal-evidence]')).toBeVisible();
	await page.goto('/lab/sites/signal/project/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('EasyManager');
	await expect(page.locator('[data-project-outcome]')).toHaveCount(3);
});
