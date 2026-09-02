# Living Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a separate, high-fidelity Living Library containing 27 living alternatives and the four existing creature components to the isolated toolbar motion prototype.

**Architecture:** Keep the original inline Component Library intact, adding only stable source identifiers and one new variant mount point to `motion-playground.html`. Implement the new catalogue, card rendering, filters, source navigation, state helpers, and creature controllers in one isolated ES module, with all Living Library layout and motion in one prefixed stylesheet. Extend the existing Playwright suite with a dedicated Living Library spec.

**Tech Stack:** Static HTML, CSS custom properties and keyframes, vanilla JavaScript ES modules, Web Animations/CSS animation events, Playwright with TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-02-living-library-design.md`

## Global Constraints

- Work only under `.superpowers/brainstorm/44547-1788275398/`; do not modify production portfolio routes or components.
- Preserve the existing Component Library's behavior and its 31-component count.
- Add exactly 27 alternatives and four independently rendered Original Creatures.
- Preserve every source component's category, accessible outcome, and 1–4-slot footprint.
- A creature's anatomy must encode its value, action, progress, direction, or payload; a decorative face alone is insufficient.
- Each alternative has one primary physical verb and uses `idle → anticipate → act → settle → idle` for finite motion.
- Each creature accepts `--accent`; functional animations terminate and typical durations remain between 450 and 1100 ms.
- Ignore repeated activation while `data-busy="true"`; never create unbounded animation queues.
- Support pointer, keyboard, `prefers-reduced-motion`, visible focus, synchronized visible/accessible state, and safe static fallback copy.
- Keep moving anatomy inside an explicit safe area and verify representative peak poses for clipping.
- Do not add third-party runtime dependencies.

## File Map

- Modify `.superpowers/brainstorm/44547-1788275398/content/motion-playground.html`
  - Link the Living Library assets, add the `F` variant shell and no-JavaScript fallback, add stable identifiers to original cards, and register `living` in variant navigation.
- Create `.superpowers/brainstorm/44547-1788275398/content/living-library.css`
  - Own all `ll-`-prefixed page/card layout, shared anatomy primitives, component-specific forms, motion, responsive rules, focus treatment, and reduced-motion overrides.
- Create `.superpowers/brainstorm/44547-1788275398/content/living-library.js`
  - Own catalogue entries, renderers, filters, source links, shared finite-motion helpers, per-component state, controller isolation, and the test-only failure hook.
- Create `.superpowers/brainstorm/44547-1788275398/tests/living-library.spec.ts`
  - Cover structure, catalogue totals, family interactions, source navigation, rapid input, reduced motion, failure isolation, focus, responsive layout, and clipping.
- Preserve `.superpowers/brainstorm/44547-1788275398/tests/motion-playground.spec.ts`
  - Use the unchanged existing suite as the regression gate for the original library.

## Execution Setup

Run all commands below from:

```bash
cd /Users/zens/Documents/ChatGPT/portfolio/.superpowers/brainstorm/44547-1788275398
```

The Playwright config expects a static server on port 59314. If it is not already running, start it in a separate terminal:

```bash
python3 -m http.server 59314 --bind 127.0.0.1 --directory content
```

---

### Task 1: Add the Living Library route shell and stable source identifiers

**Files:**
- Modify: `.superpowers/brainstorm/44547-1788275398/content/motion-playground.html:3-11,184-232`
- Create: `.superpowers/brainstorm/44547-1788275398/tests/living-library.spec.ts`

**Interfaces:**
- Consumes: Existing `showVariant(key, push)` and `variants` navigation in `motion-playground.html`.
- Produces: `?variant=living`, `#variant-living`, `#living-library-root`, unique original `[data-component]` identifiers, and loaded `living-library.css`/`living-library.js` assets.

- [ ] **Step 1: Write the failing route and source-identifier tests**

```ts
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
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
npx playwright test -c tests/playwright.config.ts tests/living-library.spec.ts
```

Expected: FAIL because `#variant-living`, its assets, and several stable source identifiers do not exist.

- [ ] **Step 3: Add the asset links, variant shell, and navigation key**

Add the stylesheet after the existing inline `<style>` and add the module after the existing classic script:

```html
<link rel="stylesheet" href="./living-library.css" />
...
<section class="variant" id="variant-living" data-name="F · Living Library">
  <div id="living-library-root" aria-live="polite"></div>
  <noscript>
    <style>#variant-living{display:block}</style>
    <div class="ll-no-script">
      <h1>A toolbar that feels alive.</h1>
      <p>27 living alternatives plus Progress Creature, Inbox Blob, Pixel Guest, and Mood Tile.</p>
    </div>
  </noscript>
</section>
...
<script type="module" src="./living-library.js"></script>
```

Change the classic-script variant registry to:

```js
const variants = ['machines', 'stickers', 'arcade', 'toolbar', 'library', 'living']
```

Create empty, valid assets so the route loads without 404s:

```css
/* Living Library styles are isolated behind the ll- prefix. */
```

```js
const root = document.querySelector('#living-library-root');
if (root) root.dataset.mounted = 'true';
```

- [ ] **Step 4: Add all missing original `data-component` identifiers**

Apply these exact identifiers to the source cards that currently lack one:

```text
Camera-lens search → camera-lens-search
Share ripple → share-ripple
Copy link → copy-link
Command launcher → command-launcher
Departure metric → departure-metric
Local clock → local-clock
Activity signal → activity-signal
Availability sensor → availability-sensor
Pixel weather → pixel-weather
Section checkpoints → section-checkpoints
Breadcrumb cards → breadcrumb-cards
View flip → view-flip
Filter deck → filter-deck
Mood tile → mood-tile
Magnetic word → magnetic-word
Timezone orbit → timezone-orbit
Pasted tag → pasted-tag
Discovery die → discovery-die
```

Do not change card order, labels, markup, or existing handlers.

- [ ] **Step 5: Run the route test and original regression suite**

Run:

```bash
npx playwright test -c tests/playwright.config.ts tests/living-library.spec.ts tests/motion-playground.spec.ts
```

Expected: 14 tests PASS: the new shell test plus the existing 13 regressions.

- [ ] **Step 6: Commit the route shell**

```bash
git add content/motion-playground.html content/living-library.css content/living-library.js tests/living-library.spec.ts
git commit -m "feat(prototype): add living library route shell"
```

---

### Task 2: Build the catalogue shell, shared runtime, and four Original Creatures

**Files:**
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.js`
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.css`
- Modify: `.superpowers/brainstorm/44547-1788275398/content/motion-playground.html`
- Modify: `.superpowers/brainstorm/44547-1788275398/tests/living-library.spec.ts`

**Interfaces:**
- Consumes: `#living-library-root`, source `[data-component]` identifiers, and global `window.showVariant('library')` from Task 1.
- Produces: `livingCatalog`, `livingRenderers`, `livingControllers`, `runFiniteMotion(control, options)`, `mountLivingLibrary()`, `.ll-card`, `[data-living-id]`, `[data-living-filter]`, and four interactive Original Creature cards.

- [ ] **Step 1: Write failing tests for the catalogue frame and Original Creatures**

Append:

```ts
test.beforeEach(async ({ page }) => {
	await page.goto(livingUrl);
});

test('living library starts with four independently rendered original creatures', async ({ page }) => {
	await expect(page.getByRole('heading', { name: 'A toolbar that feels alive.' })).toBeVisible();
	await expect(page.locator('.ll-summary')).toHaveText('0 alternatives · 4 original creatures');
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
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
npx playwright test -c tests/playwright.config.ts tests/living-library.spec.ts -g "original creature|catalogue frame"
```

Expected: FAIL because no catalogue shell or cards are rendered.

- [ ] **Step 3: Implement the catalogue and finite-motion runtime**

Use these exact shared shapes at the top of `living-library.js`:

```js
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const originalCreatures = [
  { id: 'original-progress-creature', sourceId: 'progress-creature', name: 'Progress Creature', kind: 'original', category: 'originals', slots: 3, accent: '#c7ff9f', verb: 'Stretch', renderer: 'progress', controller: 'progress' },
  { id: 'original-inbox-blob', sourceId: 'inbox-blob', name: 'Inbox Blob', kind: 'original', category: 'originals', slots: 2, accent: '#ffd4b8', verb: 'Swallow', renderer: 'inbox', controller: 'inbox' },
  { id: 'original-pixel-guest', sourceId: 'pixel-guest', name: 'Pixel Guest', kind: 'original', category: 'originals', slots: 1, accent: '#cdefff', verb: 'React', renderer: 'pixel', controller: 'pixel' },
  { id: 'original-mood-tile', sourceId: 'mood-tile', name: 'Mood Tile', kind: 'original', category: 'originals', slots: 1, accent: '#ded1ff', verb: 'Smile', renderer: 'mood', controller: 'mood' },
];

const livingCatalog = [...originalCreatures];
const livingRenderers = Object.create(null);
const livingControllers = Object.create(null);

function runFiniteMotion(control, { duration, target = control, eventName = 'animationend', onAct, onSettle }) {
  if (control.dataset.busy === 'true') return false;
  let finished = false;
  let fallback;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(fallback);
    target.removeEventListener(eventName, finish);
    control.dataset.state = 'settle';
    onSettle?.();
    requestAnimationFrame(() => {
      control.dataset.state = 'idle';
      control.dataset.busy = 'false';
    });
  };
  control.dataset.busy = 'true';
  control.dataset.state = 'anticipate';
  onAct?.();
  if (reduceMotion.matches) {
    finish();
    return true;
  }
  target.addEventListener(eventName, finish, { once: true });
  fallback = setTimeout(finish, duration + 100);
  requestAnimationFrame(() => { control.dataset.state = 'act'; });
  return true;
}
```

Add exact rendering helpers:

```js
function slotClass(slots) {
  return ['', 'one', 'two', 'three', 'four'][slots];
}

function renderCard(entry) {
  const source = entry.kind === 'original'
    ? '<span class="ll-source">Original creature</span>'
    : `<button class="ll-source-link" data-source-id="${entry.sourceId}">Alternative to: ${entry.sourceName}</button>`;
  return `<article class="ll-card" data-living-id="${entry.id}" data-living-category="${entry.category}" data-living-kind="${entry.kind}" data-living-slots="${entry.slots}" style="--accent:${entry.accent}">
    <header><h2>${entry.name}</h2>${source}</header>
    <p>${entry.description ?? `A living ${entry.verb.toLowerCase()} interaction.`}</p>
    <div class="ll-stage"><div class="ll-safe-area">${livingRenderers[entry.renderer](entry)}</div></div>
    <footer><span>${entry.kind === 'original' ? 'Original' : entry.category}</span><span>${entry.slots} ${entry.slots === 1 ? 'slot' : 'slots'}</span><span>${entry.verb}</span></footer>
  </article>`;
}

function renderLibrary() {
  const alternatives = livingCatalog.filter((entry) => entry.kind === 'alternative').length;
  const originals = livingCatalog.length - alternatives;
  const originalCards = livingCatalog.filter((entry) => entry.kind === 'original').map(renderCard).join('');
  const alternativeCards = livingCatalog.filter((entry) => entry.kind === 'alternative').map(renderCard).join('');
  root.innerHTML = `<header class="ll-head"><div><span class="kicker">Motion playground · F</span><h1>A toolbar that feels alive.</h1><p class="intro">Data and actions become anatomy.</p></div><strong class="ll-summary">${alternatives} alternatives · ${originals} original creatures</strong></header>
    <nav class="ll-filters" aria-label="Living component categories">${['all', 'originals', 'actions', 'data', 'navigation', 'personality'].map((filter) => `<button data-living-filter="${filter}" class="${filter === 'all' ? 'active' : ''}">${filter === 'all' ? `All ${livingCatalog.length}` : filter[0].toUpperCase() + filter.slice(1)}</button>`).join('')}</nav>
    <section class="ll-section" data-living-section="originals"><h2 class="ll-section-title">Original Creatures</h2><div class="ll-grid ll-original-grid">${originalCards}</div></section>
    <section class="ll-section" data-living-section="alternatives"><h2 class="ll-section-title">Living Alternatives</h2><div class="ll-grid ll-alternative-grid">${alternativeCards}</div></section>`;
}

function openSource(sourceId) {
  window.showVariant('library');
  document.querySelector('#variant-library [data-filter="all"]')?.click();
  const source = document.querySelector(`#variant-library [data-component="${sourceId}"]`);
  if (!source) return;
  source.setAttribute('tabindex', '-1');
  source.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  source.focus({ preventScroll: true });
  source.addEventListener('blur', () => source.removeAttribute('tabindex'), { once: true });
}

function mountLivingLibrary() {
  renderLibrary();
  root.querySelectorAll('[data-living-filter]').forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.livingFilter;
    root.querySelectorAll('[data-living-filter]').forEach((item) => item.classList.toggle('active', item === button));
    root.querySelectorAll('.ll-card').forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.livingCategory !== filter;
    });
    root.querySelectorAll('[data-living-section]').forEach((section) => {
      section.hidden = !section.querySelector('.ll-card:not([hidden])');
    });
  }));
  root.querySelectorAll('.ll-source-link').forEach((button) => button.addEventListener('click', () => openSource(button.dataset.sourceId)));
  livingCatalog.forEach((entry) => {
    const card = root.querySelector(`[data-living-id="${entry.id}"]`);
    livingControllers[entry.controller]?.(card, entry);
  });
}
```

Implement filters against `.ll-card` only. Do not reuse the existing global `[data-filter]` selector. Register all Original Creature renderers and controllers first, then call `mountLivingLibrary()` once at the bottom of the module.

- [ ] **Step 4: Render and control the four Original Creatures**

Register four independent renderers using only `ll-` classes and a primary `[data-living-action]` button. Preserve these states:

```text
progress: data-progress 48 → 65 → 82 → 31; update --progress, visible label, and aria-label; 720 ms stretch
inbox: data-unread 3 → 2 → 1 → 0 in one activation; update dots, body scale, and aria-label; 780 ms swallow
pixel: data-reaction idle → celebrate; update sprite and aria-label; 700 ms stepped hop
mood: aria-pressed false ↔ true; update mouth shape and aria-label; 520 ms smile
```

Each renderer must set `class="ll-control <slotClass>"`, `data-living-action`, `data-busy="false"`, and an initial accessible name. Each controller must call `runFiniteMotion` and must not query or mutate the original Component Library.

- [ ] **Step 5: Add the shared page and card styles**

Start `living-library.css` with the actual shared layout contract:

```css
#variant-living{background:#eef1ec}
.ll-head{display:grid;grid-template-columns:1fr 360px;gap:40px;align-items:end}
.ll-summary{padding:18px;border:1px solid #0002;border-radius:20px;background:#fff;font-size:18px}
.ll-filters{display:flex;flex-wrap:wrap;gap:6px;width:max-content;margin:38px 0 20px;padding:7px;border-radius:999px;background:#dce4da}
.ll-filters button{padding:9px 13px;border:0;border-radius:999px;background:transparent;color:#566056;cursor:pointer;font:8px var(--mono);text-transform:uppercase}
.ll-filters button.active{background:#111;color:#fff}
.ll-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.ll-section{margin-top:24px}.ll-section-title{margin:0 0 12px;font-size:22px;letter-spacing:-.04em}
.ll-card{min-width:0;padding:16px;border:1px solid #0002;border-radius:23px;background:#fff}
.ll-card[hidden]{display:none}
.ll-card header,.ll-card footer{display:flex;justify-content:space-between;gap:10px}
.ll-card h2{margin:0;font-size:16px;letter-spacing:-.035em}
.ll-card p{min-height:32px;margin:5px 0 13px;color:#777;font-size:10px;line-height:1.4}
.ll-card footer{margin-top:10px;color:#777;font:7px var(--mono);text-transform:uppercase}
.ll-stage{display:grid;min-height:124px;place-items:center;padding:14px;border-radius:16px;background:#111;overflow:hidden}
.ll-safe-area{position:relative;display:grid;width:100%;min-height:96px;place-items:center;overflow:visible}
.ll-control{position:relative;height:82px;border:0;border-radius:16px;background:#242424;color:#fff;cursor:pointer;overflow:visible}
.ll-control.one{width:82px}.ll-control.two{width:172px}.ll-control.three{width:min(100%,262px)}.ll-control.four{width:min(100%,352px)}
.ll-control:focus-visible,.ll-source-link:focus-visible,.ll-filters button:focus-visible{outline:3px solid var(--accent,#c7ff9f);outline-offset:3px}
.ll-control [data-motion-part]{pointer-events:none;will-change:transform,opacity}
@media(max-width:850px){.ll-head{grid-template-columns:1fr}.ll-filters{width:100%;border-radius:20px}.ll-grid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.ll-control *{animation-duration:.001ms!important;transition-duration:.001ms!important;animation-iteration-count:1!important}}
```

Add specific original-creature anatomy under `.ll-original-*` selectors. Keep every animated part inside `.ll-safe-area` at its largest resting and settled forms.

- [ ] **Step 6: Run the Original Creature tests and full original suite**

Run:

```bash
npx playwright test -c tests/playwright.config.ts tests/living-library.spec.ts tests/motion-playground.spec.ts
```

Expected: all tests PASS; `.ll-summary` reports `0 alternatives · 4 original creatures` at this checkpoint.

- [ ] **Step 7: Commit the catalogue foundation**

```bash
git add content/living-library.css content/living-library.js content/motion-playground.html tests/living-library.spec.ts
git commit -m "feat(prototype): add living library foundation"
```

---

### Task 3: Implement all seven Action alternatives

**Files:**
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.js`
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.css`
- Modify: `.superpowers/brainstorm/44547-1788275398/tests/living-library.spec.ts`

**Interfaces:**
- Consumes: `livingCatalog`, renderer/controller registries, `runFiniteMotion`, `slotClass`, and source linking from Task 2.
- Produces: Seven `category: 'actions'` entries and controls with `[data-living-action]` and stable `data-living-id` values.

- [ ] **Step 1: Write failing Action catalogue, behavior, and source-link tests**

```ts
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
	await expect(page.getByRole('button', { name: 'All 31' })).toHaveClass(/active/);
});
```

- [ ] **Step 2: Run the Action tests and verify they fail**

Run:

```bash
npx playwright test -c tests/playwright.config.ts tests/living-library.spec.ts -g "action family|courier moth|exact source"
```

Expected: FAIL because the seven entries and source-link controller are absent.

- [ ] **Step 3: Add the exact Action catalogue entries**

Append these entries to `livingCatalog`:

```js
const actionCreatures = [
  { id:'courier-moth', sourceId:'plane-send', sourceName:'Plane Send', name:'Courier Moth', kind:'alternative', category:'actions', slots:1, accent:'#ffd4b8', verb:'Launch', description:'Folds paper-like wings, launches, and returns to its perch.', renderer:'courierMoth', controller:'courierMoth' },
  { id:'scout-eye', sourceId:'camera-lens-search', sourceName:'Camera-lens Search', name:'Scout Eye', kind:'alternative', category:'actions', slots:1, accent:'#cdefff', verb:'Focus', description:'Opens its iris to search and refocuses when closed.', renderer:'scoutEye', controller:'scoutEye' },
  { id:'drop-beetle', sourceId:'trapdoor-download', sourceName:'Trapdoor Download', name:'Drop Beetle', kind:'alternative', category:'actions', slots:1, accent:'#c7ff9f', verb:'Drop', description:'Compresses its shell and releases the payload underneath.', renderer:'dropBeetle', controller:'dropBeetle' },
  { id:'echo-jelly', sourceId:'share-ripple', sourceName:'Share Ripple', name:'Echo Jelly', kind:'alternative', category:'actions', slots:1, accent:'#ded1ff', verb:'Echo', description:'Contracts before sending confirmation rings through its body.', renderer:'echoJelly', controller:'echoJelly' },
  { id:'link-twins', sourceId:'copy-link', sourceName:'Copy Link', name:'Link Twins', kind:'alternative', category:'actions', slots:2, accent:'#cdefff', verb:'Connect', description:'Two bodies reach across the slot and snap together.', renderer:'linkTwins', controller:'linkTwins' },
  { id:'key-crab', sourceId:'command-launcher', sourceName:'Command Launcher', name:'Key Crab', kind:'alternative', category:'actions', slots:2, accent:'#ffd4b8', verb:'Press', description:'Raises its claws and presses the command sequence.', renderer:'keyCrab', controller:'keyCrab' },
  { id:'compass-pup', sourceId:'magnet-action', sourceName:'Magnet Action', name:'Compass Pup', kind:'alternative', category:'actions', slots:1, accent:'#c7ff9f', verb:'Attract', description:'Leans toward the pointer with layered body and shadow depth.', renderer:'compassPup', controller:'compassPup' },
];
livingCatalog.push(...actionCreatures);
```

- [ ] **Step 4: Implement the seven renderers and controllers**

Use this exact state contract:

| ID | Required anatomy | Initial accessible state | Activation result | Duration |
| --- | --- | --- | --- | --- |
| `courier-moth` | `.ll-moth-body`, two `.ll-moth-wing`, `.ll-moth-shadow` | `Send email` | `Sending email` then `Email sent`; one launch/return | 1050 ms |
| `scout-eye` | `.ll-eye-lid`, `.ll-eye-iris`, `.ll-eye-pupil` | `Search closed`, `aria-expanded=false` | Toggle open/closed and update `aria-expanded` | 650 ms |
| `drop-beetle` | `.ll-beetle-shell`, `.ll-beetle-payload`, `.ll-beetle-legs` | `Download file` | `Download complete` after payload exits underside | 780 ms |
| `echo-jelly` | `.ll-jelly-body`, `.ll-jelly-ring` ×2 | `Share page` | `Page shared` after two rings | 720 ms |
| `link-twins` | `.ll-link-twin` ×2, `.ll-link-bridge`, `.ll-link-label` | `Copy link` | label and aria-label become `Copied` | 680 ms |
| `key-crab` | `.ll-crab-body`, `.ll-crab-claw` ×2, keycaps `⌘`, `K`, `↵` | `Open command menu` | `Command menu opened` after ordered presses | 820 ms |
| `compass-pup` | `.ll-pup-shadow`, `.ll-pup-body`, `.ll-pup-arrow` | `Open external link` | pointer-follow at three depths; click confirms `External link opened` | 620 ms |

All anatomical nodes that transform must carry `data-motion-part`. Use the shared `openSource(sourceId)` installed in Task 2 for every `.ll-source-link`; do not create family-specific source navigation.

- [ ] **Step 5: Add unique Action anatomy and motion styles**

Prefix all selectors with `ll-`. Add one named keyframe family per primary verb:

```css
@keyframes ll-moth-launch{0%{transform:none;opacity:1}45%{transform:translate(38px,-32px) scale(.72);opacity:0}55%{transform:translate(-42px,28px) scale(.7);opacity:0}100%{transform:none;opacity:1}}
@keyframes ll-beetle-drop{0%{transform:none}25%{transform:scaleX(1.12) scaleY(.82)}65%{transform:scaleX(.94) scaleY(1.08)}100%{transform:none}}
@keyframes ll-jelly-echo{0%,100%{transform:none}28%{transform:scaleX(1.14) scaleY(.78)}58%{transform:scaleX(.94) scaleY(1.08)}}
@keyframes ll-twins-connect{0%{transform:translateX(var(--away))}70%{transform:translateX(var(--meet)) scaleX(1.12)}100%{transform:translateX(var(--meet))}}
@keyframes ll-crab-press{0%,100%{transform:none}45%{transform:translateY(8px) rotate(var(--claw-turn))}}
@keyframes ll-pup-confirm{0%,100%{transform:none}40%{transform:translateY(-5px) rotate(-5deg)}70%{transform:translateY(2px) rotate(3deg)}}
```

Implement the Scout Eye with state-driven transitions rather than an infinite animation. Ensure Courier Moth uses an internal 72×72 motion envelope so its wings and antennae remain inside the safe area before opacity reaches zero.

- [ ] **Step 6: Run the Action tests and all regressions**

Run:

```bash
npx playwright test -c tests/playwright.config.ts
```

Expected: all tests PASS and the Living summary reports `7 alternatives · 4 original creatures`.

- [ ] **Step 7: Commit the Action family**

```bash
git add content/living-library.css content/living-library.js tests/living-library.spec.ts
git commit -m "feat(prototype): add living action alternatives"
```

---

### Task 4: Implement all eight Data alternatives

**Files:**
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.js`
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.css`
- Modify: `.superpowers/brainstorm/44547-1788275398/tests/living-library.spec.ts`

**Interfaces:**
- Consumes: Task 2's catalogue/runtime and Task 3's established card anatomy conventions.
- Produces: Eight `category: 'data'` entries with synchronized visible and accessible values.

- [ ] **Step 1: Write failing Data catalogue and changed-anatomy tests**

```ts
const dataIds = ['counter-caterpillar', 'number-owl', 'clock-bug', 'pulse-eel', 'radar-snail', 'weather-puff', 'peek-sprout', 'shell-knock'];

test('data family exposes eight distinct living alternatives', async ({ page }) => {
	await page.getByRole('button', { name: 'Data' }).click();
	await expect(page.locator('.ll-card:visible')).toHaveCount(8);
	for (const id of dataIds) await expect(page.locator(`[data-living-id="${id}"]`)).toHaveCount(1);
});

test('counter caterpillar animates only the segment whose digit changes', async ({ page }) => {
	const control = page.locator('[data-living-id="counter-caterpillar"] [data-living-action]');
	await expect(control).toHaveAttribute('data-value', '12');
	await control.click();
	await expect(control).toHaveAttribute('data-value', '13');
	await expect(control.locator('[data-changing="true"]')).toHaveCount(1);
	await expect(control).toHaveAttribute('aria-label', '13 published posts');
	await expect(control).toHaveAttribute('data-busy', 'false', { timeout: 1200 });
});

test('number owl preserves the unchanged tens eye', async ({ page }) => {
	const control = page.locator('[data-living-id="number-owl"] [data-living-action]');
	const tens = control.locator('.ll-owl-eye').first();
	const before = await tens.innerHTML();
	await control.click();
	await expect(control).toHaveAttribute('data-value', '25');
	expect(await tens.innerHTML()).toBe(before);
	await expect(control.locator('.ll-owl-eye[data-changing="true"]')).toHaveCount(1);
});
```

- [ ] **Step 2: Run the Data tests and verify they fail**

Run:

```bash
npx playwright test -c tests/playwright.config.ts tests/living-library.spec.ts -g "data family|counter caterpillar|number owl"
```

Expected: FAIL because the Data entries do not exist.

- [ ] **Step 3: Add the exact Data catalogue entries**

```js
const dataCreatures = [
  { id:'counter-caterpillar', sourceId:'split-metric', sourceName:'Split Metric', name:'Counter Caterpillar', kind:'alternative', category:'data', slots:1, accent:'#c7ff9f', verb:'Count', description:'Digit segments form its body; only the changed segment travels.', renderer:'counterCaterpillar', controller:'counterCaterpillar' },
  { id:'number-owl', sourceId:'departure-metric', sourceName:'Departure Metric', name:'Number Owl', kind:'alternative', category:'data', slots:2, accent:'#ded1ff', verb:'Blink', description:'Split-flap eyes turn only when their digit changes.', renderer:'numberOwl', controller:'numberOwl' },
  { id:'clock-bug', sourceId:'local-clock', sourceName:'Local Clock', name:'Clock Bug', kind:'alternative', category:'data', slots:2, accent:'#cdefff', verb:'Tick', description:'Carries local time while an antenna marks the blinking colon.', renderer:'clockBug', controller:'clockBug' },
  { id:'pulse-eel', sourceId:'activity-signal', sourceName:'Activity Signal', name:'Pulse Eel', kind:'alternative', category:'data', slots:1, accent:'#c7ff9f', verb:'Pulse', description:'Recent activity travels along a waveform spine.', renderer:'pulseEel', controller:'pulseEel' },
  { id:'radar-snail', sourceId:'availability-sensor', sourceName:'Availability Sensor', name:'Radar Snail', kind:'alternative', category:'data', slots:1, accent:'#ded1ff', verb:'Scan', description:'A feeler emits a radar pulse and reports availability.', renderer:'radarSnail', controller:'radarSnail' },
  { id:'weather-puff', sourceId:'pixel-weather', sourceName:'Pixel Weather', name:'Weather Puff', kind:'alternative', category:'data', slots:1, accent:'#cdefff', verb:'Forecast', description:'Its body becomes sun, cloud, or rain with the conditions.', renderer:'weatherPuff', controller:'weatherPuff' },
  { id:'peek-sprout', sourceId:'signal-peg', sourceName:'Signal Peg', name:'Peek Sprout', kind:'alternative', category:'data', slots:1, accent:'#c7ff9f', verb:'Emerge', description:'Emerges, wobbles, and settles to show availability.', renderer:'peekSprout', controller:'peekSprout' },
  { id:'shell-knock', sourceId:'knock-notice', sourceName:'Knock Notice', name:'Shell Knock', kind:'alternative', category:'data', slots:1, accent:'#ffd4b8', verb:'Knock', description:'A notification taps the shell before it is revealed or cleared.', renderer:'shellKnock', controller:'shellKnock' },
];
livingCatalog.push(...dataCreatures);
```

- [ ] **Step 4: Implement the eight renderers and controllers**

| ID | Required anatomy/state | Activation result | Duration |
| --- | --- | --- | --- |
| `counter-caterpillar` | two `.ll-caterpillar-segment` digits, `data-value=12` | increment to 13; mark only changed segment `data-changing=true`; settle to clean glyph | 520 ms |
| `number-owl` | two `.ll-owl-eye`, `data-value=24` | increment to 25; flip only changed eye | 640 ms |
| `clock-bug` | `.ll-clock-value`, `.ll-clock-antenna`, zone label | update local `HH:MM` every 30 s through one shared interval; button click performs one visible tick | 480 ms |
| `pulse-eel` | four spine nodes and `data-level=1` | cycle levels 1–3; update `Activity level N` | 680 ms |
| `radar-snail` | shell, feeler, two scan rings, `aria-pressed=false` | toggle availability and accessible state | 720 ms |
| `weather-puff` | sun, cloud, three rain drops, `data-weather=sun` | cycle `sun → rain → cloud`; update label | 780 ms |
| `peek-sprout` | pot, stem, two leaves, eyes, `aria-pressed=false` | toggle emerged/away and label | 660 ms |
| `shell-knock` | shell, inner creature, notice count 2 | clear to 0 and `No unread notices`; second activation restores 2 | 740 ms |

When a digit animation settles, remove `data-changing`; do not rebuild unchanged digit nodes. Keep the Clock Bug interval in one module-level variable so re-rendering does not create duplicate timers.

- [ ] **Step 5: Add unique Data anatomy and motion styles**

Add finite keyframes named `ll-segment-roll`, `ll-owl-blink`, `ll-clock-tick`, `ll-eel-pulse`, `ll-snail-scan`, `ll-puff-change`, `ll-sprout-emerge`, and `ll-shell-knock`. Use `overflow: visible` on digit glyph wrappers and set each digit segment's minimum inline size to `0.62em` so glyphs cannot be cut horizontally.

The Weather Puff must keep all three weather forms in the same 62×62 body envelope; hidden forms use opacity and transform, not layout removal during a transition.

- [ ] **Step 6: Run the Data tests and all regressions**

Run:

```bash
npx playwright test -c tests/playwright.config.ts
```

Expected: all tests PASS and the Living summary reports `15 alternatives · 4 original creatures`.

- [ ] **Step 7: Commit the Data family**

```bash
git add content/living-library.css content/living-library.js tests/living-library.spec.ts
git commit -m "feat(prototype): add living data alternatives"
```

---

### Task 5: Implement all eight Navigation alternatives

**Files:**
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.js`
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.css`
- Modify: `.superpowers/brainstorm/44547-1788275398/tests/living-library.spec.ts`

**Interfaces:**
- Consumes: Shared card/runtime/source APIs and the existing project names `EasyManager`, `Galaxy Trucker`, `SpinGO`, and `Service Pulse` as static prototype data.
- Produces: Eight `category: 'navigation'` entries with deterministic direction, order, and hierarchy.

- [ ] **Step 1: Write failing Navigation catalogue and direction tests**

```ts
const navigationIds = ['project-caterpillar', 'stepper-bug', 'trail-snail', 'turnover-turtle', 'fan-bird', 'dial-snail', 'shy-sticker', 'label-chameleon'];

test('navigation family exposes eight distinct living alternatives', async ({ page }) => {
	await page.getByRole('button', { name: 'Navigation' }).click();
	await expect(page.locator('.ll-card:visible')).toHaveCount(8);
	for (const id of navigationIds) await expect(page.locator(`[data-living-id="${id}"]`)).toHaveCount(1);
});

test('project caterpillar carries the old project away in the selected direction', async ({ page }) => {
	const card = page.locator('[data-living-id="project-caterpillar"]');
	await expect(card.locator('.ll-project-current')).toContainText('EasyManager');
	await card.getByRole('button', { name: 'Next project' }).click();
	await expect(card.locator('[data-direction]')).toHaveAttribute('data-direction', 'forward');
	await expect(card.locator('.ll-project-current')).toContainText('Galaxy Trucker', { timeout: 1400 });
	await card.getByRole('button', { name: 'Previous project' }).click();
	await expect(card.locator('.ll-project-current')).toContainText('EasyManager', { timeout: 1400 });
});

test('dial snail changes language and accessible switch state together', async ({ page }) => {
	const control = page.locator('[data-living-id="dial-snail"] [data-living-action]');
	await control.focus();
	await page.keyboard.press('Enter');
	await expect(control).toHaveAttribute('aria-checked', 'true');
	await expect(control).toHaveAttribute('aria-label', 'Language: English');
	await expect(control.locator('.ll-dial-value')).toHaveText('EN');
});
```

- [ ] **Step 2: Run the Navigation tests and verify they fail**

Run:

```bash
npx playwright test -c tests/playwright.config.ts tests/living-library.spec.ts -g "navigation family|project caterpillar|dial snail"
```

Expected: FAIL because the Navigation entries do not exist.

- [ ] **Step 3: Add the exact Navigation catalogue entries**

```js
const navigationCreatures = [
  { id:'project-caterpillar', sourceId:'conveyor-pager', sourceName:'Conveyor Pager', name:'Project Caterpillar', kind:'alternative', category:'navigation', slots:4, accent:'#c7ff9f', verb:'Carry', description:'Carries the current project away and brings the next one in.', renderer:'projectCaterpillar', controller:'projectCaterpillar' },
  { id:'stepper-bug', sourceId:'section-checkpoints', sourceName:'Section Checkpoints', name:'Stepper Bug', kind:'alternative', category:'navigation', slots:2, accent:'#ffd4b8', verb:'Hop', description:'Hops between article sections in reading order.', renderer:'stepperBug', controller:'stepperBug' },
  { id:'trail-snail', sourceId:'breadcrumb-cards', sourceName:'Breadcrumb Cards', name:'Trail Snail', kind:'alternative', category:'navigation', slots:3, accent:'#cdefff', verb:'Trail', description:'Leaves and retrieves breadcrumbs as hierarchy changes.', renderer:'trailSnail', controller:'trailSnail' },
  { id:'turnover-turtle', sourceId:'view-flip', sourceName:'View Flip', name:'Turnover Turtle', kind:'alternative', category:'navigation', slots:1, accent:'#ded1ff', verb:'Turn', description:'Turns its shell to expose grid or list view.', renderer:'turnoverTurtle', controller:'turnoverTurtle' },
  { id:'fan-bird', sourceId:'filter-deck', sourceName:'Filter Deck', name:'Fan Bird', kind:'alternative', category:'navigation', slots:2, accent:'#ffd4b8', verb:'Fan', description:'Spreads labelled feathers to reveal filters.', renderer:'fanBird', controller:'fanBird' },
  { id:'dial-snail', sourceId:'twist-dial', sourceName:'Twist Dial', name:'Dial Snail', kind:'alternative', category:'navigation', slots:1, accent:'#c7ff9f', verb:'Twist', description:'Rotates its shell between language detents.', renderer:'dialSnail', controller:'dialSnail' },
  { id:'shy-sticker', sourceId:'peel-tab', sourceName:'Peel Tab', name:'Shy Sticker', kind:'alternative', category:'navigation', slots:1, accent:'#cdefff', verb:'Peel', description:'Peels back its cover to reveal the selected route.', renderer:'shySticker', controller:'shySticker' },
  { id:'label-chameleon', sourceId:'card-shuffle-label', sourceName:'Card-shuffle Label', name:'Label Chameleon', kind:'alternative', category:'navigation', slots:2, accent:'#ded1ff', verb:'Change', description:'Exchanges stacked labels through a changing skin.', renderer:'labelChameleon', controller:'labelChameleon' },
];
livingCatalog.push(...navigationCreatures);
```

- [ ] **Step 4: Implement the eight renderers and controllers**

| ID | Required state and anatomy | Activation result | Duration |
| --- | --- | --- | --- |
| `project-caterpillar` | group with previous/next buttons, `.ll-project-current`, `.ll-project-next`, segmented caterpillar body | one project per activation; `data-direction=forward/backward`; buttons share one busy lock | 900 ms |
| `stepper-bug` | five markers, bug body, `data-step=1` | cycle 1–5 and update `Section N of 5` | 620 ms |
| `trail-snail` | shell, body, two breadcrumb cards, crumb trail | toggle depth between `Work` and `EasyManager`; update label | 760 ms |
| `turnover-turtle` | two-sided shell, `aria-pressed=false` | toggle grid/list and visible shell side | 680 ms |
| `fan-bird` | body and three labelled feathers, `aria-expanded=false` | fan/fold filters and accessible expansion state | 760 ms |
| `dial-snail` | rotating shell, pointer, `.ll-dial-value`, switch role | toggle IT/EN and checked state | 660 ms |
| `shy-sticker` | cover, revealed body, peel corner, `aria-pressed=false` | reveal/hide selected Projects route | 700 ms |
| `label-chameleon` | body plus two label skins, `aria-pressed=false` | `All projects ↔ Swift / iOS` and update state | 720 ms |

Use one per-card project index for Project Caterpillar; do not reuse the original library's global `projectIndex`. Ignore both pager buttons while the shared pager group is busy.

- [ ] **Step 5: Add unique Navigation anatomy and motion styles**

Add finite keyframes `ll-caterpillar-carry`, `ll-stepper-hop`, `ll-snail-trail`, `ll-turtle-turn`, `ll-bird-fan`, `ll-dial-turn`, `ll-sticker-peel`, and `ll-chameleon-change`. Directional keyframes must derive horizontal travel from `--direction: 1` or `-1`; do not mirror text glyphs.

The four-slot Project Caterpillar stage must fit within 352 px at desktop and `min(100%,352px)` on mobile. Its project-card window owns `overflow:hidden`; the creature body and legs remain in a separate visible safe layer so they are not clipped by the card window.

- [ ] **Step 6: Run Navigation tests and all regressions**

Run:

```bash
npx playwright test -c tests/playwright.config.ts
```

Expected: all tests PASS and the Living summary reports `23 alternatives · 4 original creatures`.

- [ ] **Step 7: Commit the Navigation family**

```bash
git add content/living-library.css content/living-library.js tests/living-library.spec.ts
git commit -m "feat(prototype): add living navigation alternatives"
```

---

### Task 6: Implement all four Personality alternatives and complete the catalogue

**Files:**
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.js`
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.css`
- Modify: `.superpowers/brainstorm/44547-1788275398/tests/living-library.spec.ts`

**Interfaces:**
- Consumes: The complete shared card/runtime behavior and existing category filters.
- Produces: Four `category: 'personality'` entries, a final 31-card catalogue, and final summary copy.

- [ ] **Step 1: Write failing Personality and final-count tests**

```ts
const personalityIds = ['letter-worm', 'orbit-pet', 'sticker-slug', 'dice-armadillo'];

test('personality family exposes four distinct living alternatives', async ({ page }) => {
	await page.getByRole('button', { name: 'Personality' }).click();
	await expect(page.locator('.ll-card:visible')).toHaveCount(4);
	for (const id of personalityIds) await expect(page.locator(`[data-living-id="${id}"]`)).toHaveCount(1);
});

test('complete living catalogue has twenty-seven alternatives plus four originals', async ({ page }) => {
	await expect(page.locator('.ll-summary')).toHaveText('27 alternatives · 4 original creatures');
	await expect(page.getByRole('button', { name: 'All 31' })).toBeVisible();
	await expect(page.locator('.ll-card')).toHaveCount(31);
	await expect(page.locator('[data-living-kind="alternative"]')).toHaveCount(27);
	await expect(page.locator('[data-living-kind="original"]')).toHaveCount(4);
});

test('every alternative has a unique id, valid source, matching footprint, and accent', async ({ page }) => {
	const expectedSlots: Record<string, string> = {
		'courier-moth':'1','scout-eye':'1','drop-beetle':'1','echo-jelly':'1','link-twins':'2','key-crab':'2','compass-pup':'1',
		'counter-caterpillar':'1','number-owl':'2','clock-bug':'2','pulse-eel':'1','radar-snail':'1','weather-puff':'1','peek-sprout':'1','shell-knock':'1',
		'project-caterpillar':'4','stepper-bug':'2','trail-snail':'3','turnover-turtle':'1','fan-bird':'2','dial-snail':'1','shy-sticker':'1','label-chameleon':'2',
		'letter-worm':'2','orbit-pet':'1','sticker-slug':'2','dice-armadillo':'1',
	};
	const cards = page.locator('[data-living-kind="alternative"]');
	const ids = await cards.evaluateAll((items) => items.map((item) => item.getAttribute('data-living-id')));
	expect(new Set(ids).size).toBe(27);
	for (const [id, slots] of Object.entries(expectedSlots)) {
		const card = page.locator(`[data-living-id="${id}"]`);
		await expect(card).toHaveAttribute('data-living-slots', slots);
		await expect(card).toHaveAttribute('style', /--accent:/);
		const sourceId = await card.locator('.ll-source-link').getAttribute('data-source-id');
		await expect(page.locator(`#variant-library [data-component="${sourceId}"]`)).toHaveCount(1);
	}
});

test('dice armadillo rolls to a different face and unfolds', async ({ page }) => {
	const control = page.locator('[data-living-id="dice-armadillo"] [data-living-action]');
	const before = await control.getAttribute('data-face');
	await control.click();
	await expect(control).not.toHaveAttribute('data-face', before!);
	await expect(control).toHaveAttribute('data-busy', 'false', { timeout: 1400 });
	await expect(control).toHaveAttribute('data-state', 'idle');
});
```

- [ ] **Step 2: Run the Personality tests and verify they fail**

Run:

```bash
npx playwright test -c tests/playwright.config.ts tests/living-library.spec.ts -g "personality family|complete living|dice armadillo"
```

Expected: FAIL because only 27 total cards exist at the previous checkpoint.

- [ ] **Step 3: Add the exact Personality catalogue entries**

```js
const personalityCreatures = [
  { id:'letter-worm', sourceId:'magnetic-word', sourceName:'Magnetic Word', name:'Letter Worm', kind:'alternative', category:'personality', slots:2, accent:'#c7ff9f', verb:'Reconnect', description:'Letter segments resist, scatter, and reconnect in order.', renderer:'letterWorm', controller:'letterWorm' },
  { id:'orbit-pet', sourceId:'timezone-orbit', sourceName:'Timezone Orbit', name:'Orbit Pet', kind:'alternative', category:'personality', slots:1, accent:'#cdefff', verb:'Orbit', description:'A satellite circles a body representing place and local time.', renderer:'orbitPet', controller:'orbitPet' },
  { id:'sticker-slug', sourceId:'pasted-tag', sourceName:'Pasted Tag', name:'Sticker Slug', kind:'alternative', category:'personality', slots:2, accent:'#ffd4b8', verb:'Lift', description:'Lifts and peels the selected-work label carried on its back.', renderer:'stickerSlug', controller:'stickerSlug' },
  { id:'dice-armadillo', sourceId:'discovery-die', sourceName:'Discovery Die', name:'Dice Armadillo', kind:'alternative', category:'personality', slots:1, accent:'#ded1ff', verb:'Roll', description:'Curls into a die, rolls, and unfolds on a new route.', renderer:'diceArmadillo', controller:'diceArmadillo' },
];
livingCatalog.push(...personalityCreatures);
```

- [ ] **Step 4: Implement the four renderers and controllers**

| ID | Required state and anatomy | Activation result | Duration |
| --- | --- | --- | --- |
| `letter-worm` | eight letter segments spelling `OPEN NOW` | scatter with bounded offsets, then reconnect in the original order; confirm `Status reassembled` | 820 ms |
| `orbit-pet` | central body, face, satellite, timezone label | one accelerated orbit and return; preserve `Italy · CET` label | 900 ms |
| `sticker-slug` | body, eye stalks, back label `SELECTED WORK` | lift and peel label, then settle raised/lowered; `aria-pressed` reflects state | 720 ms |
| `dice-armadillo` | six-faced shell, head, feet, `data-face=5` | choose a guaranteed different face 1–6, curl, roll, unfold, and announce `Random project N` | 880 ms |

Calculate Dice Armadillo's next face without allowing the previous value:

```js
const current = Number(control.dataset.face);
const roll = 1 + Math.floor(Math.random() * 5);
const next = roll >= current ? roll + 1 : roll;
control.dataset.face = String(next);
control.setAttribute('aria-label', `Random project ${next}`);
```

- [ ] **Step 5: Add unique Personality anatomy and motion styles**

Add finite keyframes `ll-worm-scatter`, `ll-orbit-lap`, `ll-slug-lift`, and `ll-armadillo-roll`. Assign deterministic `--scatter-x` and `--scatter-y` values by segment index so the worm stays within its two-slot safe area. Keep the orbit satellite inside the 82×82 one-slot control. Render die pips from `data-face` selectors and keep head/feet hidden only while the armadillo is curled.

- [ ] **Step 6: Run the Personality tests and all regressions**

Run:

```bash
npx playwright test -c tests/playwright.config.ts
```

Expected: all tests PASS, `All 31` is visible, and the summary reads `27 alternatives · 4 original creatures`.

- [ ] **Step 7: Commit the complete catalogue**

```bash
git add content/living-library.css content/living-library.js tests/living-library.spec.ts
git commit -m "feat(prototype): complete living component catalogue"
```

---

### Task 7: Harden rapid input, reduced motion, controller isolation, and keyboard behavior

**Files:**
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.js`
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.css`
- Modify: `.superpowers/brainstorm/44547-1788275398/content/motion-playground.html`
- Modify: `.superpowers/brainstorm/44547-1788275398/tests/living-library.spec.ts`

**Interfaces:**
- Consumes: All 31 entries and `runFiniteMotion`.
- Produces: Isolated `mountController(card, entry)`, `?failLiving=<id>` test hook, stable no-JavaScript mapping, and verified reduced-motion/keyboard outcomes.

- [ ] **Step 1: Write failing smoke, rapid-input, reduced-motion, and isolation tests**

```ts
const alternativeIds = [...actionIds, ...dataIds, ...navigationIds, ...personalityIds];

test('every living alternative activates once and returns to a stable state', async ({ page }) => {
	test.setTimeout(60_000);
	for (const id of alternativeIds) {
		const control = page.locator(`[data-living-id="${id}"] [data-living-action]`).first();
		await control.click();
		await expect(control).toHaveAttribute('data-busy', 'false', { timeout: 1800 });
		await expect(control).toHaveAttribute('data-state', 'idle');
	}
});

test('the complete living smoke run emits no uncaught page errors', async ({ page }) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	for (const id of alternativeIds) {
		const control = page.locator(`[data-living-id="${id}"] [data-living-action]`).first();
		await control.click();
		await expect(control).toHaveAttribute('data-busy', 'false', { timeout: 1800 });
	}
	expect(errors).toEqual([]);
});

test('rapid activation never queues multiple runs', async ({ page }) => {
	const control = page.locator('[data-living-id="key-crab"] [data-living-action]');
	await control.click();
	await control.click({ force: true });
	await control.click({ force: true });
	await expect(control).toHaveAttribute('data-run-count', '1');
	await expect(control).toHaveAttribute('data-busy', 'false', { timeout: 1400 });
});

test('one forced controller failure does not block later cards', async ({ page }) => {
	await page.goto(`${livingUrl}&failLiving=counter-caterpillar`);
	await expect(page.locator('[data-living-id="counter-caterpillar"]')).toHaveAttribute('data-controller-error', 'true');
	const later = page.locator('[data-living-id="dice-armadillo"] [data-living-action]');
	await later.click();
	await expect(later).toHaveAttribute('data-busy', 'false', { timeout: 1400 });
});

test.describe('living reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });
	test('representative controls apply final state without theatrical travel', async ({ page }) => {
		await page.goto(livingUrl);
		for (const id of ['courier-moth', 'counter-caterpillar', 'dial-snail', 'dice-armadillo']) {
			const control = page.locator(`[data-living-id="${id}"] [data-living-action]`).first();
			await control.focus();
			await page.keyboard.press('Enter');
			await expect(control).toHaveAttribute('data-busy', 'false');
			await expect(control).toHaveAttribute('data-state', 'idle');
			expect(await control.locator('[data-motion-part]').evaluateAll((parts) => parts.flatMap((part) => part.getAnimations()).length)).toBe(0);
		}
	});
});
```

- [ ] **Step 2: Run the hardening tests and verify at least the new guarantees fail**

Run:

```bash
npx playwright test -c tests/playwright.config.ts tests/living-library.spec.ts -g "every living|rapid activation|forced controller|living reduced"
```

Expected: FAIL on missing run counts, forced-failure handling, or incomplete reduced-motion behavior.

- [ ] **Step 3: Isolate controller mounting and instrument one-run semantics**

Implement exactly one try/catch boundary per card:

```js
const forcedFailure = new URL(location.href).searchParams.get('failLiving');

function mountController(card, entry) {
  try {
    if (entry.id === forcedFailure) throw new Error(`Forced controller failure: ${entry.id}`);
    livingControllers[entry.controller]?.(card, entry);
  } catch (error) {
    card.dataset.controllerError = 'true';
    card.querySelector('[data-living-action]')?.setAttribute('aria-disabled', 'true');
    console.warn('[Living Library] controller failed', entry.id, error);
  }
}
```

In `runFiniteMotion`, increment `data-run-count` only after passing the busy guard:

```js
control.dataset.runCount = String(Number(control.dataset.runCount || 0) + 1);
```

Do not use the `disabled` property during animations; retain focus and use the busy guard so keyboard position does not jump.

- [ ] **Step 4: Make reduced-motion completion synchronous and meaningful**

For reduced motion, call `onAct`, apply the final visible/accessible state, call `onSettle`, then set `data-state="idle"` and `data-busy="false"` before returning from the activation handler. Do not start CSS or Web Animations in this branch.

Stateful controls still toggle their logical value. One-shot controls still expose confirmation labels such as `Email sent`, `Download complete`, and `Page shared`.

- [ ] **Step 5: Expand the no-JavaScript fallback to include the complete mapping**

Inside the existing `<noscript>` fallback, add four plain lists containing every mapping from the design spec. Use the exact `Alternative → Source` order, including `Courier Moth → Plane Send` and `Dice Armadillo → Discovery Die`. Use text only; do not render inert buttons. Keep the `<style>#variant-living{display:block}</style>` rule so `?variant=living` remains readable when all JavaScript is disabled.

Add a no-JavaScript test in a separate describe:

```ts
test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });
	test('living route exposes a truthful static mapping instead of inert controls', async ({ page }) => {
		await page.goto(livingUrl);
		await expect(page.getByRole('heading', { name: 'A toolbar that feels alive.' })).toBeVisible();
		await expect(page.getByText('Courier Moth → Plane Send')).toBeVisible();
		await expect(page.getByText('Dice Armadillo → Discovery Die')).toBeVisible();
		await expect(page.locator('#variant-living button')).toHaveCount(0);
	});
});
```

- [ ] **Step 6: Run hardening tests and the complete suite**

Run:

```bash
npx playwright test -c tests/playwright.config.ts
```

Expected: all tests PASS; console warning occurs only for the explicit `failLiving` test case.

- [ ] **Step 7: Commit the hardening pass**

```bash
git add content/motion-playground.html content/living-library.css content/living-library.js tests/living-library.spec.ts
git commit -m "test(prototype): harden living component interactions"
```

---

### Task 8: Verify responsive geometry, clipping, focus visibility, and final visual quality

**Files:**
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.js`
- Modify: `.superpowers/brainstorm/44547-1788275398/content/living-library.css`
- Modify: `.superpowers/brainstorm/44547-1788275398/tests/living-library.spec.ts`

**Interfaces:**
- Consumes: Final 31-card library and all motion states.
- Produces: Desktop/mobile geometry guarantees, representative peak-pose checks, visible focus coverage, and final browser inspection evidence.

- [ ] **Step 1: Write failing responsive, safe-area, and focus tests**

```ts
test('living grid does not overflow a narrow viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page.locator('.ll-grid').first()).toBeVisible();
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
	expect(overflow).toBeLessThanOrEqual(0);
	for (const id of ['project-caterpillar', 'counter-caterpillar', 'courier-moth']) {
		const card = page.locator(`[data-living-id="${id}"]`);
		expect((await card.boundingBox())!.width).toBeLessThanOrEqual(358);
	}
});

test('representative motion envelopes contain anatomy before it intentionally fades', async ({ page }) => {
	for (const id of ['courier-moth', 'counter-caterpillar', 'project-caterpillar', 'dice-armadillo']) {
		const card = page.locator(`[data-living-id="${id}"]`);
		const safe = card.locator('.ll-safe-area');
		const control = card.locator('[data-living-action]').first();
		await control.click();
		const peakMs = Number(await control.getAttribute('data-peak-ms'));
		expect(peakMs).toBeGreaterThan(0);
		await page.waitForTimeout(peakMs);
		const result = await safe.evaluate((area) => {
			const box = area.getBoundingClientRect();
			return [...area.querySelectorAll('[data-motion-part]')]
				.filter((part) => Number(getComputedStyle(part).opacity) > 0.15)
				.every((part) => {
					const rect = part.getBoundingClientRect();
					return rect.left >= box.left - 1 && rect.right <= box.right + 1 && rect.top >= box.top - 1 && rect.bottom <= box.bottom + 1;
				});
		});
		expect(result, `${id} escaped its visible safe area`).toBe(true);
		await expect(control).toHaveAttribute('data-busy', 'false', { timeout: 1800 });
	}
});

test('keyboard focus is visibly outlined on controls, filters, and source links', async ({ page }) => {
	const targets = [
		page.getByRole('button', { name: 'Actions' }),
		page.locator('[data-living-id="courier-moth"] [data-living-action]'),
		page.locator('[data-living-id="courier-moth"] .ll-source-link'),
	];
	for (const target of targets) {
		await target.focus();
		const outlineWidth = await target.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth));
		expect(outlineWidth).toBeGreaterThanOrEqual(2);
	}
});
```

- [ ] **Step 2: Run layout tests and verify any real geometry failures**

Run:

```bash
npx playwright test -c tests/playwright.config.ts tests/living-library.spec.ts -g "narrow viewport|motion envelopes|keyboard focus"
```

Expected: initial failures identify any wide cards, unsafe motion envelopes, or missing focus outlines that still need correction.

- [ ] **Step 3: Correct only measured layout and clipping failures**

Add these measured peak-time hooks to the four representative controls before adjusting geometry:

```text
courier-moth: data-peak-ms="400"
counter-caterpillar: data-peak-ms="250"
project-caterpillar: data-peak-ms="420"
dice-armadillo: data-peak-ms="390"
```

Use these constraints rather than hiding overflow globally:

```css
.ll-card,.ll-card *{min-width:0}
.ll-stage{max-width:100%}
.ll-control.four{width:min(100%,352px)}
.ll-project-window{overflow:hidden}
.ll-safe-area,.ll-creature-layer{overflow:visible}
@media(max-width:420px){
  .ll-card{padding:13px}
  .ll-stage{padding:10px}
  .ll-control.four{width:100%}
}
```

Enlarge the relevant component's internal safe area or reduce its peak transform if a visible part escapes. Do not solve anatomy clipping by setting the whole page or card to `overflow:hidden`, and do not suppress the test by raising its one-pixel tolerance.

- [ ] **Step 4: Run the complete automated verification**

Run:

```bash
npx playwright test -c tests/playwright.config.ts
```

Expected: the full original and Living Library suites PASS.

- [ ] **Step 5: Inspect the final section in the in-app browser**

Open:

```text
http://localhost:59314/motion-playground.html?variant=living
```

Inspect and activate all cards at a desktop viewport, then repeat representative one-, two-, three-, and four-slot cards at 390×844. Specifically verify:

- every creature looks meaningfully different rather than like the same blob with a new face;
- each value or action is legible before interaction;
- the four Original Creatures read as the system's ancestors;
- wings, digit glyphs, antennae, shells, labels, and feet are not clipped;
- filters and source links remain visually subordinate to the creatures;
- motion returns cleanly to a stable pose;
- accent colors remain readable against both page and stage backgrounds.

If inspection reveals a defect, add a focused Playwright regression when the property is measurable, fix the smallest relevant selector/controller, and rerun the complete suite.

- [ ] **Step 6: Commit final visual and responsive corrections**

```bash
git add content/living-library.css content/living-library.js tests/living-library.spec.ts
git commit -m "fix(prototype): polish living library motion and layout"
```

- [ ] **Step 7: Record final evidence**

Run:

```bash
git status --short
git log -8 --oneline
npx playwright test -c tests/playwright.config.ts
```

Expected: only pre-existing unrelated untracked files appear outside the isolated prototype; the eight task commits are visible; the complete suite passes.
