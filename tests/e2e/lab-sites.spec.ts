import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const themes = ['signal', 'monograph', 'atlas'] as const;
const pages = ['/', '/projects/', '/article/', '/project/'] as const;

const signalRoutes = [
	'/lab/sites/signal/',
	'/lab/sites/signal/projects/',
	'/lab/sites/signal/article/',
	'/lab/sites/signal/project/',
];

const monographRoutes = [
	'/lab/sites/monograph/',
	'/lab/sites/monograph/projects/',
	'/lab/sites/monograph/article/',
	'/lab/sites/monograph/project/',
];

const atlasRoutes = [
	'/lab/sites/atlas/',
	'/lab/sites/atlas/projects/',
	'/lab/sites/atlas/article/',
	'/lab/sites/atlas/project/',
];

for (const path of atlasRoutes) {
	test(`Atlas route ${path} is private and navigable`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response?.ok()).toBe(true);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
		await expect(page.locator('body')).toHaveClass(/lab-site--atlas/);
		await expect(page.locator('[data-lab-site-nav] a')).toHaveCount(4);
		const results = await new AxeBuilder({ page }).analyze();
		const serious = results.violations.filter(
			({ impact }) => impact === 'serious' || impact === 'critical',
		);
		expect(serious).toEqual([]);
	});
}

test('Atlas uses editions and numbered chapters without a permanently dark reader', async ({ page }) => {
	await page.goto('/lab/sites/atlas/');
	await expect(page.locator('[data-atlas-edition]')).toHaveCount(3);
	await expect(page.locator('[data-atlas-compact-index] [data-project-row]')).toHaveCount(3);
	await page.goto('/lab/sites/atlas/projects/');
	await expect(page.locator('[data-atlas-project-row]')).toHaveCount(3);
	await page.goto('/lab/sites/atlas/article/');
	await expect(page.locator('[data-atlas-aperture]')).toBeVisible();
	await expect(page.locator('[data-atlas-reading]')).toBeVisible();
	await page.goto('/lab/sites/atlas/project/');
	await expect(page.locator('[data-atlas-chapter]')).toHaveCount(4);
});

for (const path of monographRoutes) {
	test(`Monograph route ${path} is private and navigable`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response?.ok()).toBe(true);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
		await expect(page.locator('body')).toHaveClass(/lab-site--monograph/);
		await expect(page.locator('[data-lab-site-nav] a')).toHaveCount(4);
	});
}

test('Monograph keeps reading light and publication-led', async ({ page }) => {
	await page.goto('/lab/sites/monograph/article/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('My first video game was a distributed system');
	await expect(page.locator('[data-monograph-marginalia]')).toBeVisible();
	expect(await page.locator('.monograph-reading').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(246, 241, 231)');
	await page.goto('/lab/sites/monograph/project/');
	await expect(page.locator('[data-project-outcome]')).toHaveCount(3);
});

test('Monograph blockquote rule is neutral rather than oxblood', async ({ page }) => {
	await page.goto('/lab/sites/monograph/article/');
	const blockquote = page.locator('.monograph-reading blockquote').first();
	await expect(blockquote).toBeVisible();
	expect(await blockquote.evaluate((element) => getComputedStyle(element).borderLeftColor)).not.toBe('rgb(127, 47, 42)');
});

test('Signal and Monograph project indexes list only selected projects', async ({ page }) => {
	for (const path of ['/lab/sites/signal/projects/', '/lab/sites/monograph/projects/']) {
		await page.goto(path);
		await expect(page.locator('[data-project-row]')).toHaveCount(3);
	}
});

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

test('all themes expose the same selected portfolio records', async ({ page }) => {
	for (const theme of themes) {
		await page.goto(`/lab/sites/${theme}/`);
		for (const title of ['EasyManager', 'Galaxy Trucker', 'SpinGO']) {
			await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
		}
		await page.goto(`/lab/sites/${theme}/article/`);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('My first video game was a distributed system');
		await page.goto(`/lab/sites/${theme}/project/`);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('EasyManager');
	}
});

test('theme navigation reaches every page without leaving the selected system', async ({ page }) => {
	for (const theme of themes) {
		await page.goto(`/lab/sites/${theme}/`);
		for (const suffix of pages.slice(1)) {
			await page.locator(`[data-lab-site-nav] a[href="/lab/sites/${theme}${suffix}"]`).click();
			await expect(page).toHaveURL(new RegExp(`/lab/sites/${theme}${suffix.replaceAll('/', '\\/')}$`));
		}
	}
});

for (const width of [390, 1280]) {
	test(`lab mini-sites remain accessible and overflow-free at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
		for (const theme of themes) {
			for (const suffix of pages) {
				const path = `/lab/sites/${theme}${suffix}`;
				await page.goto(path, { waitUntil: 'networkidle' });
				expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBe(width);
				const results = await new AxeBuilder({ page }).analyze();
				const serious = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
				expect(serious, path).toEqual([]);
			}
		}
	});
}
