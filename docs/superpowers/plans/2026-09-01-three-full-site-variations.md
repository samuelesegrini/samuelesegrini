# Three Full-Site Portfolio Variations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three isolated four-page portfolio mini-sites—Signal System, Editorial Monograph, and Living Atlas—under `/lab/sites/` using the same verified portfolio content.

**Architecture:** A typed lab-content adapter selects the English EasyManager, Galaxy Trucker, SpinGO, and first-game article records from the existing Astro content collection. A shared lab layout owns no-index metadata, neutral comparison controls, and route navigation; each variation owns four page components and one namespaced stylesheet so its hierarchy and visual system remain independent.

**Tech Stack:** Astro 7.2.7, TypeScript 6, Astro content collections and MDX rendering, CSS, Vitest 4.1, Playwright 1.62, Axe.

**Spec:** `docs/superpowers/specs/2026-09-01-three-full-site-variations-design.md`

## Approved Study Lineage

| Full-site variation | Hero | Project cards/index | Article | Project detail |
| --- | --- | --- | --- | --- |
| Signal System | H1/H5 | C1/C2 | A3/A4 with dark surfaces limited to evidence and transitions | D1 |
| Editorial Monograph | H2 | C1/C2 | A1/A5 | D4 |
| Living Atlas | H5/H1 | C5/C2 | A4/A1/A3 with a light reading body | D2/D4 |

## Global Constraints

- All prototype routes remain under `/lab/`, use `noindex, nofollow`, and stay outside the sitemap.
- Preserve every production route, component, stylesheet, and content document.
- Use the same English content in all three variations: EasyManager, Galaxy Trucker, SpinGO, and “My first video game was a distributed system.”
- Do not invent metrics, lifecycle states, or evidence claims for visual convenience.
- Long-form prose remains primarily light; dark surfaces are limited to openings, media chapters, evidence sections, and transitions.
- Support 320 px minimum width, test at 390 px and 1280 px, and prevent document-level horizontal scrolling.
- Normal and large text must meet WCAG AA; focus remains visible; reduced-motion preferences are respected.
- Add no runtime dependencies.
- Stage and commit only files named by the active task; preserve the user’s unrelated untracked research and `graphify-out/` files.

---

## File Map

### Shared content and layout

- `src/lib/lab-sites.ts` — theme/page types, route helpers, verified content selection, and build-time missing-record errors.
- `src/lib/lab-sites.test.ts` — route and content-selection unit contracts.
- `src/layouts/LabSiteLayout.astro` — standalone HTML shell, no-index metadata, neutral switcher, and theme root.
- `src/components/style-lab/sites/LabSwitcher.astro` — links among the three mini-sites and the twenty-study gallery.
- `src/components/style-lab/sites/LabSiteNav.astro` — four-page navigation scoped by theme and current page.
- `src/styles/lab-sites/base.css` — reset, neutral switcher, focus, reduced motion, and cross-theme responsive foundations.

### Signal System

- `src/components/style-lab/sites/signal/Home.astro`
- `src/components/style-lab/sites/signal/Projects.astro`
- `src/components/style-lab/sites/signal/Article.astro`
- `src/components/style-lab/sites/signal/Project.astro`
- `src/styles/lab-sites/signal.css`
- `src/pages/lab/sites/signal/index.astro`
- `src/pages/lab/sites/signal/projects/index.astro`
- `src/pages/lab/sites/signal/article/index.astro`
- `src/pages/lab/sites/signal/project/index.astro`

### Editorial Monograph

- `src/components/style-lab/sites/monograph/Home.astro`
- `src/components/style-lab/sites/monograph/Projects.astro`
- `src/components/style-lab/sites/monograph/Article.astro`
- `src/components/style-lab/sites/monograph/Project.astro`
- `src/styles/lab-sites/monograph.css`
- `src/pages/lab/sites/monograph/index.astro`
- `src/pages/lab/sites/monograph/projects/index.astro`
- `src/pages/lab/sites/monograph/article/index.astro`
- `src/pages/lab/sites/monograph/project/index.astro`

### Living Atlas

- `src/components/style-lab/sites/atlas/Home.astro`
- `src/components/style-lab/sites/atlas/Projects.astro`
- `src/components/style-lab/sites/atlas/Article.astro`
- `src/components/style-lab/sites/atlas/Project.astro`
- `src/styles/lab-sites/atlas.css`
- `src/pages/lab/sites/atlas/index.astro`
- `src/pages/lab/sites/atlas/projects/index.astro`
- `src/pages/lab/sites/atlas/article/index.astro`
- `src/pages/lab/sites/atlas/project/index.astro`

### Comparison and verification

- `src/pages/lab/styles.astro` — add the three complete-site entry points.
- `src/style-lab-contract.test.ts` — extend the no-index/sitemap route contract.
- `tests/e2e/lab-sites.spec.ts` — route inventory, navigation, content parity, responsive, accessibility, and theme signatures.

---

### Task 1: Typed Lab Content and Route Contract

**Files:**
- Create: `src/lib/lab-sites.ts`
- Create: `src/lib/lab-sites.test.ts`

**Interfaces:**
- Consumes: `getPortfolioContent(): Promise<PortfolioContent>` from `src/lib/portfolio.ts`.
- Produces: `labSiteThemes`, `labSitePages`, `LabSiteTheme`, `LabSitePage`, `LabSiteContent`, `labSitePath(theme, page)`, `selectLabSiteContent(projectDocuments, postDocuments)`, and `getLabSiteContent()`.

- [ ] **Step 1: Write failing tests for theme routes and selected content**

```ts
import { describe, expect, it } from 'vitest';
import type { PostDocument, ProjectDocument } from './portfolio';
import {
	labSitePages,
	labSitePath,
	labSiteThemes,
	selectLabSiteContent,
} from './lab-sites';

const projectDocument = (translationKey: string, featuredRank?: 1 | 2 | 3) => ({
	id: `${translationKey}.mdx`,
	collection: 'projects',
	data: {
		translationKey,
		locale: 'en',
		slug: translationKey,
		title: translationKey === 'easymanager' ? 'EasyManager' : translationKey === 'galaxy-trucker' ? 'Galaxy Trucker' : 'SpinGO',
		excerpt: `${translationKey} verified result.`,
		draft: false,
		coverImage: `/${translationKey}.svg`,
		coverAlt: `${translationKey} artwork`,
		kind: 'package',
		lifecycle: 'verified',
		authorship: 'individual',
		year: 2026,
		role: 'Engineer',
		technologies: ['Swift'],
		featuredRank,
		outcomes: [],
		links: [],
		relatedPosts: [],
	},
}) as ProjectDocument;

const articleDocument = {
	id: 'my-first-video-game.mdx',
	collection: 'posts',
	data: {
		translationKey: 'my-first-video-game',
		locale: 'en',
		slug: 'my-first-video-game-was-a-distributed-system',
		title: 'My first video game was a distributed system',
		excerpt: 'Several players need one shared world.',
		draft: false,
		coverImage: '/galaxy.svg',
		coverAlt: 'Shared multiplayer state',
		publishedAt: new Date('2026-08-27'),
		tags: ['Distributed systems'],
	},
} as PostDocument;

describe('lab site contract', () => {
	it('publishes three themes with four routes each', () => {
		expect(labSiteThemes).toEqual(['signal', 'monograph', 'atlas']);
		expect(labSitePages).toEqual(['home', 'projects', 'article', 'project']);
		expect(labSiteThemes.flatMap((theme) => labSitePages.map((page) => labSitePath(theme, page)))).toHaveLength(12);
		expect(labSitePath('signal', 'home')).toBe('/lab/sites/signal/');
		expect(labSitePath('atlas', 'project')).toBe('/lab/sites/atlas/project/');
	});

	it('selects the same ranked work and detail records for every theme', () => {
		const selected = selectLabSiteContent([
			projectDocument('spingo-sustainable-micromobility', 3),
			projectDocument('easymanager', 1),
			projectDocument('galaxy-trucker', 2),
		], [articleDocument]);
		expect(selected.featuredProjects.map(({ data }) => data.title)).toEqual(['EasyManager', 'Galaxy Trucker', 'SpinGO']);
		expect(selected.projectDocument.data.translationKey).toBe('easymanager');
		expect(selected.articleDocument.data.translationKey).toBe('my-first-video-game');
	});

	it('fails instead of substituting missing portfolio evidence', () => {
		expect(() => selectLabSiteContent([projectDocument('easymanager', 1)], [articleDocument])).toThrow('Lab sites require exactly three ranked English projects.');
	});
});
```

- [ ] **Step 2: Run the focused unit test and verify the missing-module failure**

Run: `npm test -- --run src/lib/lab-sites.test.ts`

Expected: FAIL because `./lab-sites` does not exist.

- [ ] **Step 3: Implement the typed adapter and explicit missing-record errors**

```ts
import { getPortfolioContent, type PostDocument, type ProjectDocument } from './portfolio';

export const labSiteThemes = ['signal', 'monograph', 'atlas'] as const;
export const labSitePages = ['home', 'projects', 'article', 'project'] as const;
export type LabSiteTheme = (typeof labSiteThemes)[number];
export type LabSitePage = (typeof labSitePages)[number];

export interface LabSiteContent {
	allProjects: readonly ProjectDocument[];
	featuredProjects: readonly ProjectDocument[];
	projectDocument: ProjectDocument;
	articleDocument: PostDocument;
}

export function labSitePath(theme: LabSiteTheme, page: LabSitePage): string {
	return page === 'home' ? `/lab/sites/${theme}/` : `/lab/sites/${theme}/${page}/`;
}

export function selectLabSiteContent(
	projectDocuments: readonly ProjectDocument[],
	postDocuments: readonly PostDocument[],
): LabSiteContent {
	const allProjects = projectDocuments.filter(({ data }) => !data.draft && data.locale === 'en');
	const featuredProjects = allProjects
		.filter(({ data }) => data.featuredRank !== undefined)
		.toSorted((left, right) => left.data.featuredRank! - right.data.featuredRank!);
	if (featuredProjects.length !== 3) throw new Error('Lab sites require exactly three ranked English projects.');
	const projectDocument = allProjects.find(({ data }) => data.translationKey === 'easymanager');
	if (!projectDocument) throw new Error('Lab sites require the English EasyManager project.');
	const articleDocument = postDocuments.find(({ data }) => !data.draft && data.locale === 'en' && data.translationKey === 'my-first-video-game');
	if (!articleDocument) throw new Error('Lab sites require the English first-game article.');
	return { allProjects, featuredProjects, projectDocument, articleDocument };
}

export async function getLabSiteContent(): Promise<LabSiteContent> {
	const { projectDocuments, postDocuments } = await getPortfolioContent();
	return selectLabSiteContent(projectDocuments, postDocuments);
}
```

- [ ] **Step 4: Run unit tests and Astro diagnostics**

Run: `npm test -- --run src/lib/lab-sites.test.ts`

Expected: 3 tests PASS.

Run: `npm run check`

Expected: 0 errors, 0 warnings, 0 hints.

- [ ] **Step 5: Commit only the adapter and its tests**

```bash
git add src/lib/lab-sites.ts src/lib/lab-sites.test.ts
git commit -m "feat: add verified lab site content adapter"
```

---

### Task 2: Shared Lab Shell and Signal System Mini-Site

**Files:**
- Create: `src/layouts/LabSiteLayout.astro`
- Create: `src/components/style-lab/sites/LabSwitcher.astro`
- Create: `src/components/style-lab/sites/LabSiteNav.astro`
- Create: `src/styles/lab-sites/base.css`
- Create: `src/components/style-lab/sites/signal/Home.astro`
- Create: `src/components/style-lab/sites/signal/Projects.astro`
- Create: `src/components/style-lab/sites/signal/Article.astro`
- Create: `src/components/style-lab/sites/signal/Project.astro`
- Create: `src/styles/lab-sites/signal.css`
- Create: `src/pages/lab/sites/signal/index.astro`
- Create: `src/pages/lab/sites/signal/projects/index.astro`
- Create: `src/pages/lab/sites/signal/article/index.astro`
- Create: `src/pages/lab/sites/signal/project/index.astro`
- Create: `tests/e2e/lab-sites.spec.ts`

**Interfaces:**
- Consumes: `LabSiteContent`, `LabSitePage`, `LabSiteTheme`, `getLabSiteContent()`, and `labSitePath()` from Task 1.
- Produces: the reusable `LabSiteLayout`, `LabSwitcher`, `LabSiteNav`, and four working Signal System routes.

- [ ] **Step 1: Write failing browser contracts for the four Signal routes**

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const signalRoutes = [
	'/lab/sites/signal/',
	'/lab/sites/signal/projects/',
	'/lab/sites/signal/article/',
	'/lab/sites/signal/project/',
];

for (const path of signalRoutes) {
	test(`Signal route ${path} is private and navigable`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response?.ok()).toBe(true);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
		await expect(page.locator('body')).toHaveClass(/lab-site--signal/);
		await expect(page.locator('[data-lab-site-nav] a')).toHaveCount(4);
		await expect(page.locator('[data-lab-switcher]')).toBeVisible();
	});
}

test('Signal uses the approved content and structural signatures', async ({ page }) => {
	await page.goto('/lab/sites/signal/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('SYSTEMS');
	await expect(page.locator('[data-featured-project]')).toHaveCount(3);
	await page.goto('/lab/sites/signal/article/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('My first video game was a distributed system');
	await expect(page.locator('[data-signal-evidence]')).toBeVisible();
	await page.goto('/lab/sites/signal/project/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('EasyManager');
	await expect(page.locator('[data-project-outcome]')).toHaveCount(3);
});
```

- [ ] **Step 2: Run the Signal tests and verify route-not-found failures**

Run: `npm run test:e2e -- tests/e2e/lab-sites.spec.ts -g 'Signal'`

Expected: FAIL because all four Signal routes return 404.

- [ ] **Step 3: Implement the standalone layout, comparison switcher, and route navigation**

`LabSiteLayout.astro` must use this interface and document structure:

```astro
---
import LabSwitcher from '../components/style-lab/sites/LabSwitcher.astro';
import LabSiteNav from '../components/style-lab/sites/LabSiteNav.astro';
import type { LabSitePage, LabSiteTheme } from '../lib/lab-sites';
import '../styles/lab-sites/base.css';

interface Props {
	theme: LabSiteTheme;
	page: LabSitePage;
	title: string;
	description: string;
}
const { theme, page, title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<meta name="robots" content="noindex, nofollow" />
		<meta name="description" content={description} />
		<title>{title}</title>
	</head>
	<body class:list={['lab-site', `lab-site--${theme}`]}>
		<a class="lab-site-skip" href="#content">Skip to content</a>
		<LabSwitcher currentTheme={theme} />
		<LabSiteNav theme={theme} currentPage={page} />
		<main id="content"><slot /></main>
	</body>
</html>
```

`LabSwitcher.astro` links to `/lab/styles/` and the three theme home paths. `LabSiteNav.astro` links to the four paths returned by `labSitePath(theme, page)` and marks the current route with `aria-current="page"`.

- [ ] **Step 4: Implement the shared base stylesheet**

Start `base.css` with these non-theme rules, then add the mobile switcher layout and the reduced-motion override:

```css
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; }
img { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
a:focus-visible, button:focus-visible { outline: 3px solid #6f7cff; outline-offset: 4px; }
.lab-site-skip { position: fixed; z-index: 100; transform: translateY(-150%); }
.lab-site-skip:focus { transform: translateY(0); }
.lab-switcher { position: fixed; right: 1rem; bottom: 1rem; z-index: 80; display: flex; gap: .35rem; padding: .4rem; border: 1px solid #555; border-radius: 999px; background: rgba(17,17,17,.94); color: white; font: 700 11px/1.2 'Space Mono', monospace; }
.lab-switcher a { display: grid; min-height: 44px; place-items: center; padding: .6rem .8rem; border-radius: 999px; }
.lab-switcher a[aria-current='true'] { background: white; color: black; }
@media (prefers-reduced-motion: reduce) {
	html { scroll-behavior: auto; }
	*, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
```

- [ ] **Step 5: Implement the four Signal page components**

Use `interface Props { content: LabSiteContent }` for Home, Projects, and Project. Use `interface Props { content: LabSiteContent; headings: readonly MarkdownHeading[] }` plus `<slot name="body" />` for Article.

Required semantic structures:

```astro
<!-- signal/Home.astro -->
<section class="signal-hero">
	<div class="signal-status">Italy / CET · Software engineering · Available 2026</div>
	<h1>SYSTEMS YOU<br />CAN <em>TRUST.</em></h1>
	<p>Interfaces, infrastructure, and the difficult space between them.</p>
</section>
<section class="signal-featured" aria-labelledby="signal-work">
	<h2 id="signal-work">Selected systems</h2>
	{content.featuredProjects.map((document) => (
		<article data-featured-project>
			<img src={document.data.coverImage} alt={document.data.coverAlt} width="1200" height="800" />
			<p>{document.data.kind} · {document.data.year}</p>
			<h3>{document.data.title}</h3>
			<p>{document.data.excerpt}</p>
			<strong>{document.data.role}</strong>
		</article>
	))}
</section>

<!-- signal/Projects.astro -->
<header class="signal-page-title"><p>[ 2023—2026 ]</p><h1>SELECTED SYSTEMS</h1></header>
<div class="signal-project-index">
	{content.allProjects.map((document, index) => (
		<article data-project-row>
			<span>{String(index + 1).padStart(2, '0')}</span>
			<div>
				<h2>{document.data.title}</h2>
				<p>{document.data.excerpt}</p>
			</div>
			<span>{document.data.kind}</span>
			<span>{document.data.year}</span>
			<strong>{document.data.outcomes[0]?.value ?? document.data.role}</strong>
		</article>
	))}
</div>

<!-- signal/Article.astro -->
<header class="signal-article-hero"><p>FIELD NOTE / DISTRIBUTED SYSTEMS</p><h1>{content.articleDocument.data.title}</h1></header>
<div class="signal-article-layout">
	<aside aria-label="Article contents">{headings.filter(({ depth }) => depth === 2).map((heading) => <a href={`#${heading.slug}`}>{heading.text}</a>)}</aside>
	<article class="signal-prose"><slot name="body" /></article>
	<aside data-signal-evidence><span>INVARIANT</span><strong>Shared state needs one authority.</strong></aside>
</div>

<!-- signal/Project.astro -->
<header class="signal-casefile"><p>CASE FILE / {content.projectDocument.data.year}</p><h1>{content.projectDocument.data.title}</h1><p>{content.projectDocument.data.excerpt}</p></header>
<section class="signal-outcomes">{content.projectDocument.data.outcomes.map((outcome) => <div data-project-outcome><strong>{outcome.value}</strong><span>{outcome.label}</span></div>)}</section>
<div class="signal-project-body">
	<aside aria-label="Project details">
		<span>{content.projectDocument.data.lifecycle}</span>
		<strong>{content.projectDocument.data.role}</strong>
		<p>{content.projectDocument.data.technologies.join(' · ')}</p>
	</aside>
	<article class="signal-prose"><slot name="body" /></article>
</div>
```

This markup uses only the named existing fields: title, excerpt, cover image and alt text, role, year, technologies, lifecycle, and outcomes. Do not add invented copy or metrics.

- [ ] **Step 6: Implement Signal tokens and page layouts**

Use the approved token block and namespace every selector under `.lab-site--signal`:

```css
.lab-site--signal {
	--signal-paper: #f2f2ef;
	--signal-ink: #151515;
	--signal-blue: #c8d8ff;
	--signal-red: #9f2f28;
	background: var(--signal-paper);
	color: var(--signal-ink);
	font-family: 'Archivo', system-ui, sans-serif;
}
.lab-site--signal .signal-hero h1,
.lab-site--signal .signal-page-title h1 { font-family: 'Archivo', sans-serif; font-weight: 750; letter-spacing: -.075em; line-height: .8; }
.lab-site--signal em { color: var(--signal-red); font-family: 'Instrument Serif', serif; font-weight: 400; }
.lab-site--signal .signal-status,
.lab-site--signal [data-project-row] { font-family: 'Space Mono', monospace; }
```

Implement the hero/status rail, wide first project, indexed archive rows, light article reading column, one dark evidence panel, dark case-file opening, and light project narrative. Add 900 px and 640 px breakpoints that collapse rails into the document flow and keep unbroken titles inside their containers.

- [ ] **Step 7: Create the four Signal route files and render real MDX**

The home route uses this exact loading pattern:

```astro
---
import Home from '../../../../components/style-lab/sites/signal/Home.astro';
import { getLabSiteContent } from '../../../../lib/lab-sites';
import LabSiteLayout from '../../../../layouts/LabSiteLayout.astro';
const content = await getLabSiteContent();
---
<LabSiteLayout theme="signal" page="home" title="Signal System — Style Lab" description="Signal System portfolio prototype.">
	<Home content={content} />
</LabSiteLayout>
```

The article and project routes import `render` from `astro:content`, render `content.articleDocument` or `content.projectDocument`, and place `<Content slot="body" />` inside the corresponding Signal component. Projects loads the same content adapter and renders `<Projects content={content} />`.

- [ ] **Step 8: Run focused tests, Astro diagnostics, and commit**

Run: `npm run test:e2e -- tests/e2e/lab-sites.spec.ts -g 'Signal'`

Expected: all Signal tests PASS.

Run: `npm run check`

Expected: 0 diagnostics.

```bash
git add src/layouts/LabSiteLayout.astro src/components/style-lab/sites/LabSwitcher.astro src/components/style-lab/sites/LabSiteNav.astro src/components/style-lab/sites/signal src/styles/lab-sites/base.css src/styles/lab-sites/signal.css src/pages/lab/sites/signal tests/e2e/lab-sites.spec.ts
git commit -m "feat: add Signal System lab mini-site"
```

---

### Task 3: Editorial Monograph Mini-Site

**Files:**
- Create: `src/components/style-lab/sites/monograph/Home.astro`
- Create: `src/components/style-lab/sites/monograph/Projects.astro`
- Create: `src/components/style-lab/sites/monograph/Article.astro`
- Create: `src/components/style-lab/sites/monograph/Project.astro`
- Create: `src/styles/lab-sites/monograph.css`
- Create: `src/pages/lab/sites/monograph/index.astro`
- Create: `src/pages/lab/sites/monograph/projects/index.astro`
- Create: `src/pages/lab/sites/monograph/article/index.astro`
- Create: `src/pages/lab/sites/monograph/project/index.astro`
- Modify: `tests/e2e/lab-sites.spec.ts`

**Interfaces:**
- Consumes: shared layout/navigation and `LabSiteContent` from Tasks 1–2.
- Produces: four working Editorial Monograph routes.

- [ ] **Step 1: Add failing route and design-signature tests**

```ts
const monographRoutes = [
	'/lab/sites/monograph/',
	'/lab/sites/monograph/projects/',
	'/lab/sites/monograph/article/',
	'/lab/sites/monograph/project/',
];

for (const path of monographRoutes) {
	test(`Monograph route ${path} is private and navigable`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response?.ok()).toBe(true);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
		await expect(page.locator('body')).toHaveClass(/lab-site--monograph/);
		await expect(page.locator('[data-lab-site-nav] a')).toHaveCount(4);
	});
}

test('Monograph keeps reading light and publication-led', async ({ page }) => {
	await page.goto('/lab/sites/monograph/article/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('My first video game was a distributed system');
	await expect(page.locator('[data-monograph-marginalia]')).toBeVisible();
	expect(await page.locator('.monograph-reading').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(246, 241, 231)');
	await page.goto('/lab/sites/monograph/project/');
	await expect(page.locator('[data-project-outcome]')).toHaveCount(3);
});
```

- [ ] **Step 2: Run Monograph tests and verify 404 failures**

Run: `npm run test:e2e -- tests/e2e/lab-sites.spec.ts -g 'Monograph'`

Expected: FAIL because the four routes do not exist.

- [ ] **Step 3: Implement four Monograph components with real content**

Use the same prop interfaces as Signal but distinct markup:

- Home: issue line, serif H1, introduction, one large featured figure, and two restrained project entries.
- Projects: publication index with title, role, year, excerpt, and a supporting image for each record.
- Article: serif title, deck, byline, desktop contents/marginalia, narrow `.monograph-reading` body slot, and no full-page dark background.
- Project: monograph number, centered EasyManager title, full-width primary figure, metadata rail, three outcomes, and body slot.

The article and project components expose `<slot name="body" />`; every image uses `coverImage` and `coverAlt` from the selected document.

- [ ] **Step 4: Implement Monograph tokens and responsive rules**

```css
.lab-site--monograph {
	--mono-paper: #f6f1e7;
	--mono-ink: #28231f;
	--mono-blue: #dce8f7;
	--mono-oxblood: #7f2f2a;
	background: var(--mono-paper);
	color: var(--mono-ink);
	font-family: 'DM Sans', system-ui, sans-serif;
}
.lab-site--monograph h1,
.lab-site--monograph .monograph-lead { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; }
.lab-site--monograph .monograph-label { font-family: 'Archivo', sans-serif; letter-spacing: .08em; text-transform: uppercase; }
.lab-site--monograph .monograph-reading { background: var(--mono-paper); color: var(--mono-ink); font-family: 'Instrument Serif', Georgia, serif; }
```

Use thin rules, minimal radius, no card shadows, and oxblood only for current navigation, drop caps, figure references, and links. At 900 px move marginalia below the relevant prose; at 640 px use a single reading column and preserve at least 1rem side padding.

- [ ] **Step 5: Create four Monograph route files**

Each route uses `LabSiteLayout theme="monograph"` and the page enum matching its path. Article and project render the selected MDX document and pass its body through the named slot. Metadata descriptions come from the selected record’s excerpt, not new marketing copy.

- [ ] **Step 6: Run focused tests, diagnostics, and commit**

Run: `npm run test:e2e -- tests/e2e/lab-sites.spec.ts -g 'Monograph'`

Expected: all Monograph tests PASS.

Run: `npm run check`

Expected: 0 diagnostics.

```bash
git add src/components/style-lab/sites/monograph src/styles/lab-sites/monograph.css src/pages/lab/sites/monograph tests/e2e/lab-sites.spec.ts
git commit -m "feat: add Editorial Monograph lab mini-site"
```

---

### Task 4: Living Atlas Mini-Site

**Files:**
- Create: `src/components/style-lab/sites/atlas/Home.astro`
- Create: `src/components/style-lab/sites/atlas/Projects.astro`
- Create: `src/components/style-lab/sites/atlas/Article.astro`
- Create: `src/components/style-lab/sites/atlas/Project.astro`
- Create: `src/styles/lab-sites/atlas.css`
- Create: `src/pages/lab/sites/atlas/index.astro`
- Create: `src/pages/lab/sites/atlas/projects/index.astro`
- Create: `src/pages/lab/sites/atlas/article/index.astro`
- Create: `src/pages/lab/sites/atlas/project/index.astro`
- Modify: `tests/e2e/lab-sites.spec.ts`

**Interfaces:**
- Consumes: shared layout/navigation and `LabSiteContent` from Tasks 1–2.
- Produces: four working Living Atlas routes.

- [ ] **Step 1: Add failing route and design-signature tests**

```ts
const atlasRoutes = [
	'/lab/sites/atlas/',
	'/lab/sites/atlas/projects/',
	'/lab/sites/atlas/article/',
	'/lab/sites/atlas/project/',
];

for (const path of atlasRoutes) {
	test(`Atlas route ${path} is private and navigable`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response?.ok()).toBe(true);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
		await expect(page.locator('body')).toHaveClass(/lab-site--atlas/);
		await expect(page.locator('[data-lab-site-nav] a')).toHaveCount(4);
	});
}

test('Atlas uses editions and numbered chapters without a permanently dark reader', async ({ page }) => {
	await page.goto('/lab/sites/atlas/');
	await expect(page.locator('[data-atlas-edition]')).toHaveCount(3);
	await page.goto('/lab/sites/atlas/article/');
	await expect(page.locator('[data-atlas-aperture]')).toBeVisible();
	await expect(page.locator('[data-atlas-reading]')).toBeVisible();
	await page.goto('/lab/sites/atlas/project/');
	await expect(page.locator('[data-atlas-chapter]')).toHaveCount(4);
});
```

- [ ] **Step 2: Run Atlas tests and verify 404 failures**

Run: `npm run test:e2e -- tests/e2e/lab-sites.spec.ts -g 'Atlas'`

Expected: FAIL because the four routes do not exist.

- [ ] **Step 3: Implement four Atlas components with real content**

Required structures:

- Home: working-index hero, three vertical `[data-atlas-edition]` project editions, and a compact project index.
- Projects: numbered atlas rows with title, type, year, outcome proof, and poster-like image windows.
- Article: deep-navy `[data-atlas-aperture]` opening, then light `[data-atlas-reading]` body with contents and one evidence module.
- Project: numbered narrative containing four `[data-atlas-chapter]` sections—origin, pressure, boundary, outcome—followed by the rendered project body.

Use the real EasyManager outcomes and derive each project card’s proof from the first available outcome; when a project has no outcomes, show its existing `role`, not a fabricated number.

- [ ] **Step 4: Implement Atlas tokens and responsive rules**

```css
.lab-site--atlas {
	--atlas-paper: #f0eee7;
	--atlas-navy: #1f2946;
	--atlas-lavender: #d9d1ff;
	--atlas-coral: #a93b30;
	background: var(--atlas-paper);
	color: var(--atlas-navy);
	font-family: 'Archivo', system-ui, sans-serif;
}
.lab-site--atlas .atlas-poster-label { font-family: 'Unbounded', sans-serif; }
.lab-site--atlas .atlas-narrative { font-family: 'Instrument Serif', Georgia, serif; }
.lab-site--atlas .atlas-meta { font-family: 'Space Mono', monospace; }
.lab-site--atlas [data-atlas-aperture] { background: var(--atlas-navy); color: #f7f5ef; }
.lab-site--atlas [data-atlas-reading] { background: var(--atlas-paper); color: var(--atlas-navy); }
```

Restrict coral to current states, route markers, and chapter numbers. At 900 px reduce the edition grid to a horizontally scrollable snap row only if the row itself—not the document—owns overflow. At 640 px stack atlas chapters and ensure poster titles wrap or scale inside their containers.

- [ ] **Step 5: Create four Atlas route files**

Each route uses `LabSiteLayout theme="atlas"` with the matching page value. Article and project routes render the real MDX documents. Home and projects receive the same `LabSiteContent` selected by Task 1.

- [ ] **Step 6: Run focused tests, diagnostics, and commit**

Run: `npm run test:e2e -- tests/e2e/lab-sites.spec.ts -g 'Atlas'`

Expected: all Atlas tests PASS.

Run: `npm run check`

Expected: 0 diagnostics.

```bash
git add src/components/style-lab/sites/atlas src/styles/lab-sites/atlas.css src/pages/lab/sites/atlas tests/e2e/lab-sites.spec.ts
git commit -m "feat: add Living Atlas lab mini-site"
```

---

### Task 5: Gallery Entry Points, Content Parity, Accessibility, and Responsive Hardening

**Files:**
- Modify: `src/pages/lab/styles.astro`
- Modify: `src/style-lab-contract.test.ts`
- Modify: `tests/e2e/lab-sites.spec.ts`
- Modify as failures require: `src/styles/lab-sites/base.css`
- Modify as failures require: `src/styles/lab-sites/signal.css`
- Modify as failures require: `src/styles/lab-sites/monograph.css`
- Modify as failures require: `src/styles/lab-sites/atlas.css`

**Interfaces:**
- Consumes: all twelve routes and shared navigation.
- Produces: one comparison entry point and enforced cross-theme quality gates.

- [ ] **Step 1: Extend the unit contract before adding gallery links**

Add source-level assertions that `/lab/styles/` names and links all three systems and that `astro.config.mjs` continues to exclude every `/lab/` URL:

```ts
const source = readFileSync(labPagePath, 'utf8');
for (const [name, path] of [
	['Signal System', '/lab/sites/signal/'],
	['Editorial Monograph', '/lab/sites/monograph/'],
	['Living Atlas', '/lab/sites/atlas/'],
] as const) {
	expect(source).toContain(name);
	expect(source).toContain(path);
}
const astroConfig = readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf8');
expect(astroConfig).toContain("!page.includes('/lab/')");
```

- [ ] **Step 2: Run the unit contract and verify missing-link failures**

Run: `npm test -- --run src/style-lab-contract.test.ts`

Expected: FAIL because the gallery does not yet link the three complete systems.

- [ ] **Step 3: Add a complete-site section to the gallery**

Add a section before the original component studies with one link card per system. Each card includes its approved name, one-sentence character, four-page count, font stack, and direct home URL. Use existing lab-gallery typography; do not make the neutral entry cards imitate any of the three candidates.

- [ ] **Step 4: Add content-parity and navigation tests for all twelve routes**

```ts
const themes = ['signal', 'monograph', 'atlas'] as const;
const pages = ['/', '/projects/', '/article/', '/project/'] as const;

test('all themes expose the same selected portfolio records', async ({ page }) => {
	for (const theme of themes) {
		await page.goto(`/lab/sites/${theme}/`);
		for (const title of ['EasyManager', 'Galaxy Trucker', 'SpinGO']) await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
		await page.goto(`/lab/sites/${theme}/article/`);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('My first video game was a distributed system');
		await page.goto(`/lab/sites/${theme}/project/`);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('EasyManager');
	}
});

test('theme navigation reaches every page without leaving the selected system', async ({ page }) => {
	for (const theme of themes) {
		await page.goto(`/lab/sites/${theme}/`);
		for (const suffix of pages.slice(1)) {
			await page.locator(`[data-lab-site-nav] a[href="/lab/sites/${theme}${suffix}"]`).click();
			await expect(page).toHaveURL(new RegExp(`/lab/sites/${theme}${suffix.replaceAll('/', '\\/')}$`));
		}
	}
});
```

- [ ] **Step 5: Add responsive overflow and accessibility tests**

```ts
for (const width of [390, 1280]) {
	test(`lab mini-sites remain accessible and overflow-free at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
		for (const theme of themes) {
			for (const suffix of pages) {
				const path = `/lab/sites/${theme}${suffix}`;
				await page.goto(path, { waitUntil: 'networkidle' });
				expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBe(width);
				const results = await new AxeBuilder({ page }).analyze();
				const serious = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
				expect(serious, path).toEqual([]);
			}
		}
	});
}
```

- [ ] **Step 6: Run new tests and fix only demonstrated failures**

Run: `npm test -- --run src/style-lab-contract.test.ts`

Expected: PASS after the gallery links exist.

Run: `npm run test:e2e -- tests/e2e/lab-sites.spec.ts`

Expected: all route, parity, navigation, overflow, and Axe tests PASS. For each failure, adjust only the responsible namespaced theme selector or shared lab selector; do not weaken assertions or exclude Axe rules.

- [ ] **Step 7: Build and verify sitemap isolation**

Run: `npm run build:site`

Expected: all twelve routes appear in build output.

Run: `rg '/lab/' dist/sitemap*.xml`

Expected: no matches and exit code 1.

- [ ] **Step 8: Commit comparison and hardening changes**

```bash
git add src/pages/lab/styles.astro src/style-lab-contract.test.ts tests/e2e/lab-sites.spec.ts src/styles/lab-sites/base.css src/styles/lab-sites/signal.css src/styles/lab-sites/monograph.css src/styles/lab-sites/atlas.css
git commit -m "test: harden complete portfolio lab variations"
```

---

### Task 6: Full Verification and Browser Handoff

**Files:**
- No planned source changes.
- If verification finds a defect, add a failing regression test in the owning test file before changing the owning namespaced component or stylesheet.

**Interfaces:**
- Consumes: the complete three-system lab.
- Produces: fresh completion evidence and the user-facing local comparison entry point.

- [ ] **Step 1: Run complete static diagnostics and unit tests**

Run: `npm run check`

Expected: 0 errors, 0 warnings, 0 hints.

Run: `npm test`

Expected: every Vitest file PASS with 0 failures.

- [ ] **Step 2: Run the complete browser suite**

Run: `npm run test:e2e`

Expected: existing production tests plus all lab-site tests PASS with 0 failures.

- [ ] **Step 3: Run the production build, sitemap check, and link scan**

Run: `npm run build:site`

Expected: successful static build including the twelve lab-site routes.

Run: `rg '/lab/' dist/sitemap*.xml`

Expected: no matches and exit code 1.

Run: `npm run links`

Expected: every scanned link returns 200 and the command exits 0.

- [ ] **Step 4: Obtain an independent review**

Use `superpowers:requesting-code-review` against the commits created by Tasks 1–5. The reviewer must check spec coverage, route isolation, content accuracy, responsive behavior, accessibility tests, and whether each direction is visually coherent rather than a component collage. Fix every Critical and Important finding with a failing regression test first.

- [ ] **Step 5: Repeat the full verification gate after review fixes**

Run: `npm run check`

Expected: exit code 0 and Astro reports 0 diagnostics.

Run: `npm test`

Expected: exit code 0 and all unit tests pass.

Run: `npm run test:e2e`

Expected: exit code 0 and all browser tests pass.

Run: `npm run build:site`

Expected: exit code 0 and the static build completes successfully.

Run: `npm run links`

Expected: exit code 0 and every scanned link returns 200.

- [ ] **Step 6: Open the local comparison entry point**

Open `http://127.0.0.1:4321/lab/styles/` in the Codex browser panel. Keep the local development server running for the user’s review. Report the three home URLs and the verification counts without claiming deployment or production adoption.
