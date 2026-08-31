# Employer-facing Awwwards-grade Portfolio Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the implemented editorial portfolio while adding truthful EasyManager proof, project-specific progressive motion, route continuity, stronger authorship cues, and launch-quality responsive/accessibility polish.

**Architecture:** Keep Astro responsible for all content and complete static markup. `ProjectCard.astro` remains the stable card frame, delegates artwork to focused Astro components by `translationKey`, and exposes ordinary links before JavaScript runs. Astro's `ClientRouter` and one small page-motion script progressively add route/reveal behavior; every enhancement collapses to static content under reduced motion, unsupported APIs, or disabled JavaScript.

**Tech Stack:** Astro 7.2, MDX content collections, TypeScript 6, CSS, browser View Transitions, Vitest 4, Playwright 1.62, Axe.

**Spec:** `docs/superpowers/specs/2026-08-30-employer-facing-awwwards-polish-design.md`

## Global Constraints

- Preserve the black hero, warm-paper editorial surfaces, acid-lime highlight, pastel card tones, Manrope/Newsreader/IBM Plex Mono typography, and current hero → three projects → writing → About composition.
- Keep exactly three published featured projects per locale and complete Italian/English parity.
- Final featured order is EasyManager, Galaxy Trucker, SpinGO; ranks change only after the complete bilingual EasyManager case study and route exist.
- EasyManager must distinguish the original 2023 app from the later `easymanager-pos` re-engineering and must not claim deployment, complete app migration, unreleased 0.2 work, or physical fiscal compatibility.
- Email is primary; GitHub and LinkedIn are supporting links.
- Add no animation dependency, WebGL, custom cursor, scroll hijacking, or public coming-soon route.
- JavaScript-disabled, unsupported-transition, and reduced-motion modes must retain complete content and ordinary navigation.
- Do not set `siteConfig.isPlaceholder` to `false` without both CV files, a production `PUBLIC_SITE_URL`, TinaCloud credentials, and all launch content.
- Preserve unrelated untracked files: `docs/research/2026-08-30-bending-spoons-subdirectory-layouts.md` and `graphify-out/`.
- TDD seams approved by the spec: `getFeaturedProjects` and content validation; rendered localized routes; `scripts/assert-launch-ready.mjs` production exit behavior.

---

### Task 1: Add the truthful bilingual EasyManager case study as a draft

**Files:**
- Modify: `src/lib/content.test.ts`
- Create: `src/content/projects/en/easymanager.mdx`
- Create: `src/content/projects/it/easymanager.mdx`
- Create: `public/images/projects/easymanager-service-pulse.svg`

**Interfaces:**
- Consumes: existing `ProjectEntry`, `validateContentSet`, `getFeaturedProjects`, MDX project schema, and project-detail rendering.
- Produces: a complete `translationKey: easymanager` locale pair with no `featuredRank`, initially `draft: true`, plus a static 1200×800 service-pulse cover.

- [x] **Step 1: Record the existing draft-exclusion contract**

Add a test proving that a complete bilingual draft with a tempting rank never leaks into the public featured seam:

```ts
test('excludes a bilingual draft project from featured work', () => {
	const drafts: ProjectEntry[] = (['it', 'en'] as const).map((locale) => ({
		...projects.find((project) => project.locale === locale)!,
		translationKey: 'easymanager',
		slug: locale === 'it' ? 'easymanager-sistema-ristorazione' : 'easymanager-restaurant-operations',
		title: 'EasyManager',
		draft: true,
		featuredRank: 1,
	}));

	expect(getFeaturedProjects([...projects, ...drafts], 'it').map(({ translationKey }) => translationKey))
		.not.toContain('easymanager');
});
```

- [x] **Step 2: Run the focused unit test to establish the seam**

Run: `npm test -- src/lib/content.test.ts`

Expected: PASS. This is a characterization seam for a data-only addition: draft filtering already protects the public homepage before new content exists.

- [x] **Step 3: Add the static EasyManager cover**

Create an accessible SVG asset with no embedded text required for meaning. Use five connected geometric nodes for draft, outbox, acknowledgement, device lane, and fiscal registry; distinguish the uncertain branch with shape as well as orange color. Keep the existing flat geometric vocabulary, pastel-blue field, black strokes, acid-lime active path, `viewBox="0 0 1200 800"`, and no raster dependency.

- [x] **Step 4: Write the English project entry**

Use this exact frontmatter contract:

```yaml
translationKey: easymanager
locale: en
slug: easymanager-restaurant-operations
title: EasyManager
excerpt: A restaurant app became a modular Swift toolkit built around durable orders, device lanes, and honest fiscal reconciliation.
draft: true
coverImage: /images/projects/easymanager-service-pulse.svg
coverAlt: Five connected stages follow a restaurant order from table draft to fiscal reconciliation
seoTitle: EasyManager — Swift restaurant operations case study
seoDescription: From a 2023 SwiftUI restaurant app to a modular Swift 6.3 operations toolkit designed around concurrency, hardware, and fiscal uncertainty.
kind: package
lifecycle: in-progress
authorship: individual
year: 2026
role: Product designer and software engineer
technologies:
  - Swift 6.3
  - SwiftUI
  - Swift Concurrency
  - SQL
  - DocC
outcomes:
  - value: "31"
    label: public modules
    method: Versioned 0.1 package products documented and built by the release gate
  - value: "0"
    label: remote package dependencies
    method: Swift package manifest
  - value: "0.1.0"
    label: released API
    method: Signed public release
startingPoint: A 2023 SwiftUI restaurant application whose product scope outgrew its original boundaries.
links:
  - url: https://github.com/samuelesegrini/easymanager
    label: Original application
    relationship: my-repository
  - url: https://github.com/samuelesegrini/easymanager-pos
    label: Later re-engineering
    relationship: my-repository
relatedPosts: []
```

The body must contain these sections with evidence-first prose: `Two eras, one problem domain`, `What the original application exposed`, `Re-engineering the boundaries`, `Following one order through failure`, `Hardware is not another API`, and `What is released—and what is not`. Include a visible status list naming the incomplete app migration, absence of deployment claims, unreleased 0.2 work, and missing physical compatibility evidence.

- [x] **Step 5: Write the idiomatic Italian entry with identical facts**

Use slug `easymanager-operazioni-ristorante`, role `Product designer e software engineer`, the same technologies/outcome values/link destinations, localized outcome labels/methods, and equivalent sections: `Due epoche, un solo dominio`, `Cosa ha mostrato l'applicazione originale`, `Ripensare i confini`, `Seguire un ordine attraverso il fallimento`, `L'hardware non è un'altra API`, `Cosa è rilasciato e cosa non lo è`.

- [x] **Step 6: Validate the draft content and site types**

Run: `npm run check`

Expected: 0 Astro diagnostics. Draft entries parse but generate no routes and do not change the current three featured projects.

- [x] **Step 7: Commit the draft case study**

```bash
git add src/lib/content.test.ts src/content/projects/en/easymanager.mdx src/content/projects/it/easymanager.mdx public/images/projects/easymanager-service-pulse.svg
git commit -m "content: add truthful EasyManager case study draft"
```

### Task 2: Strengthen positioning, contact identity, and card authorship

**Files:**
- Modify: `tests/e2e/home.spec.ts`
- Modify: `src/config/site.ts`
- Modify: `src/components/HomePage.astro`
- Modify: `src/components/ProjectCard.astro`
- Modify: `src/components/ProjectArchive.astro`
- Modify: `src/components/PostDetail.astro`
- Modify: `src/styles/global.css`
- Modify: `package.json`

**Interfaces:**
- Consumes: current `ProjectCard` props and localized project metadata.
- Produces: a card interface that accepts `translationKey`, `role`, `authorshipLabel`, and `lang`; accurate profile links and employer-facing bilingual hero copy.

- [x] **Step 1: Write failing rendered-route expectations**

Add E2E assertions at `/it/` and `/en/` for:

```ts
await expect(page.getByRole('heading', { level: 1 })).toContainText(
	lang === 'it' ? 'dall’interfaccia all’infrastruttura' : 'from interface to infrastructure',
);
await expect(page.locator('[data-featured-project]').first().locator('.project-role')).toBeVisible();
await expect(page.locator('footer').getByRole('link', { name: 'GitHub' })).toHaveAttribute(
	'href',
	'https://github.com/samuelesegrini',
);
```

Keep the existing three-project count assertion.

- [x] **Step 2: Run the focused E2E tests and verify red**

Run: `npx playwright test tests/e2e/home.spec.ts --grep "editorial portfolio hierarchy|English routes"`

Expected: FAIL because the headline, GitHub URL, and featured role line do not yet match.

- [x] **Step 3: Extend `ProjectCard` without changing its visual hierarchy**

Add these props:

```ts
translationKey?: string;
role?: string;
authorshipLabel?: string;
lang?: 'it' | 'en';
```

For featured cards, render `<p class="project-role">{authorshipLabel} · {role}</p>` between metadata and the project title block. Preserve archive status/proof rendering. Pass stable `translationKey` through a `data-project-key` attribute for later artwork selection.

- [x] **Step 4: Pass localized authorship and role from every card caller**

In `HomePage.astro`, define localized authorship labels and pass the project's `translationKey`, `role`, label, and locale. In `ProjectArchive.astro` and `PostDetail.astro`, pass the same available metadata without introducing a second labeling registry outside each page's existing localized maps.

- [x] **Step 5: Replace generic hero and placeholder profile copy**

Use these hero meanings:

```ts
it: {
	 headline: 'Software affidabile,',
	 emphasis: 'dall’interfaccia all’infrastruttura.',
	 intro: 'Progetto esperienze di prodotto e i sistemi che restano corretti quando reti, dispositivi e operazioni reali si complicano.',
	 cta: 'Email',
}
en: {
	 headline: 'Reliable software,',
	 emphasis: 'from interface to infrastructure.',
	 intro: 'I design product experiences and the systems that stay correct when networks, devices, and real operations get messy.',
	 cta: 'Email',
}
```

Set `siteConfig.github` to `https://github.com/samuelesegrini`. Keep `isPlaceholder: true`, the current fallback site URL, and the preview notice because CVs and production origin are still missing. Remove the obsolete `portfolio-owner` skip from the link command.

- [x] **Step 6: Style the authorship line and harden metadata size**

Keep the mono vocabulary but use at least `max(.7rem, 11px)` for non-critical metadata and `max(.75rem, 12px)` for the new role line. Do not move card title, cover, or arrow geometry.

- [x] **Step 7: Run focused checks and commit**

Run: `npm run check`

Run: `npx playwright test tests/e2e/home.spec.ts --grep "editorial portfolio hierarchy|English routes"`

Expected: PASS.

```bash
git add tests/e2e/home.spec.ts src/config/site.ts src/components/HomePage.astro src/components/ProjectCard.astro src/components/ProjectArchive.astro src/components/PostDetail.astro src/styles/global.css package.json
git commit -m "feat: sharpen portfolio positioning and authorship"
```

### Task 3: Publish the final trio and add the EasyManager service pulse

**Files:**
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `src/content/projects/en/easymanager.mdx`
- Modify: `src/content/projects/it/easymanager.mdx`
- Modify: `src/content/projects/en/highway-route-planner.mdx`
- Modify: `src/content/projects/it/highway-route-planner.mdx`
- Modify: `src/content/projects/en/priority-task-queue-manager.mdx`
- Modify: `src/content/projects/it/priority-task-queue-manager.mdx`
- Modify: `src/content/projects/en/galaxy-trucker.mdx`
- Modify: `src/content/projects/it/galaxy-trucker.mdx`
- Create: `src/components/project-artwork/ProjectArtwork.astro`
- Create: `src/components/project-artwork/EasyManagerServicePulse.astro`
- Modify: `src/components/ProjectCard.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `ProjectCard`'s `translationKey`, `lang`, `coverImage`, `coverAlt`, `lead`, and `featured` props.
- Produces: `ProjectArtwork.astro` with the same image semantics as the old card, plus an accessible EasyManager `data-service-pulse` control that reports five localized states.

- [x] **Step 1: Write the failing final-trio and pulse tests**

At both `/it/` and `/en/`, assert this exact ordered title list:

```ts
await expect(page.locator('[data-featured-project] h3')).toHaveText([
	'EasyManager',
	'Galaxy Trucker',
	'SpinGO',
]);
```

For the lead card, assert `[data-service-pulse]`, five `[data-pulse-step]` items, a localized accessible label, and the two repository links on the EasyManager detail route. Click the third control and assert `data-active-step="3"` plus its localized status text. Add a JavaScript-disabled context and assert that all five textual steps and the ordinary EasyManager link remain visible.

- [x] **Step 2: Run the new final-trio test and verify red**

Run: `npx playwright test tests/e2e/home.spec.ts --grep "EasyManager|featured trio|service pulse"`

Expected: FAIL because EasyManager is still a draft and the service-pulse component does not exist.

- [x] **Step 3: Activate the complete bilingual trio atomically**

Set both EasyManager entries to `draft: false` and `featuredRank: 1`. Set both Galaxy Trucker entries to rank 2. Keep SpinGO rank 3. Remove featured ranks from Highway Route Planner and Priority Task Queue Manager. Do not change their archive publication status.

- [x] **Step 4: Introduce the artwork dispatcher**

`ProjectArtwork.astro` accepts:

```ts
interface Props {
	translationKey?: string;
	lang: 'it' | 'en';
	coverImage?: string;
	coverAlt: string;
	lead: boolean;
	featured: boolean;
}
```

When `featured && translationKey === 'easymanager'`, render `EasyManagerServicePulse`. Otherwise render the existing `<img class="project-cover">` fallback with unchanged dimensions and loading behavior. Keep one dispatcher; do not repeat the switch in callers.

- [x] **Step 5: Refactor the card link to permit valid controls**

Replace the single wrapping link with a stable card surface containing metadata, artwork, text, and a title/arrow link. Give the title link a stretched `::after` hit area and keep service-pulse controls above it with a higher stacking context. This preserves whole-card activation while avoiding buttons nested inside an anchor. The link text remains the project title so existing role-based locators and accessible names remain stable.

- [x] **Step 6: Implement the five-state service pulse**

Render a localized heading and ordered list for:

```ts
const steps = lang === 'it'
	? ['Bozza del tavolo', 'Outbox persistente', 'Risposta del server', 'Corsia del dispositivo', 'Registro fiscale']
	: ['Table draft', 'Durable outbox', 'Server acknowledgement', 'Device lane', 'Fiscal registry'];
```

Each step is a button with `aria-pressed`; the root carries `data-active-step`. An `aria-live="polite"` status states the active step and the uncertain branch. The component script initializes on first load and `astro:page-load`, supports click plus ArrowLeft/ArrowRight/Home/End, and never removes the ordered textual sequence.

- [x] **Step 7: Add the static, interactive, and reduced-motion CSS states**

Use the existing card palette and frame. With no script, all nodes and labels are visible. Under `prefers-reduced-motion: no-preference`, active path segments may draw and nodes may translate by no more than 6px. Under reduced motion, every node is fully visible, transforms are removed, and controls switch state without animation.

- [x] **Step 8: Run focused content, E2E, accessibility, and type checks**

Run: `npm test -- src/lib/content.test.ts`

Run: `npx playwright test tests/e2e/home.spec.ts --grep "EasyManager|featured trio|service pulse"`

Run: `npx playwright test tests/e2e/accessibility.spec.ts --grep "homepage"`

Run: `npm run check`

Expected: all PASS; both locale builds expose exactly three ranks.

- [x] **Step 9: Commit the final trio and signature interaction**

```bash
git add tests/e2e/home.spec.ts tests/e2e/accessibility.spec.ts src/content/projects src/components/project-artwork src/components/ProjectCard.astro src/styles/global.css
git commit -m "feat: feature EasyManager service flow"
```

### Task 4: Add restrained Galaxy Trucker and SpinGO artwork motion

**Files:**
- Modify: `tests/e2e/home.spec.ts`
- Create: `src/components/project-artwork/GalaxyNetworkArtwork.astro`
- Create: `src/components/project-artwork/SpinGORouteArtwork.astro`
- Modify: `src/components/project-artwork/ProjectArtwork.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: the dispatcher interface from Task 3.
- Produces: two decorative progressive layers that retain the original cover image and expose `data-artwork-treatment` for rendered-route verification.

- [x] **Step 1: Write failing treatment and reduced-motion tests**

Assert the second and third featured cards expose `data-artwork-treatment="galaxy-network"` and `data-artwork-treatment="spingo-route"`. With `page.emulateMedia({ reducedMotion: 'reduce' })`, assert the animated overlay's computed `animationDuration` is `0.01ms` or its animation name is `none`; the underlying image remains visible with its original alt text.

- [x] **Step 2: Run the focused tests and verify red**

Run: `npx playwright test tests/e2e/home.spec.ts --grep "artwork motion|reduced motion"`

Expected: FAIL because the treatment components are absent.

- [x] **Step 3: Implement the Galaxy network overlay**

Render the existing Galaxy cover image unchanged, then add an `aria-hidden="true"` SVG overlay containing four client nodes, one authoritative-server node, and connecting paths. Animate path opacity/stroke only when motion is allowed. Do not reproduce the AI-reconstruction story in the artwork or copy.

- [x] **Step 4: Implement the SpinGO route overlay**

Render the existing SpinGO image unchanged, then add an `aria-hidden="true"` route path and three evidence markers. Animate the route dash and marker opacity once; keep the 109, 7, and 89.2 meanings in ordinary card/detail text rather than decorative SVG text.

- [x] **Step 5: Route treatments through the single dispatcher**

Dispatch only when the card is featured. Archive and related-work cards keep the static image, preventing duplicated animated surfaces and preserving page performance.

- [x] **Step 6: Run focused checks and commit**

Run: `npx playwright test tests/e2e/home.spec.ts --grep "artwork motion|reduced motion"`

Run: `npm run check`

Expected: PASS.

```bash
git add tests/e2e/home.spec.ts src/components/project-artwork src/styles/global.css
git commit -m "feat: animate supporting project artwork"
```

### Task 5: Add progressive route continuity and reveal choreography

**Files:**
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/ProjectCard.astro`
- Modify: `src/components/ProjectDetail.astro`
- Create: `src/scripts/page-motion.ts`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: Astro `ClientRouter`, stable translation keys, rendered `data-reveal` hooks.
- Produces: ordinary-link-compatible route transitions, one shared artwork transition name per route, and reveal classes that never hide content until the motion controller marks the document ready.

- [x] **Step 1: Write failing route and fallback tests**

Assert the rendered page contains `meta[name="astro-view-transitions-enabled"]`, a featured card and its detail cover share a non-`none` `viewTransitionName`, clicking the title reaches the localized case-study URL, browser Back returns to the homepage, and the destination heading becomes available to keyboard navigation. In a JavaScript-disabled context, assert the same link performs ordinary navigation.

- [x] **Step 2: Run the focused route test and verify red**

Run: `npx playwright test tests/e2e/home.spec.ts --grep "route transition|ordinary navigation"`

Expected: FAIL because `ClientRouter` and transition names are absent.

- [x] **Step 3: Enable Astro's progressive router**

Import `ClientRouter` from `astro:transitions` in `BaseLayout.astro` and render `<ClientRouter fallback="swap" />` in `<head>`. Use the built-in route announcer and ordinary anchor URLs; do not replace navigation with a custom router.

- [x] **Step 4: Assign stable shared-object names**

Pass `transition:name={`project-art-${translationKey}`}` to the featured artwork frame and the matching `ProjectDetail` hero cover. Ensure only one element per page owns each name. Use a normal fade/swap for routes without a project key.

- [x] **Step 5: Add the minimal reveal controller**

`src/scripts/page-motion.ts` must:

```ts
function initializePageMotion(root: ParentNode = document): void {
	const items = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
	if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
		for (const item of items) item.dataset.revealed = '';
		return;
	}
	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) if (entry.isIntersecting) {
			(entry.target as HTMLElement).dataset.revealed = '';
			observer.unobserve(entry.target);
		}
	}, { rootMargin: '0px 0px -8% 0px' });
	for (const item of items) observer.observe(item);
}
```

Initialize on first evaluation and `astro:page-load`. CSS may apply hidden/offset starting states only when a root `data-motion-ready` marker exists; the controller must reveal all items before setting that marker when observation is unavailable.

- [x] **Step 6: Add reveal hooks without changing page composition**

Apply `data-reveal` to section headings, featured cards, post cards, and About teaser content. Use one rise/fade vocabulary with small stagger variables. Do not animate prose paragraphs individually or delay interactive controls.

- [x] **Step 7: Verify route, history, reduced motion, and accessibility behavior**

Run: `npx playwright test tests/e2e/home.spec.ts --grep "route transition|ordinary navigation"`

Run: `npx playwright test tests/e2e/accessibility.spec.ts`

Run: `npm run check`

Expected: PASS with no serious/critical Axe findings.

- [x] **Step 8: Commit route continuity**

```bash
git add tests/e2e/home.spec.ts tests/e2e/accessibility.spec.ts src/layouts/BaseLayout.astro src/components/ProjectCard.astro src/components/ProjectDetail.astro src/scripts/page-motion.ts src/styles/global.css
git commit -m "feat: add progressive page transitions"
```

### Task 6: Finish shared responsive polish and explicit launch blockers

**Files:**
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `scripts/assert-launch-ready.mjs`
- Create: `scripts/launch-readiness.mjs`
- Create: `scripts/launch-readiness.test.ts`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/404.astro`

**Interfaces:**
- Consumes: existing `launch:check` command and rendered shared shell.
- Produces: testable `collectLaunchFailures` behavior, readable metadata/targets at required widths, persistent Email access, and coherent shell treatment on representative routes.

- [x] **Step 1: Write failing launch-check unit tests**

Refactor target behavior into an exported pure JavaScript function with this JSDoc contract:

```ts
/**
 * @typedef {object} LaunchInputs
 * @property {boolean} isProduction
 * @property {string} siteConfigSource
 * @property {NodeJS.ProcessEnv} environment
 * @property {ReadonlySet<string>} existingFiles
 * @property {ReadonlyMap<string, string>} contentSources
 */

/** @param {LaunchInputs} inputs @returns {string[]} */
export function collectLaunchFailures(inputs) {}
```

Test that non-production returns `[]`; production reports placeholder mode, missing production origin, missing Tina credentials, both CV paths, and demonstration copy; a complete input returns `[]`.

- [x] **Step 2: Run the focused launch test and verify red**

Run: `npm test -- scripts/launch-readiness.test.ts`

Expected: FAIL because the script does not export `collectLaunchFailures`.

- [x] **Step 3: Refactor the launch command without changing its CLI contract**

Keep `node scripts/assert-launch-ready.mjs` and `CF_PAGES_BRANCH === 'main'` behavior. Import `collectLaunchFailures` from `scripts/launch-readiness.mjs`, build real inputs in the CLI wrapper, print the existing `Production launch blocked:` format, and exit 1 when failures exist.

- [x] **Step 4: Add responsive shared-shell assertions**

At widths 320, 390, 768, 1280, and 1440, assert no page-level horizontal overflow on home, EasyManager detail, archive, article, About, and 404 samples. Assert mobile `summary` and persistent Email targets are at least 44px high and critical metadata computes to at least 11px.

- [x] **Step 5: Apply the bounded CSS polish**

- make the site header fixed/sticky with the same transparent-over-dark appearance at the top and a compact ink/backdrop surface after navigation, without introducing an immersive menu;
- keep the native mobile `<details>` menu and 44px targets;
- refine arrow translation, cover depth, focus, active, and pressed feedback within the existing cards;
- ensure metadata does not fall below the approved minimums;
- preserve the fixed 3rem project-archive top padding;
- make reveal and artwork states safe at all required widths;
- keep 404 typography and footer behavior inside the shared shell.

- [x] **Step 6: Confirm launch remains honestly blocked**

Run: `CF_PAGES_BRANCH=main PUBLIC_SITE_URL=https://portfolio-placeholder.pages.dev node scripts/assert-launch-ready.mjs`

Expected: exit 1 naming `siteConfig.isPlaceholder`, placeholder/missing site origin, Tina credentials, and both missing CV files. Do not weaken these failures.

- [x] **Step 7: Run focused tests and commit**

Run: `npm test -- scripts/launch-readiness.test.ts`

Run: `npx playwright test tests/e2e/home.spec.ts tests/e2e/accessibility.spec.ts`

Run: `npm run check`

Expected: PASS except the deliberately invoked production launch command from Step 6, which must fail with the specified blockers.

```bash
git add tests/e2e/home.spec.ts tests/e2e/accessibility.spec.ts scripts/assert-launch-ready.mjs scripts/launch-readiness.mjs scripts/launch-readiness.test.ts src/styles/global.css src/layouts/BaseLayout.astro src/pages/404.astro
git commit -m "feat: finish responsive launch polish"
```

### Task 7: Perform final verification, rendered inspection, and two-axis review

**Files:**
- Modify only files required to fix findings from verification or review.

**Interfaces:**
- Consumes: all preceding task outputs and the fixed review point `c690818`.
- Produces: a verified branch whose implementation commits match the approved spec, plus standards and spec review reports.

- [x] **Step 1: Stop or identify stale preview servers**

Inspect port 4321 and restart the Playwright-managed dev server if its process predates the current source. Do not diagnose source regressions against a stale Astro process.

- [x] **Step 2: Run the full suite once**

Run: `npm run verify`

Expected: Astro check, Vitest, full Playwright E2E, static build, and link scan all PASS.

Status: after commit `72c6813`, the controller ran `npm run verify` successfully: 27/27 unit tests, 81/81 E2E tests, a 32-page build, and 50/50 links passed. Production readiness remains deliberately blocked by the launch gate.

- [x] **Step 3: Inspect representative rendered pages**

Capture and inspect `/it/`, `/en/`, both EasyManager detail routes, `/it/progetti/`, one article, About, and 404 at 1440×1000, 768×1024, and 390×844. Check layout rhythm, card geometry, motion hierarchy, static/reduced-motion states, focus, text measure, footer, and absence of horizontal overflow. Treat stitched full-page screenshot duplication as a capture artifact only after verifying the DOM and viewport screenshots.

- [x] **Step 4: Invoke `/code-review` against the fixed point**

Use `c690818` as the fixed point and `docs/superpowers/specs/2026-08-30-employer-facing-awwwards-polish-design.md` as the spec. Run Standards and Spec reviews in parallel sub-agents. Because `docs/agents/issue-tracker.md` is absent, use the local committed spec directly and report the missing issue-tracker integration without blocking the review.

- [x] **Step 5: Fix every valid finding test-first**

For each accepted finding, reproduce it at the relevant approved seam, make the minimal correction, rerun the focused test, then rerun `npm run verify` only if the correction occurred after Step 2 and affects built behavior.

- [x] **Step 6: Confirm repository state and commit review fixes**

Run: `git status --short`

Expected: only the two preserved untracked paths remain. If review fixes exist, stage only the exact tracked paths shown by `git status --short` that were changed to address accepted findings, then run `git commit -m "fix: address portfolio polish review"`.

Do not stage `docs/research/2026-08-30-bending-spoons-subdirectory-layouts.md` or `graphify-out/`.
