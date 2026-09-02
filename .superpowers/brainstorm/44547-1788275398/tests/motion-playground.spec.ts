import { expect, test } from '@playwright/test';

const libraryUrl = '/motion-playground.html?variant=library';

const promisedComponents = [
	'split-metric',
	'signal-peg',
	'twist-dial',
	'knock-notice',
	'peel-tab',
	'magnet-action',
	'plane-send',
	'trapdoor-download',
	'pixel-guest',
	'progress-creature',
	'conveyor-pager',
	'card-shuffle-label',
	'inbox-blob',
];

test.beforeEach(async ({ page }) => {
	await page.goto(libraryUrl);
});

test('the library exposes all thirteen promised machines without duplicate specimens', async ({ page }) => {
	await expect(page.locator('#variant-library')).toHaveClass(/active/);
	await expect(page.locator('.library-summary b')).toHaveText('31 components');
	await expect(page.getByRole('button', { name: 'All 31' })).toBeVisible();

	for (const component of promisedComponents) {
		await expect(page.locator(`[data-component="${component}"]`)).toHaveCount(1);
	}
});

test('the six new machines communicate distinct state changes', async ({ page }) => {
	const signal = page.locator('[data-component="signal-peg"] button');
	await signal.click();
	await expect(signal).toHaveAttribute('aria-pressed', 'true');

	const dial = page.locator('[data-component="twist-dial"] button');
	await dial.click();
	await expect(dial).toHaveAttribute('aria-checked', 'true');
	await expect(dial.locator('.dial-value')).toHaveText('EN');

	const notice = page.locator('[data-component="knock-notice"] button');
	await notice.click();
	await expect(notice).toHaveAttribute('aria-label', 'No unread notices');

	const peel = page.locator('[data-component="peel-tab"] button');
	await peel.click();
	await expect(peel).toHaveAttribute('aria-pressed', 'true');
	await expect(peel.locator('.peel-reveal')).toHaveText('Projects');

	const magnet = page.locator('[data-component="magnet-action"] button');
	const restingTransform = await magnet.locator('.magnet-action-plate').evaluate(
		(element) => getComputedStyle(element).transform,
	);
	await magnet.hover({ position: { x: 70, y: 22 } });
	await expect
		.poll(() =>
			magnet.locator('.magnet-action-plate').evaluate((element) => getComputedStyle(element).transform),
		)
		.not.toBe(restingTransform);

	const shuffle = page.locator('[data-component="card-shuffle-label"] button');
	await shuffle.click();
	await expect(shuffle).toHaveAttribute('aria-pressed', 'true');
	await expect(shuffle.locator('.shuffle-card.alt b')).toHaveText('Swift / iOS');
});

test('the upgraded machines perform the action described by their labels', async ({ page }) => {
	const metric = page.locator('[data-component="split-metric"] button');
	await metric.click();
	await expect(metric).toHaveAttribute('data-counter', '13');
	await expect(metric.locator('.counter-digit.rolling')).toHaveCount(1);

	const plane = page.locator('[data-component="plane-send"] button');
	await plane.click();
	await expect(plane).toHaveAttribute('aria-label', 'Email sent');

	const download = page.locator('[data-component="trapdoor-download"] button');
	await download.click();
	await expect(download).toHaveAttribute('aria-label', 'Download complete');

	const guest = page.locator('[data-component="pixel-guest"] button');
	await guest.click();
	await expect(guest).toHaveAttribute('data-reaction', 'celebrate');

	const creature = page.locator('[data-component="progress-creature"] button');
	const before = await creature.evaluate((element) => element.getAttribute('style'));
	await creature.click();
	await expect.poll(() => creature.evaluate((element) => element.getAttribute('style'))).not.toBe(before);

	const pager = page.locator('[data-component="conveyor-pager"]');
	await pager.getByRole('button', { name: 'Next project' }).click();
	await expect(pager.locator('.pager-copy.current b')).toHaveText('Galaxy Trucker');
});

test('inbox blob swallows unread dots one at a time and grows with each bite', async ({ page }) => {
	const component = page.locator('[data-component="inbox-blob"]');
	const button = component.locator('button');
	const body = component.locator('.inbox-blob-body');
	await expect(button).toHaveAttribute('data-unread', '3');
	await expect(button).toHaveAttribute('aria-label', '3 unread messages');
	await expect(component.locator('.inbox-dot')).toHaveCount(3);
	const restingWidth = await body.evaluate((element) => element.getBoundingClientRect().width);

	await button.click();
	await expect(button).toHaveAttribute('data-state', 'feeding');
	await expect(button).toHaveAttribute('data-unread', '2');
	await expect(component.locator('.inbox-dot')).toHaveCount(2);
	await expect.poll(() => body.evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(restingWidth);

	await expect(button).toHaveAttribute('data-unread', '0');
	await expect(component.locator('.inbox-dot')).toHaveCount(0);
	await expect(button).toHaveAttribute('data-state', 'satisfied');
	await expect(button).toHaveAttribute('aria-label', 'No unread messages');
});

test('clicking an empty inbox blob creates a fresh batch', async ({ page }) => {
	const component = page.locator('[data-component="inbox-blob"]');
	const button = component.locator('button');
	await button.click();
	await expect(button).toHaveAttribute('data-unread', '0');
	await button.click();
	await expect(button).toHaveAttribute('data-unread', '3');
	await expect(button).toHaveAttribute('data-state', 'idle');
	await expect(button).toHaveAttribute('aria-label', '3 unread messages');
	await expect(component.locator('.inbox-dot')).toHaveCount(3);
});

test('paper-plane uses one clean stage without legacy tether elements', async ({ page }) => {
	const component = page.locator('[data-component="plane-send"]');
	await expect(component.locator('.plane-stage')).toHaveCount(1);
	await expect(component.locator('.plane-icon')).toHaveCount(1);
	await expect(component.locator('.plane-shadow')).toHaveCount(1);
	await expect(component.locator('.plane-rig, .plane-spring, .plane-trail')).toHaveCount(0);
});

test('paper-plane never reverses during its takeoff', async ({ page }) => {
	const component = page.locator('[data-component="plane-send"]');
	const button = component.locator('button');
	const plane = component.locator('.plane-icon');
	await button.click();
	await expect(button).toHaveAttribute('data-phase', 'sending');

	const poseAt = (currentTime: number) => plane.evaluate((element, time) => {
		const animation = element.getAnimations()[0];
		animation.pause();
		animation.currentTime = time;
		const matrix = new DOMMatrix(getComputedStyle(element).transform);
		return {
			scaleX: Math.hypot(matrix.a, matrix.b),
			scaleY: Math.hypot(matrix.c, matrix.d),
			angle: Math.atan2(matrix.b, matrix.a) * (180 / Math.PI),
			x: matrix.e,
			y: matrix.f,
			opacity: Number(getComputedStyle(element).opacity),
		};
	}, currentTime);

	const samples = [];
	for (const currentTime of [0, 80, 160, 240, 320, 400, 480, 560]) {
		samples.push(await poseAt(currentTime));
	}
	for (let index = 1; index < samples.length; index += 1) {
		expect(samples[index].x).toBeGreaterThanOrEqual(samples[index - 1].x - 0.05);
		expect(samples[index].y).toBeLessThanOrEqual(samples[index - 1].y + 0.05);
		expect(samples[index].scaleX).toBeLessThanOrEqual(samples[index - 1].scaleX + 0.01);
		expect(Math.abs(samples[index].scaleX - samples[index].scaleY)).toBeLessThanOrEqual(0.02);
	}

	const departure = samples.at(-1)!;
	expect(departure.x).toBeGreaterThanOrEqual(34);
	expect(departure.y).toBeLessThanOrEqual(-17);
	expect(departure.scaleX).toBeLessThanOrEqual(0.8);
	expect(departure.scaleX).toBeGreaterThanOrEqual(0.68);
	expect(departure.opacity).toBeGreaterThanOrEqual(0.9);

	expect((await poseAt(640)).opacity).toBeLessThanOrEqual(0.1);
});

test('paper-plane covers substantially more distance near the end of takeoff', async ({ page }) => {
	const plane = page.locator('[data-component="plane-send"] .plane-icon');
	await page.locator('[data-component="plane-send"] button').click();

	const positions = [];
	for (const currentTime of [240, 400, 560]) {
		positions.push(await plane.evaluate((element, time) => {
			const animation = element.getAnimations()[0];
			animation.pause();
			animation.currentTime = time;
			const matrix = new DOMMatrix(getComputedStyle(element).transform);
			return { x: matrix.e, y: matrix.f };
		}, currentTime));
	}
	const distance = (from: { x: number; y: number }, to: { x: number; y: number }) =>
		Math.hypot(to.x - from.x, to.y - from.y);
	const middleDistance = distance(positions[0], positions[1]);
	const finalDistance = distance(positions[1], positions[2]);
	expect(finalDistance / middleDistance).toBeGreaterThanOrEqual(1.75);
});

test('paper-plane re-enters from the lower-left and returns to its dock', async ({ page }) => {
	const plane = page.locator('[data-component="plane-send"] .plane-icon');
	await page.locator('[data-component="plane-send"] button').click();

	const poseAt = (currentTime: number) => plane.evaluate((element, time) => {
		const animation = element.getAnimations()[0];
		animation.pause();
		animation.currentTime = time;
		const matrix = new DOMMatrix(getComputedStyle(element).transform);
		return {
			x: matrix.e,
			y: matrix.f,
			scale: Math.hypot(matrix.a, matrix.b),
			opacity: Number(getComputedStyle(element).opacity),
		};
	}, currentTime);

	expect((await poseAt(700)).opacity).toBeLessThanOrEqual(0.1);
	const reentry = await poseAt(800);
	expect(reentry.x).toBeLessThanOrEqual(-40);
	expect(reentry.y).toBeGreaterThanOrEqual(20);
	expect(reentry.scale).toBeGreaterThanOrEqual(0.68);
	expect(reentry.scale).toBeLessThanOrEqual(0.78);
	expect(reentry.opacity).toBeGreaterThanOrEqual(0.9);

	const approach = await poseAt(1100);
	const docked = await poseAt(1330);
	const distanceFromDock = (pose: { x: number; y: number }) => Math.hypot(pose.x, pose.y);
	expect(distanceFromDock(approach)).toBeLessThan(distanceFromDock(reentry));
	expect(distanceFromDock(approach)).toBeGreaterThan(5);
	expect(distanceFromDock(docked)).toBeLessThanOrEqual(3);
	expect(docked.scale).toBeGreaterThanOrEqual(0.98);
	expect(docked.opacity).toBeGreaterThanOrEqual(0.9);
});

test('paper-plane takeoff restarts with one active flight and shadow animation', async ({ page }) => {
	const component = page.locator('[data-component="plane-send"]');
	const button = component.locator('button');
	const plane = component.locator('.plane-icon');
	const shadow = component.locator('.plane-shadow');
	await button.click();
	await button.click();
	await expect(button).toHaveAttribute('data-phase', 'sending');
	await expect.poll(() => plane.evaluate((element) => element.getAnimations().length)).toBe(1);
	await expect.poll(() => shadow.evaluate((element) => element.getAnimations().length)).toBe(1);
});

test('category filters include new machines and restore the complete library', async ({ page }) => {
	await page.getByRole('button', { name: 'Data' }).click();
	await expect(page.locator('[data-component="signal-peg"]')).toBeVisible();
	await expect(page.locator('[data-component="plane-send"]')).toBeHidden();

	await page.getByRole('button', { name: 'All 31' }).click();
	await expect(page.locator('.lib-card:visible')).toHaveCount(31);
});

test('the component grid does not overflow a narrow viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
	expect(overflow).toBeLessThanOrEqual(0);
	await expect(page.locator('[data-component="conveyor-pager"] .lib-stage')).toBeVisible();
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('state remains understandable when theatrical motion is suppressed', async ({ page }) => {
		await page.goto(libraryUrl);
		const dial = page.locator('[data-component="twist-dial"] button');
		await dial.focus();
		await page.keyboard.press('Enter');
		await expect(dial).toHaveAttribute('aria-checked', 'true');
		await expect(dial.locator('.dial-value')).toHaveText('EN');

		const plane = page.locator('[data-component="plane-send"] button');
		await plane.click();
		await expect(plane).toHaveAttribute('data-phase', 'sent');
		await expect(plane).toHaveAttribute('aria-label', 'Email sent');
		await expect.poll(() => plane.locator('.plane-icon').evaluate((element) => element.getAnimations().length)).toBe(0);

		const inbox = page.locator('[data-component="inbox-blob"] button');
		await inbox.click();
		await expect(inbox).toHaveAttribute('data-unread', '0');
		await expect(inbox).toHaveAttribute('data-state', 'satisfied');
		await expect(inbox).toHaveAttribute('aria-label', 'No unread messages');
	});
});
