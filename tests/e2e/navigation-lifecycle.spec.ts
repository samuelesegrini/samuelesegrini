import { expect, test } from '@playwright/test';

test('archive filters still work after leaving and revisiting through client navigation', async ({ page }) => {
	await page.goto('/it/progetti/');
	const archive = page.locator('[data-project-archive]');
	const packageFilter = archive.getByRole('button', { name: 'Pacchetti', exact: true });

	await packageFilter.click();
	await expect(archive.locator('[data-project-item]:not([hidden])')).toHaveCount(1);
	await expect(packageFilter).toHaveAttribute('aria-pressed', 'true');

	await page.getByRole('link', { name: 'Samuele Segrini, home' }).click();
	await expect(page).toHaveURL(/\/it\/$/);
	await page.getByRole('link', { name: 'Progetti' }).first().click();
	await expect(page).toHaveURL(/\/it\/progetti\/$/);

	const revisitedArchive = page.locator('[data-project-archive]');
	const revisitedPackageFilter = revisitedArchive.getByRole('button', { name: 'Pacchetti', exact: true });
	await revisitedPackageFilter.click();
	await expect(revisitedArchive.locator('[data-project-item]:not([hidden])')).toHaveCount(1);
	await expect(revisitedPackageFilter).toHaveAttribute('aria-pressed', 'true');
});

test('article table of contents tracks chapters after leaving and revisiting through client navigation', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	const article = '/it/articoli/il-mio-primo-videogioco-era-un-sistema-distribuito/';
	await page.goto(article);

	const toc = page.getByRole('navigation', { name: "Indice dell'articolo" });
	const firstChapter = toc.getByRole('link', { name: 'Il gioco che immaginavo' });
	await expect(firstChapter).toHaveAttribute('aria-current', 'location');

	await page.getByRole('link', { name: 'Articoli' }).first().click();
	await expect(page).toHaveURL(/\/it\/articoli\/$/);
	await page.locator('.post-card').filter({ hasText: 'Il mio primo videogioco era un sistema distribuito' }).getByRole('link').click();
	await expect(page).toHaveURL(article);

	const revisitedToc = page.getByRole('navigation', { name: "Indice dell'articolo" });
	const revisitedFirstChapter = revisitedToc.getByRole('link', { name: 'Il gioco che immaginavo' });
	const revisitedSecondChapter = revisitedToc.getByRole('link', { name: 'Prima dello schermo veniva il sistema' });
	await expect(revisitedFirstChapter).toHaveAttribute('aria-current', 'location');
	await page.locator('#prima-dello-schermo-veniva-il-sistema').evaluate((heading) => {
		heading.scrollIntoView({ block: 'center' });
	});
	await expect(revisitedSecondChapter).toHaveAttribute('aria-current', 'location');
	await expect(revisitedToc.locator('[aria-current="location"]')).toHaveCount(1);
});
