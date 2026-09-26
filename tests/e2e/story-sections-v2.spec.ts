import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Il sipario si vede una volta per sessione: alle visite successive non c'è niente da aspettare.
const arriva = (page: Page) => page.waitForFunction(() => !document.documentElement.hasAttribute('data-caricando'), null, { timeout: 8000 });

// Il catalogo della seconda serie di sezioni: ogni componente con contenuti veri, le scelte
// fatte con radio e :has(), le poche parti che hanno bisogno di JavaScript.
const route = '/en/preview/sections-v2/';

const blocks = [
	'.st-mhero', '.st-ahero', '.st-dhero', '.st-lockup',
	'.st-hgallery', '.st-mcards', '.st-fx', '.st-toggle', '.st-explainer',
	'.st-stats', '.st-thennow', '.st-lineup', '.st-matrix', '.st-findings', '.st-techspecs', '.st-limits2', '.st-sources',
	'.st-decl', '.st-csteps', '.st-anatomy', '.st-exploded', '.st-modules', '.st-states', '.st-changelog', '.st-principles',
	'.st-contrib', '.st-faq2', '.st-keep', '.st-index',
	// la terza serie: dai vuoti dell'analisi e dalle misure del movimento
	'.st-intro', '.st-scenes', '.st-lit', '.st-bento', '.st-objects-row', '.st-shot', '.st-ba', '.st-bars', '.st-plus-grid',
];

test('every section of the second and third series renders, and the dock indexes the five groups', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	for (const block of blocks) await expect(page.locator(`.st-page ${block}`).first(), block).toBeAttached();
	expect(blocks).toHaveLength(38);

	const sections = await page.locator('.page-sheet [data-section]').evaluateAll((nodes) => nodes.map((node) => Number((node as HTMLElement).dataset.section)));
	expect(sections).toEqual([0, 1, 2, 3, 4, 5]);

	// le cifre in apice portano alle note delle fonti
	for (const note of await page.locator('.st-stats-method sup a').all()) {
		const href = await note.getAttribute('href');
		await expect(page.locator(href!)).toHaveCount(1);
	}
	// l'esploso è calcolato: quattro piastre e i tratteggi fra una e l'altra
	await expect(page.locator('.st-exploded .st-iso-plate')).toHaveCount(4);
	await expect(page.locator('.st-exploded .st-iso-link')).toHaveCount(6);
});

test('the second series reflows without horizontal scroll and stays accessible', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const width of [390, 768, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(route);
		await arriva(page);
		expect(await page.evaluate(() => document.documentElement.scrollWidth), `overflow at ${width}`).toBeLessThanOrEqual(width);
		if (width !== 768) {
			const results = await new AxeBuilder({ page }).include('.st-page').analyze();
			expect(results.violations).toEqual([]);
		}
	}
});

test('radio-driven sections switch without script: explorer, toggle figure and code steps', async ({ page }) => {
	await page.goto(route);
	await arriva(page);

	const fx = page.locator('.st-fx');
	await expect(fx.locator('.st-fx-screen[data-fx-screen="0"]')).toBeVisible();
	await fx.locator('.st-fx-list').getByText('Kitchen', { exact: true }).click();
	await expect(fx.getByRole('radio', { name: 'Kitchen' })).toBeChecked();
	await expect(fx.locator('.st-fx-screen[data-fx-screen="2"]')).toBeVisible();
	await expect(fx.locator('.st-fx-screen[data-fx-screen="0"]')).toBeHidden();

	const toggle = page.locator('.st-toggle');
	await toggle.getByText('2026 · rebuild').click();
	await expect(toggle.locator('.st-toggle-panel[data-tf-panel="1"]')).toBeVisible();
	await expect(toggle.locator('.st-toggle-panel[data-tf-panel="0"]')).toBeHidden();
	await expect(toggle.locator('figcaption [data-tf-panel="1"]')).toContainText('ClientState');

	// il terzo passo accende le righe 5 e 6 del sorgente, spegne quelle del primo e stampa la riga
	const steps = page.locator('.st-csteps');
	const lit = (line: number) => steps.locator(`.line[data-line="${line}"]`).evaluate((node) => getComputedStyle(node).boxShadow.includes('199, 255, 159'));
	expect(await lit(1)).toBe(true);
	await expect(steps.locator('[data-from="2"]')).toBeHidden();
	await steps.getByText('One line per dish.').click();
	await expect.poll(() => lit(5)).toBe(true);
	await expect.poll(() => lit(1)).toBe(false);
	await expect(steps.locator('[data-from="2"]')).toBeVisible();
	await expect(steps.locator('[data-until="0"]')).toBeHidden();

	// le frecce spostano la scelta e si spengono all'ultimo passo
	await steps.getByRole('button', { name: 'Next step' }).click();
	await expect(steps.getByRole('radio', { name: 'One total per payment method.' })).toBeChecked();
	await steps.getByRole('button', { name: 'Next step' }).click();
	await expect(steps.getByRole('button', { name: 'Next step' })).toBeDisabled();
});

test('one answer open at a time, and the gallery follows its dots', async ({ page }) => {
	await page.goto(route);
	await arriva(page);

	const faq = page.locator('.st-faq2 details');
	await expect(faq.first()).toHaveAttribute('open', '');
	await faq.nth(1).locator('summary').click();
	await expect(faq.nth(1)).toHaveAttribute('open', '');
	await expect(faq.first()).not.toHaveAttribute('open', '');

	const gallery = page.locator('.st-hgallery');
	const dots = gallery.getByRole('group', { name: 'Choose a highlight' }).getByRole('button');
	await expect(dots).toHaveCount(5);
	await expect(dots.first()).toHaveAttribute('aria-pressed', 'true');
	await dots.nth(2).click();
	await expect(dots.nth(2)).toHaveAttribute('aria-pressed', 'true');
	await expect(dots.first()).toHaveAttribute('aria-pressed', 'false');
	await expect.poll(() => gallery.locator('[data-hg-track]').evaluate((track) => track.scrollLeft)).toBeGreaterThan(0);

	// il tasto passa da riproduci a pausa e ritorno, qualunque fosse lo stato dopo il pallino
	const toggle = gallery.locator('[data-hg-play]');
	const before = (await toggle.getAttribute('aria-label'))!;
	expect(['Play the highlights', 'Pause the highlights']).toContain(before);
	await toggle.click();
	await expect(toggle).not.toHaveAttribute('aria-label', before);
	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-label', before);
});
