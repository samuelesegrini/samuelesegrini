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
