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
				'.wordmark small, .project-meta, .project-role, .project-proof, .project-status, .post-meta, .article-hero time, .detail-grid aside span, .project-explainer figcaption',
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

for (const width of [320, 390, 768, 1280, 1440]) {
	test(`homepage remains overflow-free after reveal motion at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
		await page.goto('/it/', { waitUntil: 'networkidle' });
		const revealItems = page.locator('[data-reveal]');
		for (let index = 0; index < await revealItems.count(); index += 1) {
			await revealItems.nth(index).scrollIntoViewIfNeeded();
		}
		await expect.poll(() => revealItems.evaluateAll((items) =>
			items.every((item) => item.hasAttribute('data-revealed')),
		)).toBe(true);
		await revealItems.evaluateAll(async (items) => {
			await Promise.all(items.flatMap((item) => item.getAnimations()).map((animation) => animation.finished));
		});
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
	});
}

test('scrolled header exposes its compact backdrop state', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/it/');
		const header = page.locator('[data-site-header]');
		await expect(header).not.toHaveAttribute('data-scrolled', '');
		const topPadding = await header.evaluate((element) => getComputedStyle(element).paddingTop);
		await page.evaluate(() => window.scrollTo(0, 320));
		await expect(header).toHaveAttribute('data-scrolled', '');
		const compactState = await header.evaluate((element) => {
			const style = getComputedStyle(element);
			return { paddingTop: style.paddingTop, background: style.backgroundColor };
		});
		expect(Number.parseFloat(compactState.paddingTop)).toBeLessThan(Number.parseFloat(topPadding));
		expect(compactState.background).not.toBe('rgba(0, 0, 0, 0)');
});

test('card and pulse feedback has visible keyboard and pressed states', async ({ page }) => {
		await page.goto('/it/');
		const cardLink = page.getByRole('link', { name: 'EasyManager', exact: true });
		await cardLink.focus();
		const arrowState = await cardLink.locator('.project-arrow').evaluate((element) => {
			const style = getComputedStyle(element);
			return { transform: style.transform, background: style.backgroundColor };
		});
		expect(arrowState.transform).not.toBe('none');
		await expect.poll(() => cardLink.locator('.project-arrow').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
			'rgb(8, 8, 8)',
		);

		const pulseStep = page.getByRole('button', { name: 'Risposta del server', exact: true });
		await pulseStep.click();
		await expect(pulseStep).toHaveAttribute('aria-pressed', 'true');
		await expect.poll(() => pulseStep.locator('.pulse-node').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
			'rgb(199, 255, 159)',
		);
});

test('English 404 localizes metadata, ARIA labels, navigation, and the complete shared shell', async ({ page }) => {
		await page.goto('/en/not-a-real-page');
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
		await expect(page).toHaveTitle('Page not found — 404');
		await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'The requested page does not exist.');
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/not-a-real-page$/);
		await expect(page.locator('link[type="application\/rss\+xml"]')).toHaveAttribute('href', /\/en\/rss\.xml$/);
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Page not found — 404');
		await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', 'The requested page does not exist.');
		await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /\/en\/not-a-real-page$/);
		await expect(page.locator('.skip-link')).toHaveText('Skip to content');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('This path does not lead to a page.');
		const navigation = page.locator('.desktop-nav');
		await expect(navigation).toHaveAttribute('aria-label', 'Primary navigation');
		await expect(navigation.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/en/projects/');
		await expect(navigation.getByRole('link', { name: 'Writing' })).toHaveAttribute('href', '/en/writing/');
		await expect(navigation.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en/about/');
		await expect(navigation.getByRole('link', { name: 'Italiano' })).toHaveAttribute('href', '/it/');
		await expect(navigation.getByRole('link', { name: 'Contact me' })).toHaveAttribute(
			'href',
			'mailto:samuele.segrini@gmail.com',
		);
		await expect(page.locator('.mobile-menu nav')).toHaveAttribute('aria-label', 'Mobile navigation');
		await expect(page.locator('.site-footer span')).toHaveText('Software, thoughtfully made.');
});

test('static 404 is one coherent bilingual page without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({
		baseURL: 'http://127.0.0.1:4321',
		javaScriptEnabled: false,
	});
	const page = await context.newPage();
	await page.goto('/en/not-a-real-page');

	await expect(page.locator('[data-not-found]')).toBeHidden();
	await expect(page.getByRole('main')).toHaveCount(1);
	await expect(page.getByRole('heading')).toHaveCount(1);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Pagina non trovata');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Page not found');

	const fallback = page.locator('[data-bilingual-404-fallback]');
	await expect(fallback).toBeVisible();
	await expect(page.locator('.site-header')).toBeHidden();
	await expect(page.locator('.site-footer')).toBeHidden();
	await expect(fallback.locator('[data-fallback-copy="it"]')).toContainText('La pagina richiesta non esiste.');
	await expect(fallback.locator('[data-fallback-copy="en"]')).toContainText('The requested page does not exist.');
	const skipLink = page.locator('[data-bilingual-404-skip]');
	await expect(skipLink).toBeVisible();
	await expect(skipLink).toHaveAttribute('href', '#static-404-main');
	await expect(fallback).toHaveAttribute('id', 'static-404-main');

	for (const navigation of [
		{
			label: 'Navigazione pagina non trovata in italiano',
			links: [
				{ name: 'Home', href: '/it/' },
				{ name: 'Progetti', href: '/it/progetti/' },
				{ name: 'Articoli', href: '/it/articoli/' },
				{ name: 'Chi sono', href: '/it/chi-sono/' },
				{ name: 'Scrivimi', href: 'mailto:samuele.segrini@gmail.com' },
			],
		},
		{
			label: 'English page-not-found navigation',
			links: [
				{ name: 'Home', href: '/en/' },
				{ name: 'Projects', href: '/en/projects/' },
				{ name: 'Writing', href: '/en/writing/' },
				{ name: 'About', href: '/en/about/' },
				{ name: 'Contact me', href: 'mailto:samuele.segrini@gmail.com' },
			],
		},
	]) {
		const nav = fallback.getByRole('navigation', { name: navigation.label });
		await expect(nav).toBeVisible();
		for (const link of navigation.links) {
			await expect(nav.getByRole('link', { name: link.name, exact: true })).toHaveAttribute('href', link.href);
		}
	}

	await context.close();
});

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
	await page.setViewportSize({ width: 320, height: 780 });
	await page.goto('/en/');

	const pulse = page.locator('[data-service-pulse]');
	const thirdStep = pulse.getByRole('button', { name: 'Server acknowledgement', exact: true });
	await thirdStep.click();
	await expect(pulse).toHaveAttribute('data-active-step', '3');
	await expect(thirdStep).toHaveAttribute('aria-pressed', 'true');
	await expect(pulse.locator('[data-pulse-description]')).toHaveCount(5);
	for (const description of await pulse.locator('[data-pulse-description]').all()) await expect(description).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	const pulseBox = await pulse.boundingBox();
	const titleBox = await page.locator('[data-featured-project][data-project-key="easymanager"] h3').boundingBox();
	expect(pulseBox).not.toBeNull();
	expect(titleBox).not.toBeNull();
	expect(pulseBox!.y + pulseBox!.height).toBeLessThanOrEqual(titleBox!.y);

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
