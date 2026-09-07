import { expect, test } from '@playwright/test';

test('la stessa superficie cresce dalla hero e lascia spazio ai tre riquadri', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/lab/it/');
  const media = page.locator('.hero-media');
  await expect(media.locator('[data-scene]')).toHaveCount(3);
  const initial = await media.boundingBox();
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(150);
  const expanded = await media.boundingBox();
  expect(expanded!.width).toBeGreaterThan(initial!.width * 1.5);
  await page.locator('.project-entry').first().evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'}));
  await page.waitForTimeout(200);
  const preview = await media.boundingBox();
  const cards = await page.locator('.project-entry').all();
  expect(preview!.width).toBeLessThan(expanded!.width * .7);
  expect(preview!.y).toBeGreaterThanOrEqual(0);
  for (const card of cards) {
    const rect = await card.boundingBox();
    expect(rect!.x).toBeGreaterThan(preview!.x + preview!.width);
    expect(await card.evaluate(el => parseFloat(getComputedStyle(el).borderRadius))).toBeGreaterThan(10);
  }
  await page.locator('.project-link').nth(2).focus();
  await expect(media.locator('[data-scene="2"]')).toHaveCSS('clip-path', 'inset(0px)');
});

test('the preview keeps the selected project when moving from its card to the link', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/lab/en/');
  await page.locator('.project-entry').nth(1).evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'}));
  await page.locator('.project-entry').nth(1).hover();
  const destination = await page.locator('.project-link').nth(1).getAttribute('href');
  const preview = page.locator('.preview-open');
  await expect(preview).toHaveAttribute('href', destination!);
  await preview.hover();
  await expect(preview).toHaveAttribute('href', destination!);
  await expect(page.locator('[data-scene="1"] .preview-tags')).toContainText('Java');
  await preview.click();
  await expect(page).toHaveURL(destination!);
});

test('preview link is unavailable in the hero and keyboard accessible once docked', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/lab/it/');
  const preview = page.locator('.preview-open');
  await expect(preview).toHaveAttribute('tabindex', '-1');
  await page.locator('.project-link').nth(2).focus();
  await expect(preview).toHaveAttribute('tabindex', '0');
  await preview.focus();
  await expect(preview).toHaveAccessibleName(/SpinGO/);
  await expect(preview).toHaveCSS('outline-style', 'solid');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('[data-scene="2"] .preview-tags').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(.001);
  await preview.press('Enter');
  await expect(page).toHaveURL(/spingo-micromobilita-sostenibile/);
});

test('preview tags fit beside the touch target on narrow screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1040]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/lab/it/');
    await page.locator('.project-link').nth(2).focus();
    const geometry = await page.evaluate(() => {
      const action = document.querySelector('.preview-action')!.getBoundingClientRect();
      const screen = document.querySelector('.hero-media')!.getBoundingClientRect();
      const tags = [...document.querySelectorAll('[data-scene="2"] .preview-tags > span')].map(el => el.getBoundingClientRect());
      return { inside: tags.every(tag => tag.left >= screen.left && tag.right <= screen.right && tag.bottom <= screen.bottom), clear: tags.every(tag => tag.right <= action.left || tag.bottom <= action.top), targetHeight: action.height };
    });
    expect(geometry.inside, `${width}: tags fit inside the preview`).toBe(true);
    expect(geometry.clear, `${width}: tags do not overlap the link label`).toBe(true);
    expect(geometry.targetHeight).toBeGreaterThanOrEqual(44);
  }
});
