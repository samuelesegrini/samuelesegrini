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

const sharedShellRoutes = [
	'/it/',
	'/it/progetti/easymanager-operazioni-ristorante/',
	'/it/progetti/',
	'/it/articoli/il-mio-primo-videogioco-era-un-sistema-distribuito/',
	'/it/chi-sono/',
	'/en/not-a-real-page',
];

for (const width of [320, 390, 768, 1280, 1440]) {
	test(`shared shell fits representative routes at ${width}px`, async ({ page }) => {
		for (const path of sharedShellRoutes) {
			await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
			await page.goto(path, { waitUntil: 'networkidle' });

			expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBe(width);
			const metadataSizes = await page.locator(
				'.project-meta, .project-role, .project-proof, .project-status, .post-meta, .article-hero time, .detail-grid aside span, .project-explainer figcaption',
			).evaluateAll((items) =>
				items
					.filter((item) => {
						const box = item.getBoundingClientRect();
						return box.width > 0 && box.height > 0;
					})
					.map((item) => Number.parseFloat(getComputedStyle(item).fontSize)),
			);
			expect(metadataSizes.every((size) => size >= 11), `${path} metadata`).toBe(true);

			if (width <= 390) {
				const summary = page.locator('.mobile-menu summary');
				const email = page.locator('footer a[href^="mailto:"]');
				expect((await summary.boundingBox())?.height, `${path} menu`).toBeGreaterThanOrEqual(44);
				expect((await email.boundingBox())?.height, `${path} email`).toBeGreaterThanOrEqual(44);
			}
		}
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

test('destination project heading can receive focus after route navigation', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/it/');
	await page.getByRole('link', { name: 'EasyManager', exact: true }).click();
	const heading = page.getByRole('heading', { level: 1, name: 'EasyManager' });
	await expect(heading).toHaveAttribute('tabindex', '-1');
	await expect(heading).toBeFocused();

	await page.goBack();
	await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
	await page.getByRole('link', { name: 'EasyManager', exact: true }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'EasyManager' })).toBeFocused();
});

test('homepage reveal choreography initializes progressively and honors reduced motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/it/');

	await expect(page.locator('html')).toHaveAttribute('data-motion-ready', '');
	const revealState = await page.locator('[data-reveal]').evaluateAll((items) =>
		items.map((item) => ({ revealed: item.hasAttribute('data-revealed'), opacity: getComputedStyle(item).opacity })),
	);
	expect(revealState.length).toBeGreaterThan(0);
	expect(revealState.every(({ revealed, opacity }) => revealed && opacity === '1')).toBe(true);
});

test('route swaps retain exactly one live reveal observer', async ({ page }) => {
	await page.addInitScript(() => {
		const stats = { created: 0, disconnected: 0 };
		const OriginalObserver = window.IntersectionObserver;
		class InstrumentedObserver extends OriginalObserver {
			constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
				super(callback, options);
				stats.created += 1;
			}

			disconnect(): void {
				stats.disconnected += 1;
				super.disconnect();
			}
		}
		Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: InstrumentedObserver });
		Object.defineProperty(window, '__motionObserverStats', { configurable: true, value: stats });
	});

	await page.goto('/it/');
	await page.getByRole('link', { name: 'EasyManager', exact: true }).click();
	await expect(page).toHaveURL(/\/it\/progetti\/easymanager-operazioni-ristorante\/$/);
	await page.goBack();
	await expect(page).toHaveURL(/\/it\/$/);
	await page.getByRole('link', { name: 'EasyManager', exact: true }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'EasyManager' })).toBeFocused();

	const stats = await page.evaluate(() => (window as typeof window & { __motionObserverStats: { created: number; disconnected: number } }).__motionObserverStats);
	expect(stats.created).toBeGreaterThanOrEqual(3);
	expect(stats.disconnected).toBe(stats.created - 1);
});

test('reveal fallback remains readable when IntersectionObserver is unavailable', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(document, 'startViewTransition', { configurable: true, value: undefined });
		Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: {} });
	});
	await page.goto('/it/');

	const revealState = await page.locator('[data-reveal]').evaluateAll((items) =>
		items.map((item) => ({ revealed: item.hasAttribute('data-revealed'), opacity: getComputedStyle(item).opacity })),
	);
	expect(revealState.length).toBeGreaterThan(0);
	expect(revealState.every(({ revealed, opacity }) => revealed && opacity === '1')).toBe(true);
	await page.getByRole('link', { name: 'EasyManager', exact: true }).click();
	await expect(page).toHaveURL(/\/it\/progetti\/easymanager-operazioni-ristorante\/$/);
	await expect(page.getByRole('heading', { level: 1, name: 'EasyManager' })).toBeFocused();
});

test('keyboard focus reveals delayed card controls', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 780 });
	await page.goto('/it/');

	for (let index = 0; index < 6; index += 1) await page.keyboard.press('Tab');
	const firstPulseStep = page.getByRole('button', { name: 'Bozza del tavolo', exact: true });
	await expect(firstPulseStep).toBeFocused();
	await expect(firstPulseStep).toBeVisible();
	const pulseOpacity = await firstPulseStep.evaluate((item) => getComputedStyle(item.closest('[data-reveal]')!).opacity);
	expect(pulseOpacity).toBe('1');

	for (let index = 0; index < 5; index += 1) await page.keyboard.press('Tab');
	const firstProjectLink = page.getByRole('link', { name: 'EasyManager', exact: true });
	await expect(firstProjectLink).toBeFocused();
	const cardOpacity = await firstProjectLink.evaluate((item) => getComputedStyle(item.closest('[data-reveal]')!).opacity);
	expect(cardOpacity).toBe('1');
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
