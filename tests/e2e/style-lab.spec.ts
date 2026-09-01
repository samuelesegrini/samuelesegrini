import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const width of [390, 1280]) {
	test(`style lab has no serious accessibility violations at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
		await page.goto('/lab/styles/', { waitUntil: 'networkidle' });

		const results = await new AxeBuilder({ page }).analyze();
		const serious = results.violations.filter(
			({ impact }) => impact === 'serious' || impact === 'critical',
		);
		expect(serious).toEqual([]);
	});
}

test('style lab keeps the case-file title inside its mobile canvas', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/lab/styles/', { waitUntil: 'networkidle' });

	const canvas = await page.locator('[data-variation="project-detail-01"] .prototype-canvas').boundingBox();
	const title = await page.locator('[data-variation="project-detail-01"] h3').boundingBox();
	expect(canvas).not.toBeNull();
	expect(title).not.toBeNull();
	expect(title!.x).toBeGreaterThanOrEqual(canvas!.x);
	expect(title!.x + title!.width).toBeLessThanOrEqual(canvas!.x + canvas!.width);
	const titleSizing = await page.locator('[data-variation="project-detail-01"] h3').evaluate((element) => ({
		clientWidth: element.clientWidth,
		scrollWidth: element.scrollWidth,
	}));
	expect(titleSizing.scrollWidth).toBeLessThanOrEqual(titleSizing.clientWidth);
});

test('style lab uses a published SpinGO research metric', async ({ page }) => {
	await page.goto('/lab/styles/');
	const study = page.locator('[data-variation="cards-02"]');
	await expect(study).toContainText('109 survey responses');
	await expect(study).not.toContainText('8 interviews');
});
