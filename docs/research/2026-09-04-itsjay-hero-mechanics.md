# itsjay.us hero and motion mechanics

Date: 2026-09-04
Scope: first-party inspection of [itsjay.us](https://www.itsjay.us) — every route, the shipped CSS and JavaScript bundles, and live DOM measurement at 1280×800. The site was named as the reference for the experimental home's hero (`/lab/it/`), so this note records the exact values behind its motion rather than a general impression. Numbers come from the deployed bundles (`dpl_6jXkvGFrFT4GQdLTrFhi4xDaRuPt`) and may change on his next deploy.

## Executive finding

The hero is not a static composition with an entrance animation. Its centre card belongs to the **second** viewport and is pulled up into the first at 35% scale; scrolling returns it to its own section at full size. The first screen is therefore a preview of the second, and the scroll is the transition between them.

Two consequences for our hero:

1. Our card currently grows 7% and drifts 9vh. His grows **from 0.35 to 1** across a full viewport of scroll. The difference between "a nice parallax" and "the page's main event" is entirely in that number.
2. His whole motion vocabulary is **three primitives** — a masked rise, a clip-path wipe, and a scrub-linked transform. Everything else on the site is one of those three with different values. There is nothing to invent.

## Routes

Three, and one of them is empty.

| Route | Content | Notes |
|---|---|---|
| `/` | Hero, intro card, about paragraph, 2 featured projects, 3 services, tech-stack marquee, logo strip | 6645px tall, 7 `<section>`s, **2455 characters of text in total** |
| `/work` | `[2022-2025] Selected Work`, then 6 rows | Row = name / category / year / a looping marquee of tags |
| `/work/<slug>` | Title, Year, Services list, a 3-sentence Summary, then 3–12 images | 6 projects; Trackstack has 12 images, Delivrd 3 |
| `/lab` | The string "The Lab" | A stub. Nothing else is in the markup. |

No `sitemap.xml`, no `robots.txt`. The 404 page carries `noindex`.

Worth noting against our own plan: he has fewer routes than we already have, no article system, and no second language. The weight is all on the home page.

## Hero anatomy (1280×800)

| Piece | Treatment |
|---|---|
| Meta row | 3 label/value pairs at `left-8`, plus a "Get in touch" pill top-right with a 🤙🏼 in a dark square |
| Centre card | 16:9, `rounded-3xl`, a real `<video>` with sound; click toggles mute, an unmute button scales in on hover |
| Micro row | `A` left, `SERIOUSLY` centre-absolute, `GOOD` right — one `justify-between` row at `clamp(14px, 1.2vw, 20px)` |
| Wordmark | `design.png` and `engineer.png`, `h-[10vw]`, justified edge to edge |
| Corners | "↓ Scroll for" bottom-left, "cool sh\*t ↓" bottom-right |
| Toolbar | Dark pill, centred, bottom: 80×80 avatar (a looping `.mov`), name, role marquee, hamburger |

The wordmark being **two PNGs** is the one decision I would not copy. It removes the display font from the critical path, but the largest text on the page stops being text.

## The three motion primitives

### 1. Masked rise (every text entrance)

```js
gsap.fromTo(parts, { yPercent: 100 }, {
  yPercent: 0, duration: 1, stagger: 0.1, ease: "power4.out", delay: r
})
```

A wrapper with `overflow: hidden`, the child at `translateY(100%)`, one second, 100ms apart. `power4.out` ≈ `cubic-bezier(0.165, 0.84, 0.44, 1)`.

Our implementation uses 900ms / 80ms / expo-out. Close enough that matching it exactly is a two-value edit, not a rewrite.

### 2. Clip wipe (every media entrance)

```js
initial:   { clipPath: "inset(0 0 100% 0)" }
animate:   { clipPath: "inset(0 0 0 0)" }
transition:{ duration: 1.2, delay: firstLoad ? 2.6 : 0.6, ease: [0.16, 1, 0.3, 1] }
```

The About section's video uses the same wipe at `duration: 1.5`. A `polygon(0 0, 100% 0, 100% 0, 0 0)` variant appears where `inset` interpolation is awkward.

That ease — `cubic-bezier(.16, 1, .3, 1)` — is the same one already bound to `--ease` in `ExperimentLayout.astro`.

### 3. Scrub-linked transform (the hero card)

The interesting one.

```js
gsap.timeline({ scrollTrigger: {
  trigger: ".intro", start: "top bottom", end: "top 10%", scrub: true,
  onUpdate: e => {
    state.currentTranslateY = interpolate(state.initialTranslateY, 0, e.progress)
    state.scale             = interpolate(0.35, 1, e.progress)
  }
}})
```

`initialTranslateY` is **in vh** and set per viewport width:

| Viewport ≤ | translateY | movementMultiplier |
|---|---|---|
| 900 | −95vh | 550 |
| 1200 | −105vh | 600 |
| 1600 | −118vh | 600 |
| 2000 | −110vh | 700 |
| 2500 | −115vh | 700 |
| larger | −125vh | 700 |

So at scroll 0 the card sits roughly one viewport **above** its own section — which is why it appears in the hero at all — and at 35% of its width. The card measured 426px wide on a 1280 viewport; its natural width is 1216. 426 / 1216 = 0.35.

On top of that, a mouse follow, desktop only, in one rAF loop:

```js
document.addEventListener("mousemove", e => {
  state.targetMouseX = (e.clientX / innerWidth - 0.5) * 2      // −1 … 1
})

const frame = () => {
  if (innerWidth < 768) return
  const gap  = (innerWidth - 64 - card.offsetWidth * state.scale) / 2
  const dest = Math.max(Math.min(state.targetMouseX * gap, gap), -gap)
  state.currentMouseX = interpolate(state.currentMouseX, dest, 0.15)   // lerp
  card.style.transform =
    `translateY(${state.currentTranslateY}vh) translateX(${state.currentMouseX}px) scale(${state.scale})`
  requestAnimationFrame(frame)
}
```

One transform string per frame, written directly, no per-frame tween. The lerp factor is `0.15`; the drift is clamped to the free space beside the card, so it can never leave the gutter.

### Other scroll triggers on the page

| Config | Used for |
|---|---|
| `start: "top 80%", end: "bottom 60%", scrub: 0.2` | light scrub, section-level |
| `start: "40% 95%", end: "100% 80%", scrub: 1` | heavier smoothing |
| `start: "top 75%", once: true` | one-shot reveals on enter |

Marquees run `duration: 32, ease: "linear"`.

## The roll-over pattern

Every hover label ships **two stacked copies** of its own text: the nav items contain "Home Home", the button "Get in touch Get in touch", and the tech-stack banner renders `M M O O D D E E R R N N`. One copy sits above the other inside a clipped box and the pair translates on hover or on scroll. It is the same mask as primitive 1, reused as an interaction.

## Palette and type

The stylesheet contains **no brand colour at all** — the entire shell is Tailwind's neutral ramp:

`#fafafa` `#f5f5f5` `#e5e5e5` `#d4d4d4` `#a1a1a1` `#404040` `#262626` `#171717`

Colour only ever arrives from content: the yellow of the hero video, the pink `theme-color` meta, project imagery. Our cream-and-acid palette is a deliberate departure, but the discipline — one ink, one paper, colour only where the work is — is worth keeping.

Type is fully fluid, no breakpoint jumps, all `clamp()`:

| Role | Value |
|---|---|
| labels, small copy | `clamp(14px, 1.2vw, 20px)` · `clamp(16px, 1.2vw, 20px)` |
| icons | `clamp(16px, 1.3vw, 24px)` |
| mid headings | `clamp(24px, 3.3vw, 56px)` · `clamp(28px, 3.5vw, 96px)` |
| display | `clamp(48px, 12vw, 200px)` · `clamp(48px, 14vw, 250px)` |
| media widths | `clamp(200px, 15vw, 400px)` · `clamp(500px, 32vw, 800px)` |

Fonts: **Saans** (400/500/600/700), **Saans Mono**, and **lcddot** — an LCD dot-matrix face used only for the toolbar's role marquee, at `10–12px` with wide tracking. All `font-display: swap` with `size-adjust` fallback metrics against Arial.

Spacing rhythm: gutters `px-4 lg:px-8` (16/32px), section padding `pt-32 lg:pt-56` (128/224px) and `pb-28` (112px), a 12-column grid at `gap-4 lg:gap-8`.

## Costs

**The preloader.** A counter from 0 to 100 runs on **every route**, and it took over 40 seconds on my connection before the home revealed. It gates the entrance animations by `delay: 2.6s` on first load versus `0.6s` after.

I said earlier in the session that the hero was empty in the DOM until the preloader finished. That was wrong: the markup is fully server-rendered — the wordmark images, all 7 sections and 46 images are present and readable while the counter is still climbing. The preloader is a perceived-performance cost, not an indexing one.

**The bundle.** 12 chunks, ~1.2MB of JavaScript uncompressed, carrying GSAP, ScrollTrigger, SplitText, Motion (framer-motion), `next-video`, and Next.js itself. Lenis is credited in his own project tags but does not appear in the home page's chunks.

Our hero currently does its equivalent work in **zero** bytes of JavaScript, using `animation-timeline: scroll()`. The one thing that primitive cannot express is the mouse follow, which needs a rAF loop — about 15 lines.

## What to take

1. **Grow the card from ~0.35 to 1** across the first viewport of scroll, instead of the current 1.07. This is the single change that would move our hero closest to the reference.
2. **Match the entrance to 1s / 100ms / power4.out**, two values from where we are.
3. **Mouse follow on the card**, clamped to the gutter, lerp 0.15 — the only piece that needs JavaScript.
4. **The micro row** above the wordmark: three short words at the left, centre and right edges.
5. **A dot-matrix face for the toolbar marquee** — closer to his `lcddot` than our current mono.

## What to leave

- The wordmark as images.
- A preloader of any length.
- Shipping four animation libraries to express three primitives.
