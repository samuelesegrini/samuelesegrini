import { expect, test } from '@playwright/test';

const livingUrl = '/motion-playground.html?variant=living';

const sourceIds = [
	'plane-send', 'camera-lens-search', 'trapdoor-download', 'share-ripple',
	'copy-link', 'command-launcher', 'magnet-action', 'split-metric',
	'departure-metric', 'local-clock', 'activity-signal', 'availability-sensor',
	'pixel-weather', 'signal-peg', 'knock-notice', 'inbox-blob',
	'conveyor-pager', 'progress-creature', 'section-checkpoints', 'breadcrumb-cards',
	'view-flip', 'filter-deck', 'twist-dial', 'peel-tab', 'card-shuffle-label',
	'pixel-guest', 'mood-tile', 'magnetic-word', 'timezone-orbit', 'pasted-tag',
	'discovery-die',
];

test('living variant has its own mount and every source has one stable identifier', async ({ page }) => {
	await page.goto(livingUrl);
	await expect(page.locator('#variant-living')).toHaveClass(/active/);
	await expect(page.locator('#living-library-root')).toBeVisible();
	await expect(page.locator('link[href="./living-library.css"]')).toHaveCount(1);
	await expect(page.locator('script[src="./living-library.js"]')).toHaveCount(1);
	for (const id of sourceIds) {
		await expect(page.locator(`#variant-library [data-component="${id}"]`)).toHaveCount(1);
	}
});

test.beforeEach(async ({ page }) => {
	await page.goto(livingUrl);
});

test('living library starts with four independently rendered original creatures', async ({ page }) => {
	await expect(page.getByRole('heading', { name: 'A toolbar that feels alive.' })).toBeVisible();
	await expect(page.locator('.ll-summary')).toHaveText('7 alternatives · 4 original creatures');
	await expect(page.locator('[data-living-kind="original"]')).toHaveCount(4);
	await expect(page.locator('[data-living-id="original-progress-creature"]')).toHaveCount(1);
	await expect(page.locator('[data-living-id="original-inbox-blob"]')).toHaveCount(1);
	await expect(page.locator('[data-living-id="original-pixel-guest"]')).toHaveCount(1);
	await expect(page.locator('[data-living-id="original-mood-tile"]')).toHaveCount(1);
});

test('original creature filter hides non-original groups without touching the component library', async ({ page }) => {
	await page.getByRole('button', { name: 'Originals' }).click();
	await expect(page.locator('.ll-card:visible')).toHaveCount(4);
	await expect(page.locator('#variant-library .lib-card')).toHaveCount(31);
});

test('original creature controls expose visible and accessible state', async ({ page }) => {
	const progress = page.locator('[data-living-id="original-progress-creature"] [data-living-action]');
	await progress.click();
	await expect(progress).toHaveAttribute('aria-label', '65 percent read');
	await expect(progress).toHaveAttribute('data-busy', 'false');

	const mood = page.locator('[data-living-id="original-mood-tile"] [data-living-action]');
	await mood.click();
	await expect(mood).toHaveAttribute('aria-pressed', 'true');
});

test('Pixel Guest switches its visible sprite for a finite celebration', async ({ page }) => {
	const pixel = page.locator('[data-living-id="original-pixel-guest"] [data-living-action]');
	const sprite = pixel.locator('[data-pixel-sprite]');
	await expect(sprite).toHaveAttribute('data-pixel-sprite', 'idle');

	await pixel.click();
	await expect(sprite).toHaveAttribute('data-pixel-sprite', 'celebrate');
	await expect(pixel).toHaveAttribute('data-busy', 'false');
	await expect(sprite).toHaveAttribute('data-pixel-sprite', 'idle');
});

const actionIds = ['courier-moth', 'scout-eye', 'drop-beetle', 'echo-jelly', 'link-twins', 'key-crab', 'compass-pup'];

test('action family exposes seven distinct living alternatives', async ({ page }) => {
	await page.getByRole('button', { name: 'Actions' }).click();
	await expect(page.locator('.ll-card:visible')).toHaveCount(7);
	for (const id of actionIds) await expect(page.locator(`[data-living-id="${id}"]`)).toHaveCount(1);
});

test('courier moth launches once, confirms send, and settles', async ({ page }) => {
	const control = page.locator('[data-living-id="courier-moth"] [data-living-action]');
	await control.click();
	await expect(control).toHaveAttribute('data-busy', 'true');
	await control.click({ force: true });
	await expect(control).toHaveAttribute('aria-label', 'Sending email');
	await expect(control).toHaveAttribute('data-busy', 'false', { timeout: 1600 });
	await expect(control).toHaveAttribute('aria-label', 'Email sent');
});

test('an alternative links to and focuses its exact source card', async ({ page }) => {
	const source = page.locator('[data-component="plane-send"]');
	const phaseBefore = await source.locator('button').getAttribute('data-phase');
	await page.locator('[data-living-id="courier-moth"] .ll-source-link').click();
	await expect(page.locator('#variant-library')).toHaveClass(/active/);
	await expect(source).toBeFocused();
	await expect(source.locator('button')).toHaveAttribute('data-phase', phaseBefore!);
	await expect(page.locator('#variant-library').getByRole('button', { name: 'All 31' })).toHaveClass(/active/);
});
