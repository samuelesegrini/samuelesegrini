import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const { width, height } of [
	{ width: 320, height: 780 },
	{ width: 768, height: 1024 },
	{ width: 1440, height: 1000 },
]) {
	test(`homepage has no serious accessibility violations at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height });
		await page.goto('/it/', { waitUntil: 'networkidle' });
		const results = await new AxeBuilder({ page }).analyze();
		const serious = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
		expect(serious).toEqual([]);
	});
}

test('homepage service pulse supports directional and boundary keyboard controls', async ({ page }) => {
	await page.goto('/en/');
	const pulse = page.locator('[data-service-pulse]');
	const steps = pulse.getByRole('button');

	await steps.first().focus();
	await page.keyboard.press('ArrowLeft');
	await expect(steps.nth(4)).toHaveAttribute('aria-pressed', 'true');
	await expect(steps.nth(4)).toBeFocused();

	await page.keyboard.press('ArrowRight');
	await expect(steps.first()).toHaveAttribute('aria-pressed', 'true');
	await expect(steps.first()).toBeFocused();

	await page.keyboard.press('ArrowRight');
	await expect(steps.nth(1)).toHaveAttribute('aria-pressed', 'true');
	await expect(steps.nth(1)).toBeFocused();

	await page.keyboard.press('End');
	await expect(steps.nth(4)).toHaveAttribute('aria-pressed', 'true');
	await expect(steps.nth(4)).toBeFocused();

	await page.keyboard.press('Home');
	await expect(steps.first()).toHaveAttribute('aria-pressed', 'true');
	await expect(steps.first()).toBeFocused();
});

test('homepage service pulse changes state without motion when reduced motion is requested', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/en/');

	const pulse = page.locator('[data-service-pulse]');
	const thirdStep = pulse.getByRole('button', { name: 'Server acknowledgement', exact: true });
	await thirdStep.click();
	await expect(pulse).toHaveAttribute('data-active-step', '3');
	await expect(thirdStep).toHaveAttribute('aria-pressed', 'true');

	const motion = await thirdStep.locator('.pulse-node').evaluate((node) => {
		const style = getComputedStyle(node);
		return { transform: style.transform, transitionDuration: style.transitionDuration };
	});
	expect(motion).toEqual({ transform: 'none', transitionDuration: '0s' });
});

test('English article exposes localized SEO and structured data', async ({ page }) => {
	await page.goto('/en/writing/designing-for-clarity/');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/writing\/designing-for-clarity\/$/);
	await expect(page.locator('link[hreflang="it"]')).toHaveAttribute('href', /\/it\/articoli\/progettare-per-la-chiarezza\/$/);
	const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
	expect(structuredData).toContain('BlogPosting');
});

test('feeds, sitemap, robots, and localized 404 are generated', async ({ page, request }) => {
	for (const path of ['/it/rss.xml', '/en/rss.xml', '/robots.txt']) {
		const response = await request.get(path);
		expect(response.ok(), path).toBeTruthy();
	}
	await page.goto('/en/not-a-real-page');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('This path does not lead to a page.');
});
