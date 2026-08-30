import { expect, test } from '@playwright/test';

test('Italian homepage presents the editorial portfolio hierarchy', async ({ page }) => {
	await page.goto('/it/');

	await expect(page).toHaveTitle(/Software Engineer/);
	await expect(page.getByRole('link', { name: 'Samuele Segrini, home' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'dall’interfaccia all’infrastruttura',
	);
	await expect(page.getByRole('heading', { name: 'Progetti in evidenza' })).toBeVisible();
	await expect(page.locator('[data-featured-project]')).toHaveCount(3);
	await expect(page.locator('[data-featured-project]').first().locator('.project-role')).toBeVisible();
	await expect(page.getByRole('link', { name: 'EasyManager', exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Ultimi articoli' })).toBeVisible();
	await expect(page.getByRole('link', { name: /English/ })).toHaveAttribute('href', '/en/');
	await expect(page.locator('footer').getByRole('link', { name: 'Email' })).toHaveAttribute(
		'href',
		'mailto:samuele.segrini@gmail.com',
	);
	await expect(page.locator('footer').getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
		'href',
		'https://www.linkedin.com/in/samuele-segrini-221443241/',
	);
	await expect(page.locator('footer').getByRole('link', { name: 'GitHub' })).toHaveAttribute(
		'href',
		'https://github.com/samuelesegrini',
	);
});

test('root sends visitors to the Italian default locale', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/it\/$/);
});

test('featured trio publishes EasyManager, Galaxy Trucker, and SpinGO in both locales', async ({ page }) => {
	for (const path of ['/it/', '/en/']) {
		await page.goto(path);
		await expect(page.locator('[data-featured-project] h3')).toHaveText([
			'EasyManager',
			'Galaxy Trucker',
			'SpinGO',
		]);
	}
});

test('featured artwork motion keeps Galaxy Trucker and SpinGO covers accessible', async ({ page }) => {
	for (const sample of [
		{
			path: '/it/',
			galaxyAlt: 'Nave modulare geometrica collegata tramite un server a quattro client',
			spingoAlt: 'Illustrazione geometrica di una bicicletta collegata da un percorso verde acido a un punto sicuro',
		},
		{
			path: '/en/',
			galaxyAlt: 'Geometric modular spaceship connected through a server to four clients',
			spingoAlt: 'Geometric illustration of a bicycle connected by an acid-lime route to a safe destination',
		},
	]) {
		await page.goto(sample.path);

		const galaxy = page.locator('[data-featured-project]').nth(1);
		await expect(galaxy.locator('[data-artwork-treatment]')).toHaveAttribute(
			'data-artwork-treatment',
			'galaxy-network',
		);
		await expect(galaxy.getByRole('img', { name: sample.galaxyAlt })).toBeVisible();

		const spingo = page.locator('[data-featured-project]').nth(2);
		await expect(spingo.locator('[data-artwork-treatment]')).toHaveAttribute(
			'data-artwork-treatment',
			'spingo-route',
		);
		await expect(spingo.getByRole('img', { name: sample.spingoAlt })).toBeVisible();
	}
});

test('featured artwork motion renders the Galaxy network and SpinGO route identities without metrics', async ({ page }) => {
	await page.goto('/it/');

	const galaxyOverlay = page.locator('[data-artwork-treatment="galaxy-network"] [data-artwork-overlay]');
	await expect(galaxyOverlay.locator('[data-artwork-node="client"]')).toHaveCount(4);
	await expect(galaxyOverlay.locator('[data-artwork-node="authoritative-server"]')).toHaveCount(1);
	expect(await galaxyOverlay.evaluate((overlay) => overlay.textContent?.trim())).toBe('');

	const spingoOverlay = page.locator('[data-artwork-treatment="spingo-route"] [data-artwork-overlay]');
	await expect(spingoOverlay.locator('[data-artwork-marker]')).toHaveCount(3);
	expect(await spingoOverlay.evaluate((overlay) => overlay.textContent?.trim())).toBe('');
});

test('Galaxy artwork motion establishes a bounded connection', async ({ browser }) => {
	const context = await browser.newContext({
		baseURL: 'http://127.0.0.1:4321',
		reducedMotion: 'no-preference',
	});
	const page = await context.newPage();
	await page.goto('/it/');

	const iterationCount = await page
		.locator('[data-artwork-treatment="galaxy-network"] [data-artwork-motion]')
		.first()
		.evaluate((element) => getComputedStyle(element).animationIterationCount);
	expect(iterationCount).toBe('1');

	await context.close();
});

test('artwork motion is limited to featured cards', async ({ page }) => {
	await page.goto('/it/progetti/');
	const archiveGalaxy = page.locator('[data-project-item][data-project-key="galaxy-trucker"]');
	await expect(archiveGalaxy.locator('[data-artwork-treatment]')).toHaveCount(0);
	await expect(archiveGalaxy.getByRole('img', {
		name: 'Nave modulare geometrica collegata tramite un server a quattro client',
	})).toBeVisible();
	const archiveSpinGO = page.locator('[data-project-item][data-project-key="spingo-sustainable-micromobility"]');
	await expect(archiveSpinGO.locator('[data-artwork-treatment]')).toHaveCount(0);
	await expect(archiveSpinGO.getByRole('img', {
		name: 'Illustrazione geometrica di una bicicletta collegata da un percorso verde acido a un punto sicuro',
	})).toBeVisible();

	await page.goto('/it/articoli/ricostruire-galaxy-trucker-con-claude/');
	const relatedGalaxy = page.locator('.related-work [data-project-key="galaxy-trucker"]');
	await expect(relatedGalaxy.locator('[data-artwork-treatment]')).toHaveCount(0);
	await expect(relatedGalaxy.getByRole('img', {
		name: 'Nave modulare geometrica collegata tramite un server a quattro client',
	})).toBeVisible();
});

test('featured artwork reduced motion stops decorative overlays', async ({ browser }) => {
	const context = await browser.newContext({
		baseURL: 'http://127.0.0.1:4321',
		reducedMotion: 'reduce',
	});
	const page = await context.newPage();
	await page.goto('/it/');

	for (const treatment of ['galaxy-network', 'spingo-route']) {
		const artwork = page.locator(`[data-artwork-treatment="${treatment}"]`);
		const overlay = artwork.locator('[data-artwork-overlay]');
		await expect(overlay).toBeVisible();
		const motion = await overlay.locator('[data-artwork-motion]').first().evaluate((element) => {
			const style = getComputedStyle(element);
			return { animationDuration: style.animationDuration, animationName: style.animationName };
		});
		expect(motion.animationDuration === '0.01ms' || motion.animationName === 'none').toBe(true);
	}

	await expect(page.getByRole('img', {
		name: 'Nave modulare geometrica collegata tramite un server a quattro client',
	})).toBeVisible();
	await expect(page.getByRole('img', {
		name: 'Illustrazione geometrica di una bicicletta collegata da un percorso verde acido a un punto sicuro',
	})).toBeVisible();

	await context.close();
});

test('featured artwork motion stays contained by non-lead mobile cards', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 780 });
	await page.goto('/it/');

	for (const treatment of ['galaxy-network', 'spingo-route']) {
		const card = page.locator(`[data-featured-project]:has([data-artwork-treatment="${treatment}"])`);
		const overlay = card.locator('[data-artwork-overlay]');
		await overlay.scrollIntoViewIfNeeded();
		const cardBox = await card.boundingBox();
		const overlayBox = await overlay.boundingBox();
		expect(cardBox).not.toBeNull();
		expect(overlayBox).not.toBeNull();
		expect(overlayBox!.x).toBeGreaterThanOrEqual(cardBox!.x);
		expect(overlayBox!.y).toBeGreaterThanOrEqual(cardBox!.y);
		expect(overlayBox!.x + overlayBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width);
		expect(overlayBox!.y + overlayBox!.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height);
	}
});

test('English routes and localized language switches remain paired', async ({ page }) => {
	await page.goto('/en/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'from interface to infrastructure',
	);
	await expect(page.locator('[data-featured-project]').first().locator('.project-role')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Featured projects' })).toBeVisible();
	await page.getByRole('link', { name: 'EasyManager', exact: true }).click();
	await expect(page).toHaveURL(/\/en\/projects\/easymanager-restaurant-operations\/$/);
	await expect(page.getByRole('link', { name: /Italiano/ })).toHaveAttribute(
		'href',
		'/it/progetti/easymanager-operazioni-ristorante/',
	);
	await expect(page.getByText('Product designer and software engineer', { exact: true })).toBeVisible();
});

test('EasyManager service pulse exposes five localized states and repository evidence', async ({ page }) => {
	for (const sample of [
		{
			home: '/it/',
			label: 'Flusso operativo EasyManager',
			step: 'Risposta del server',
			status:
				'Risposta del server. Se l’esecuzione è incerta, il flusso viene riconciliato senza retry ciechi.',
			detail: '/it/progetti/easymanager-operazioni-ristorante/',
			links: [
				{ label: 'Applicazione originale', href: 'https://github.com/samuelesegrini/easymanager' },
				{ label: 'Reingegnerizzazione successiva', href: 'https://github.com/samuelesegrini/easymanager-pos' },
			],
		},
		{
			home: '/en/',
			label: 'EasyManager operations flow',
			step: 'Server acknowledgement',
			status:
				'Server acknowledgement. Uncertain execution is reconciled without a blind retry.',
			detail: '/en/projects/easymanager-restaurant-operations/',
			links: [
				{ label: 'Original application', href: 'https://github.com/samuelesegrini/easymanager' },
				{ label: 'Later re-engineering', href: 'https://github.com/samuelesegrini/easymanager-pos' },
			],
		},
	]) {
		await page.goto(sample.home);
		const pulse = page.locator('[data-service-pulse]');
		await expect(pulse).toHaveAttribute('aria-label', sample.label);
		await expect(pulse.locator('[data-pulse-step]')).toHaveCount(5);
		await pulse.getByRole('button', { name: sample.step, exact: true }).click();
		await expect(pulse).toHaveAttribute('data-active-step', '3');
		await expect(pulse.locator('[aria-live="polite"]')).toHaveText(sample.status);

		await page.goto(sample.detail);
		for (const link of sample.links) {
			await expect(page.locator('.project-links a').filter({ hasText: link.label })).toHaveAttribute(
				'href',
				link.href,
			);
		}
	}
});

test('EasyManager remains complete and linked when JavaScript is disabled', async ({ browser }) => {
	const context = await browser.newContext({
		baseURL: 'http://127.0.0.1:4321',
		javaScriptEnabled: false,
	});
	const page = await context.newPage();
	await page.goto('/it/');

	const pulse = page.locator('[data-service-pulse]');
	for (const step of [
		'Bozza del tavolo',
		'Outbox persistente',
		'Risposta del server',
		'Corsia del dispositivo',
		'Registro fiscale',
	]) {
		await expect(pulse.getByText(step, { exact: true })).toBeVisible();
	}
	await expect(page.getByRole('link', { name: 'EasyManager', exact: true })).toHaveAttribute(
		'href',
		'/it/progetti/easymanager-operazioni-ristorante/',
	);

	await context.close();
});

test('EasyManager mobile service pulse leaves the project title uncovered', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 780 });
	await page.goto('/it/');

	const card = page.locator('[data-featured-project][data-project-key="easymanager"]');
	const pulse = card.locator('[data-service-pulse]');
	const title = card.locator('h3');
	await title.scrollIntoViewIfNeeded();

	const pulseBox = await pulse.boundingBox();
	const titleBox = await title.boundingBox();
	expect(pulseBox).not.toBeNull();
	expect(titleBox).not.toBeNull();
	expect(pulseBox!.y + pulseBox!.height).toBeLessThanOrEqual(titleBox!.y);

	const titleCenterActivatesLink = await page.evaluate(
		({ x, y }) => document.elementFromPoint(x, y)?.closest('.project-card-link') !== null,
		{ x: titleBox!.x + titleBox!.width / 2, y: titleBox!.y + titleBox!.height / 2 },
	);
	expect(titleCenterActivatesLink).toBe(true);
});

test('EasyManager card surface preserves whole-card activation across card contexts', async ({ page }) => {
	const clickCenter = async (selector: string) => {
		const region = page.locator(selector);
		await region.scrollIntoViewIfNeeded();
		const box = await region.boundingBox();
		expect(box).not.toBeNull();
		await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
	};

	await page.goto('/it/');
	await clickCenter('[data-featured-project][data-project-key="easymanager"] .project-meta');
	await expect(page).toHaveURL(/\/it\/progetti\/easymanager-operazioni-ristorante\/$/);

	await page.goto('/it/progetti/');
	await clickCenter('[data-project-item][data-project-key="highway-route-planner"] .project-card-copy > p:not([class])');
	await expect(page).toHaveURL(/\/it\/progetti\/pianificatore-percorsi-autostradali\/$/);

	await page.goto('/it/articoli/ricostruire-galaxy-trucker-con-claude/');
	await clickCenter('.related-work [data-project-key="galaxy-trucker"] .project-meta');
	await expect(page).toHaveURL(/\/it\/progetti\/galaxy-trucker-progetto-java\/$/);
});

test('Highway Route Planner uses its dedicated route illustration in both locales', async ({ page }) => {
	for (const path of [
		'/it/progetti/pianificatore-percorsi-autostradali/',
		'/en/projects/highway-route-planner/',
	]) {
		await page.goto(path);
		const illustration = page.locator('.detail-hero > img');
		await expect(illustration).toHaveAttribute(
			'src',
			'/images/projects/highway-route-planner.svg',
		);
		expect(await illustration.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
	}
});

test('second featured project opens the paired Galaxy Trucker case study', async ({ page }) => {
	await page.goto('/it/');
	const secondProject = page.locator('[data-featured-project]').nth(1);
	await expect(secondProject).toContainText('Galaxy Trucker');
	await secondProject.getByRole('link').click();
	await expect(page).toHaveURL(/\/it\/progetti\/galaxy-trucker-progetto-java\/$/);
	await expect(page.getByRole('link', { name: /English/ })).toHaveAttribute(
		'href',
		'/en/projects/galaxy-trucker-java-project/',
	);
	await expect(
		page.getByText('Sviluppatore nel team; autore della ricostruzione assistita da AI', { exact: true }),
	).toBeVisible();
});

test('Priority Task Queue Manager uses its dedicated queue illustration in both locales', async ({ page }) => {
	for (const path of [
		'/it/progetti/gestore-coda-task-priorita/',
		'/en/projects/priority-task-queue-manager/',
	]) {
		await page.goto(path);
		const illustration = page.locator('.detail-hero > img');
		await expect(illustration).toHaveAttribute(
			'src',
			'/images/projects/priority-task-queue-manager.svg',
		);
		expect(await illustration.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
	}
});

test('third featured project publishes the bilingual SpinGO case study', async ({ page }) => {
	await page.goto('/it/');
	const thirdProject = page.locator('[data-featured-project]').nth(2);
	await expect(thirdProject).toContainText('SpinGO');
	await thirdProject.getByRole('link').click();

	await expect(page).toHaveURL(/\/it\/progetti\/spingo-micromobilita-sostenibile\/$/);
	await expect(
		page.getByText('Frontend developer e membro del team HCI', { exact: true }),
	).toBeVisible();
	await expect(page.locator('.project-links').getByRole('link', { name: /Repository del team/ })).toHaveAttribute(
		'href',
		'https://github.com/milenaramosduran/hci-eco',
	);
	await expect(page.locator('.project-links').getByRole('link', { name: /Sito del progetto/ })).toHaveAttribute(
		'href',
		'https://milenaramosduran.github.io/hci-eco/',
	);
	await expect(page.getByRole('link', { name: /English/ })).toHaveAttribute(
		'href',
		'/en/projects/spingo-sustainable-micromobility/',
	);
	await expect(page.locator('.project-outcomes')).toContainText('109');
	await expect(page.locator('.project-outcomes')).toContainText('89.2');

	await page.goto('/en/projects/spingo-sustainable-micromobility/');
	await expect(
		page.getByText('Frontend developer and HCI team member', { exact: true }),
	).toBeVisible();
	await expect(page.getByRole('link', { name: /Italiano/ })).toHaveAttribute(
		'href',
		'/it/progetti/spingo-micromobilita-sostenibile/',
	);
});

test('SpinGO uses its custom illustration in both locales', async ({ page }) => {
	await page.goto('/it/');
	const italianIllustration = page.getByRole('img', {
		name: 'Illustrazione geometrica di una bicicletta collegata da un percorso verde acido a un punto sicuro',
	});
	await expect(italianIllustration).toBeVisible();
	expect(await italianIllustration.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

	await page.goto('/en/projects/spingo-sustainable-micromobility/');
	const englishIllustration = page.getByRole('img', {
		name: 'Geometric illustration of a bicycle connected by an acid-lime route to a safe destination',
	});
	await expect(englishIllustration).toBeVisible();
	expect(await englishIllustration.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test('Galaxy Trucker publishes paired localized case-study routes', async ({
	page,
}) => {
	await page.goto('/it/progetti/');
	await page.getByRole('link', { name: 'Galaxy Trucker' }).click();

	await expect(page).toHaveURL(/\/it\/progetti\/galaxy-trucker-progetto-java\/$/);
	const englishSwitch = page.getByRole('link', { name: /English/ });
	await expect(englishSwitch).toHaveAttribute(
		'href',
		'/en/projects/galaxy-trucker-java-project/',
	);
	await englishSwitch.click();

	await expect(page).toHaveURL(/\/en\/projects\/galaxy-trucker-java-project\/$/);
	await expect(page.getByRole('link', { name: /Italiano/ })).toHaveAttribute(
		'href',
		'/it/progetti/galaxy-trucker-progetto-java/',
	);
});

test('Galaxy Trucker uses its dedicated network illustration in both locales', async ({ page }) => {
	for (const path of [
		'/it/progetti/galaxy-trucker-progetto-java/',
		'/en/projects/galaxy-trucker-java-project/',
	]) {
		await page.goto(path);
		const illustration = page.locator('.detail-hero > img');
		await expect(illustration).toHaveAttribute(
			'src',
			'/images/projects/galaxy-trucker-network.png',
		);
		expect(await illustration.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
	}
});

test('technical case studies render their contextual explainer in both locales', async ({ page }) => {
	const caseStudies = [
		{
			paths: [
				'/it/progetti/pianificatore-percorsi-autostradali/',
				'/en/projects/highway-route-planner/',
			],
			asset: '/images/projects/explainers/highway-implicit-graph.svg',
		},
		{
			paths: [
				'/it/progetti/gestore-coda-task-priorita/',
				'/en/projects/priority-task-queue-manager/',
			],
			asset: '/images/projects/explainers/priority-queue-insertion.svg',
		},
		{
			paths: [
				'/it/progetti/galaxy-trucker-progetto-java/',
				'/en/projects/galaxy-trucker-java-project/',
			],
			asset: '/images/projects/explainers/galaxy-authoritative-server.svg',
		},
		{
			paths: [
				'/it/progetti/spingo-micromobilita-sostenibile/',
				'/en/projects/spingo-sustainable-micromobility/',
			],
			asset: '/images/projects/explainers/spingo-research-loop.svg',
		},
	];

	for (const { paths, asset } of caseStudies) {
		for (const path of paths) {
			await page.setViewportSize({ width: 1280, height: 900 });
			await page.goto(path);
			const explainer = page.locator('.project-explainer');
			await expect(explainer).toHaveCount(1);
			expect((await explainer.boundingBox())?.width).toBeLessThanOrEqual(760);
			const verticalMargins = await explainer.evaluate((item) => {
				const style = getComputedStyle(item);
				return [Number.parseFloat(style.marginTop), Number.parseFloat(style.marginBottom)];
			});
			expect(Math.max(...verticalMargins)).toBeLessThanOrEqual(24);
			await expect(explainer.locator('figcaption')).not.toBeEmpty();
			const image = explainer.locator('img');
			await expect(image).toHaveAttribute('src', asset);
			await image.scrollIntoViewIfNeeded();
			await expect.poll(() => image.evaluate((item: HTMLImageElement) => item.naturalWidth)).toBeGreaterThan(0);

			await page.setViewportSize({ width: 390, height: 844 });
			await page.goto(path);
			const mobileExplainer = page.locator('.project-explainer');
			expect((await mobileExplainer.boundingBox())!.width).toBeLessThanOrEqual(342);
			expect(Number.parseFloat(await mobileExplainer.locator('figcaption').evaluate((item) => getComputedStyle(item).fontSize))).toBeGreaterThanOrEqual(11);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
		}
	}
});

test('Galaxy Trucker exposes related writing as compact project evidence', async ({ page }) => {
	for (const sample of [
		{ path: '/it/progetti/galaxy-trucker-progetto-java/', label: 'Approfondimenti', action: "Leggi l'articolo" },
		{ path: '/en/projects/galaxy-trucker-java-project/', label: 'Go deeper', action: 'Read article' },
	]) {
		await page.goto(sample.path);
		const rail = page.locator('.project-writing');
		await expect(rail.getByText(sample.label, { exact: true })).toBeVisible();
		await expect(rail.locator('.related-writing-list a')).toHaveCount(2);
		await expect(page.locator('.related-section .related-writing-list').getByText(sample.action, { exact: true })).toHaveCount(2);
		await expect(page.locator('.related-section .post-card')).toHaveCount(0);
	}
});

test('Galaxy Trucker and its AI reconstruction article link in both directions', async ({
	page,
}) => {
	await page.goto('/it/progetti/galaxy-trucker-progetto-java/');
	const relatedArticle = page.getByRole('link', {
		name: 'Ricostruire Galaxy Trucker con Claude: cosa è cambiato, cosa no e come misurarlo',
		exact: true,
	});
	await relatedArticle.click();

	await expect(page).toHaveURL(
		/\/it\/articoli\/ricostruire-galaxy-trucker-con-claude\/$/,
	);
	await expect(page.getByRole('link', { name: /English/ })).toHaveAttribute(
		'href',
		'/en/writing/rebuilding-galaxy-trucker-with-claude/',
	);
	await expect(page.locator('.related-work').getByRole('link')).toHaveAttribute(
		'href',
		'/it/progetti/galaxy-trucker-progetto-java/',
	);
});

test('the Claude reconstruction separates conditions from supported conclusions', async ({ page }) => {
	for (const sample of [
		{
			path: '/it/articoli/ricostruire-galaxy-trucker-con-claude/',
			headers: ['Progetto originale', 'Ricostruzione assistita', 'Conclusione sostenibile'],
		},
		{
			path: '/en/writing/rebuilding-galaxy-trucker-with-claude/',
			headers: ['Original project', 'AI-assisted rebuild', 'Supported conclusion'],
		},
	]) {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(sample.path);
		const table = page.locator('.evidence-comparison');
		for (const header of sample.headers) {
			await expect(table.getByRole('columnheader', { name: header })).toBeVisible();
		}
		await expect(table).not.toContainText(/\d+x|percent|percento/i);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
	}
});

test('Galaxy Trucker links a second bilingual personal article', async ({ page }) => {
	await page.goto('/it/progetti/galaxy-trucker-progetto-java/');
	const personalArticle = page.locator('.related-section').locator(
		'a[href="/it/articoli/il-mio-primo-videogioco-era-un-sistema-distribuito/"]',
	);
	await expect(personalArticle).toBeVisible();
	await personalArticle.click();

	await expect(page).toHaveURL(
		/\/it\/articoli\/il-mio-primo-videogioco-era-un-sistema-distribuito\/$/,
	);
	await expect(page.getByRole('link', { name: /English/ })).toHaveAttribute(
		'href',
		'/en/writing/my-first-video-game-was-a-distributed-system/',
	);
	await expect(page.locator('.related-work').getByRole('link')).toHaveAttribute(
		'href',
		'/it/progetti/galaxy-trucker-progetto-java/',
	);
});

test('project links identify ownership while contact remains the primary action', async ({ page }) => {
	await page.goto('/it/progetti/spingo-micromobilita-sostenibile/');
	const repository = page.locator('.project-links').getByRole('link', { name: /Repository del team/ });
	const contact = page.getByRole('link', { name: 'Parliamone' });

	await expect(repository).toBeVisible();
	await expect(repository).toContainText('github.com');
	await expect(repository).toContainText('Repository del team');
	await expect(contact).toBeVisible();
	const contactBackground = await contact.evaluate(
		(element) => getComputedStyle(element).backgroundColor,
	);
	expect(contactBackground).toBe('rgb(199, 255, 159)');
});

test('project cover remains wide while using a compact editorial crop', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/progetti/pianificatore-percorsi-autostradali/');

	const cover = page.locator('.detail-hero > img');
	await expect(cover).toBeVisible();
	const box = await cover.boundingBox();
	expect(box).not.toBeNull();
	expect(box!.height / box!.width).toBeLessThan(0.4);
});

test('project cover aligns beneath the primary title column on desktop', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/progetti/pianificatore-percorsi-autostradali/');

	const titleColumn = await page.locator('.detail-title > div').boundingBox();
	const titleGrid = await page.locator('.detail-title').boundingBox();
	const cover = await page.locator('.detail-hero > img').boundingBox();

	expect(titleColumn).not.toBeNull();
	expect(titleGrid).not.toBeNull();
	expect(cover).not.toBeNull();
	expect(Math.abs(cover!.x - titleColumn!.x)).toBeLessThanOrEqual(1);
	expect(Math.abs(cover!.width - titleColumn!.width)).toBeLessThanOrEqual(1);
	expect(cover!.width).toBeLessThan(titleGrid!.width);
});

test('project detail eyebrow starts closer to the site header', async ({ page }) => {
	for (const viewport of [
		{ width: 1280, height: 900 },
		{ width: 390, height: 844 },
	]) {
		await page.setViewportSize(viewport);
		await page.goto('/it/progetti/pianificatore-percorsi-autostradali/');

		const topPadding = await page.locator('.detail-hero').evaluate(
			(element) => Number.parseFloat(getComputedStyle(element).paddingTop),
		);
		expect(topPadding).toBeGreaterThanOrEqual(112);
		expect(topPadding).toBeLessThanOrEqual(128);
	}
});

test('project hero stays near one viewport without clipping short desktop layouts', async ({ page }) => {
	for (const sample of [
		{ viewport: { width: 1440, height: 900 }, maxRatio: 1.05 },
		{ viewport: { width: 1280, height: 720 }, maxRatio: 1.2 },
	]) {
		await page.setViewportSize(sample.viewport);
		await page.goto('/it/progetti/pianificatore-percorsi-autostradali/');

		const dimensions = await page.locator('.detail-hero').evaluate((hero) => ({
			heroHeight: hero.getBoundingClientRect().height,
			coverHeight: hero.querySelector('img')?.getBoundingClientRect().height ?? 0,
		}));
		expect(dimensions.heroHeight / sample.viewport.height).toBeLessThanOrEqual(sample.maxRatio);
		expect(dimensions.coverHeight).toBeGreaterThanOrEqual(224);
	}
});

test('project headings stay in the reading column while the rail provides navigation', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/progetti/pianificatore-percorsi-autostradali/');

	const heading = page.locator('.detail-grid h2').first();
	const openingParagraph = page.locator('.detail-grid h2 + p').first();
	const headingBox = await heading.boundingBox();
	const paragraphBox = await openingParagraph.boundingBox();

	expect(headingBox).not.toBeNull();
	expect(paragraphBox).not.toBeNull();
	expect(Math.abs(paragraphBox!.x - headingBox!.x)).toBeLessThan(8);
	await expect(page.getByRole('navigation', { name: 'Indice del progetto' })).toContainText('Dalla specifica al problema');
});

test('project lead is integrated into the reading surface instead of a boxed callout', async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/progetti/pianificatore-percorsi-autostradali/');

	const lead = page.locator('.detail-grid > .prose > blockquote:first-child');
	await expect(lead).toBeVisible();
	const styles = await lead.evaluate((element) => {
		const computed = getComputedStyle(element);
		return { background: computed.backgroundColor, border: computed.borderLeftWidth };
	});
	expect(styles.background).toBe('rgba(0, 0, 0, 0)');
	expect(styles.border).toBe('0px');
});

test('project metadata does not overlap section headings in the shared left rail', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/progetti/pianificatore-percorsi-autostradali/');
	await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

	const metadata = page.locator('.detail-grid aside');
	const firstSectionHeading = page.locator('.detail-grid h2').first();
	await firstSectionHeading.evaluate((element) => {
		window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 32);
	});

	const metadataBox = await metadata.boundingBox();
	const headingBox = await firstSectionHeading.boundingBox();
	expect(metadataBox).not.toBeNull();
	expect(headingBox).not.toBeNull();

	const boxesOverlap =
		metadataBox!.x < headingBox!.x + headingBox!.width &&
		metadataBox!.x + metadataBox!.width > headingBox!.x &&
		metadataBox!.y < headingBox!.y + headingBox!.height &&
		metadataBox!.y + metadataBox!.height > headingBox!.y;
	expect(boxesOverlap).toBe(false);
});

test('project details expose a localized contact call to action', async ({ page }) => {
	await page.goto('/it/progetti/pianificatore-percorsi-autostradali/');
	await expect(page.getByRole('link', { name: 'Parliamone' })).toHaveAttribute(
		'href',
		'mailto:samuele.segrini@gmail.com',
	);

	await page.goto('/en/projects/highway-route-planner/');
	await expect(page.getByRole('link', { name: "Let's talk" })).toHaveAttribute(
		'href',
		'mailto:samuele.segrini@gmail.com',
	);
});

test('project archive offers only represented filters and works without hiding content by default', async ({
	page,
}) => {
	await page.goto('/it/progetti/');
	await expect(page.locator('[data-project-item]')).toHaveCount(6);
	await expect(page.getByRole('button', { name: 'App' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Pacchetti' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Open source' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Esperimenti' })).toBeVisible();
	await page.getByRole('button', { name: 'Esperimenti' }).click();
	await expect(page.locator('[data-project-item]:visible')).toHaveCount(2);
});

test('project filters stay three rem below the hero at every viewport size', async ({ page }) => {
	for (const viewport of [
		{ width: 1280, height: 800 },
		{ width: 390, height: 844 },
	]) {
		await page.setViewportSize(viewport);
		await page.goto('/it/progetti/');

		const topPadding = await page.locator('[data-project-archive]').evaluate(
			(element) => Number.parseFloat(getComputedStyle(element).paddingTop),
		);
		expect(topPadding).toBe(48);
	}
});

test('draft content is absent from public archives', async ({ page }) => {
	await page.goto('/en/writing/');
	await expect(page.getByText('Unpublished draft')).toHaveCount(0);
	await expect(page.locator('[data-post-item]')).toHaveCount(4);
});

test('long articles expose bilingual generated navigation', async ({ page }) => {
	for (const sample of [
		{ path: '/it/articoli/il-mio-primo-videogioco-era-un-sistema-distribuito/', label: "Indice dell'articolo", first: 'Il gioco che immaginavo', count: 8 },
		{ path: '/en/writing/my-first-video-game-was-a-distributed-system/', label: 'In this article', first: 'The game I imagined', count: 8 },
	]) {
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto(sample.path);
		const toc = page.getByRole('navigation', { name: sample.label });
		await expect(toc).toBeVisible();
		await expect(toc.getByRole('link')).toHaveCount(sample.count);
		const href = await toc.getByRole('link', { name: sample.first }).getAttribute('href');
		expect(href).toMatch(/^#[a-z0-9-]+$/);
		await expect(page.locator('h2' + href)).toHaveText(sample.first);
	}
});

test('article navigation follows the chapter currently being read', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/articoli/il-mio-primo-videogioco-era-un-sistema-distribuito/');

	const toc = page.getByRole('navigation', { name: "Indice dell'articolo" });
	const firstChapter = toc.getByRole('link', { name: 'Il gioco che immaginavo' });
	const secondChapter = toc.getByRole('link', { name: 'Prima dello schermo veniva il sistema' });

	await expect(firstChapter).toHaveAttribute('aria-current', 'location');
	await page.locator('#prima-dello-schermo-veniva-il-sistema').evaluate((heading) => {
		heading.scrollIntoView();
	});
	await expect(secondChapter).toHaveAttribute('aria-current', 'location');
	await expect(toc.locator('[aria-current="location"]')).toHaveCount(1);
});

test('project details lead with structured evidence and honest provenance', async ({ page }) => {
	await page.goto('/en/projects/spingo-sustainable-micromobility/');

	const details = page.getByRole('complementary', { name: 'Project details' });
	await expect(details.getByText('109', { exact: true })).toBeVisible();
	await expect(details.getByText('Prototype', { exact: true })).toBeVisible();
	await expect(details.getByText('Team work', { exact: true })).toBeVisible();
	await expect(details.getByRole('link', { name: /Team repository/ })).toContainText('github.com');
	await expect(details.getByRole('link', { name: /Team repository/ })).toContainText('Team repository');
});

test('archives use distinct writing and project discovery surfaces', async ({ page }) => {
	await page.goto('/en/writing/');
	await expect(page.locator('[data-writing-archive]')).toBeVisible();
	await expect(page.getByRole('link', { name: /RSS/ })).toHaveAttribute('href', '/en/rss.xml');
	await expect(page.locator('.writing-list > article').first()).toBeVisible();

	await page.goto('/en/projects/');
	const evidencedProject = page.locator('[data-project-item]').filter({ hasText: 'Priority Task Queue Manager' });
	await expect(evidencedProject.locator('.project-proof')).toBeVisible();
	await expect(evidencedProject.locator('.project-status')).toBeVisible();
});

test('detail pages emit large social images and writing advertises its feed', async ({ page }) => {
	await page.goto('/en/writing/rebuilding-galaxy-trucker-with-claude/');
	await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https?:\/\//);
	await expect(page.locator('link[type="application\/rss\+xml"]')).toHaveAttribute('href', /\/en\/rss\.xml$/);
});

test('substantial projects expose desktop navigation without duplicating it on mobile', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/en/projects/galaxy-trucker-java-project/');
	await expect(page.getByRole('navigation', { name: 'Project contents' })).toBeVisible();

	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page.getByRole('navigation', { name: 'Project contents' })).toBeHidden();
	await expect(page.getByRole('complementary', { name: 'Project details' })).toBeVisible();
});

test('project contents remain sticky while the article body continues', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/en/projects/galaxy-trucker-java-project/');

	const contents = page.getByRole('navigation', { name: 'Project contents' });
	await contents.scrollIntoViewIfNeeded();
	await page.evaluate(() => window.scrollBy(0, 400));

	const box = await contents.boundingBox();
	expect(box).not.toBeNull();
	expect(box!.y).toBeGreaterThanOrEqual(24);
	expect(box!.y).toBeLessThanOrEqual(40);
});

test('project contents highlight only the section currently being read', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/progetti/galaxy-trucker-progetto-java/');

	const contents = page.getByRole('navigation', { name: 'Indice del progetto' });
	for (const section of ['Il mio contributo', 'Perimetro completato, build archiviata']) {
		await page.getByRole('heading', { level: 2, name: section }).evaluate((heading) => {
			heading.scrollIntoView({ block: 'center' });
		});
		await expect(contents.locator('[aria-current="location"]')).toHaveCount(1);
		await expect(contents.getByRole('link', { name: section })).toHaveAttribute('aria-current', 'location');
	}
});

test('project contents bold only the current section', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/progetti/pianificatore-percorsi-autostradali/');

	const contents = page.getByRole('navigation', { name: 'Indice del progetto' });
	const current = contents.getByRole('link', { name: 'Dalla specifica al problema' });
	const inactive = contents.getByRole('link', { name: 'Modello dei dati' });

	await expect(current).toHaveAttribute('aria-current', 'location');
	const [currentWeight, inactiveWeight] = await Promise.all([
		current.evaluate((element) => Number.parseInt(getComputedStyle(element).fontWeight, 10)),
		inactive.evaluate((element) => Number.parseInt(getComputedStyle(element).fontWeight, 10)),
	]);
	expect(currentWeight).toBeGreaterThanOrEqual(600);
	expect(inactiveWeight).toBeLessThanOrEqual(500);
});

test('Galaxy articles use claim-specific evidence visuals', async ({ page }) => {
	await page.goto('/en/writing/my-first-video-game-was-a-distributed-system/');
	await expect(page.locator('.multiplayer-system-flow')).toBeVisible();
	await expect(page.locator('.authority-boundary')).toContainText('Authoritative server');

	await page.goto('/en/writing/rebuilding-galaxy-trucker-with-claude/');
	const comparison = page.getByRole('region', { name: 'AI reconstruction evidence comparison' });
	await expect(comparison).toBeVisible();
	await expect(comparison.getByRole('table')).toBeVisible();
});

test('article and project details use a quieter reading scale', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });

	for (const sample of [
		{
			path: '/it/articoli/il-mio-primo-videogioco-era-un-sistema-distribuito/',
			title: '.article-hero h1',
			prose: '.article-prose',
		},
		{
			path: '/it/progetti/galaxy-trucker-progetto-java/',
			title: '.detail-title h1',
			prose: '.detail-grid > .prose',
		},
	]) {
		await page.goto(sample.path);
		const sizes = await page.locator(sample.title + ', ' + sample.prose).evaluateAll(
			(elements) => elements.map((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
		);
		expect(sizes[0]).toBeLessThanOrEqual(100);
		expect(sizes[1]).toBeLessThanOrEqual(21);
	}
});

test('article and project narrative copy share the same typeface', async ({ page }) => {
	await page.goto('/it/articoli/il-mio-primo-videogioco-era-un-sistema-distribuito/');
	const articleTypeface = await page.locator('.article-prose > p').first().evaluate(
		(element) => getComputedStyle(element).fontFamily,
	);

	await page.goto('/it/progetti/spingo-micromobilita-sostenibile/');
	const projectTypeface = await page.locator('.detail-grid > .prose > blockquote:first-child p').first().evaluate(
		(element) => getComputedStyle(element).fontFamily,
	);

	expect(projectTypeface).toBe(articleTypeface);
});

test('article navigation yields the full width to prose on mobile', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/it/articoli/il-mio-primo-videogioco-era-un-sistema-distribuito/');
	await expect(page.getByRole('navigation', { name: "Indice dell'articolo" })).toBeHidden();
	expect((await page.locator('.article-prose').boundingBox())!.width).toBeLessThanOrEqual(342);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('article navigation collapses before its tracks overflow', async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 844 });
	await page.goto('/it/articoli/il-mio-primo-videogioco-era-un-sistema-distribuito/');
	await expect(page.getByRole('navigation', { name: "Indice dell'articolo" })).toBeHidden();
	expect((await page.locator('.article-prose').boundingBox())!.width).toBe(752);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1024);
});

test('the first-game article explains authoritative multiplayer as four steps', async ({ page }) => {
	for (const sample of [
		{ path: '/it/articoli/il-mio-primo-videogioco-era-un-sistema-distribuito/', caption: 'Come un’azione diventa stato condiviso' },
		{ path: '/en/writing/my-first-video-game-was-a-distributed-system/', caption: 'How one action becomes shared state' },
	]) {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(sample.path);
		const figure = page.locator('.multiplayer-sequence');
		await expect(figure.locator('ol > li')).toHaveCount(4);
		await expect(figure.locator('figcaption')).toContainText(sample.caption);
		expect((await figure.boundingBox())!.width).toBeLessThanOrEqual(342);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
	}
});
