# Employer-facing Awwwards-grade portfolio polish

Date: 2026-08-30

## Goal

Raise the existing portfolio to an unusually polished, employer-facing standard without replacing the implemented visual identity or turning the site into a creative-agency experiment.

The result should present Samuele as a general software engineer with Swift and iOS as the strongest technical anchor. Recruiters and engineering managers must understand the role, reach substantive proof quickly, and contact Samuele without navigating an ornamental experience.

“Awwwards-grade” means considered art direction, motion, continuity, responsiveness, and finish. It does not mean optimizing for an award submission, scroll hijacking, WebGL spectacle, a custom cursor, or a total visual rebrand.

## Preserved baseline

The redesign preserves these implemented choices:

- the black hero, warm-paper editorial surfaces, acid-lime highlight, pastel project tones, and flat geometric artwork language;
- Manrope for interface and display copy, Newsreader for narrative copy, and IBM Plex Mono for compact technical metadata;
- the homepage sequence of hero, one large featured project, two smaller featured projects, recent writing, About, and footer;
- exactly three featured projects;
- Italian as the default locale, complete English parity, and localized routes;
- separate project and writing collections;
- the existing archive, case-study, article, About, and navigation information architecture;
- the current accessible shell: skip link, visible focus, native mobile menu, semantic links, explicit image dimensions, and reduced-motion handling.

The work may refine spacing, pacing, type sizing, project media, animation, and route continuity inside that system. It must not replace the homepage with project “chapters,” a carousel, an immersive menu, or three unrelated microsite identities.

## Positioning and conversion

The hero presents this hierarchy:

1. Samuele is a software engineer;
2. he builds reliable products from interface to infrastructure;
3. Swift and iOS are the deepest anchor inside broader software-engineering ability;
4. featured work supplies the proof;
5. Email is the primary conversion.

The final bilingual hero copy may be idiomatic rather than literal, but both versions must preserve that meaning. It must avoid generic creative-agency language.

Email remains the persistent contact action. GitHub and LinkedIn remain visible supporting links in the footer and appropriate About surfaces. They must not compete with Email as three equal primary calls to action.

## Featured project model

The target launch order is:

1. EasyManager;
2. Galaxy Trucker;
3. SpinGO.

Every featured card shows role and authorship scope consistently. Team work must not look like individual work, and individual work must not require the reader to infer ownership.

The public homepage must never expose an empty EasyManager destination. During development, the bilingual EasyManager entries remain drafts without a `featuredRank`. The currently published trio continues to render. Launch activation is one atomic content change:

- publish both EasyManager locale entries and assign rank 1;
- assign Galaxy Trucker rank 2;
- keep SpinGO at rank 3;
- remove featured ranks from Highway Route Planner and Priority Task Queue Manager;
- verify the three-project invariant and locale parity before building.

## EasyManager narrative and claim boundary

EasyManager is one case study with two explicitly dated eras:

1. the original 2023 restaurant-management application at `samuelesegrini/easymanager`;
2. the later re-engineering effort at `samuelesegrini/easymanager-pos`.

The narrative weights the original application approximately 30% and the later re-engineering 70%. The original explains the product problem and the constraints discovered by building it. The later work proves Samuele's current Swift, architecture, concurrency, testing, hardware, fiscal, and package-design ability.

The case study may truthfully state that EasyManager POS contains a released `v0.1.0` modular Swift package with headless engines, optional SwiftUI products, hardware and fiscal adapters, testing products, architecture enforcement, and documented consumer fixtures.

It must also disclose, prominently and concisely:

- the private application has not completed migration to the public 0.1 API;
- the work is not claimed as a deployed restaurant product;
- physical POS, payment, and fiscal compatibility are not claimed beyond verified evidence;
- unreleased 0.2 work remains work in progress;
- the two repositories are related by later re-engineering, not an uninterrupted production history.

The case study links both repositories with explicit labels such as “Original application” and “Later re-engineering.”

## Homepage project artwork

The card dimensions, hierarchy, typography, tones, and geometric illustration language remain recognizable as the current implementation.

### EasyManager

The large lead card contains the single signature interaction: a “service pulse” that follows one order through five relationships:

1. table and order-taking draft;
2. durable outbox persistence before dispatch;
3. server acknowledgement or an uncertain queued outcome;
4. kitchen, bar, or fiscal work routed through serialized device lanes;
5. checkout and fiscal registry confirmation, with reconciliation instead of blind retry when execution is uncertain.

The interaction communicates system behavior rather than decorating the card. Desktop may advance it through restrained scroll-linked progress, but keyboard and touch users receive explicit controls. Reduced-motion and script-free experiences receive the complete static five-stage diagram and textual status.

### Galaxy Trucker

The existing network artwork receives a small internal animation: connections establish between the authoritative server and clients, then settle. The homepage emphasizes the original four-person distributed-system project. The later AI-assisted reconstruction stays clearly separated as related writing and does not receive equal homepage weight.

### SpinGO

The existing route artwork receives a small internal animation: the route draws forward and the evidence markers resolve into place. The animation reinforces the research-to-interface story and keeps the verified 109 responses, 7 usability sessions, and 89.2 SUS evidence subordinate to the project title.

Galaxy Trucker and SpinGO do not gain interactions as complex as EasyManager.

## Motion and route continuity

Motion is progressive enhancement built from CSS, Astro and browser View Transitions where supported, and one small focused TypeScript controller for state that CSS cannot express. No general animation dependency, WebGL layer, or custom cursor is introduced.

The motion system includes:

- coordinated but restrained viewport reveals;
- a shared-object transition from featured artwork or title into the matching case-study page;
- project-specific artwork motion described above;
- existing hover, focus, and pressed feedback refined into one timing and easing vocabulary.

The system must not hijack scroll position or delay navigation. When View Transitions are unavailable, links perform ordinary navigation. When JavaScript is unavailable, all content, evidence, navigation, and project artwork remain complete and understandable.

`prefers-reduced-motion: reduce` disables scroll-linked progress, route morphing, drawing, scaling, and non-essential entrance animation. It must not hide content or leave an interaction in an intermediate state.

## Case studies and real evidence

The homepage keeps geometric artwork rather than becoming a screenshot gallery. Project pages carry the authentic proof:

- interface screenshots with localized captions and accurate alt text;
- architecture and sequence diagrams that explain decisions;
- selected code or configuration evidence only when it materially supports a claim;
- visible project status, role, authorship, repository relationship, and limitations.

Project details remain evidence-first. Articles remain the deeper reasoning surface. The redesign does not duplicate entire case studies into the homepage.

## Shared page treatment

The first finished release must feel coherent across:

- both localized homepages;
- project archives and project details;
- writing indexes and article details;
- About pages;
- shared navigation and footer;
- the 404 page.

Only featured project media receives bespoke motion. Other routes inherit the refined shell, typography, focus behavior, transition vocabulary, spacing, and metadata sizing. They do not each require a signature effect.

Writing and About remain a quieter editorial epilogue after the featured work. They must not be interleaved between featured projects.

## Component and content boundaries

The implementation should preserve the current responsibilities:

- `HomePage.astro` owns homepage composition and featured-project ordering;
- `ProjectCard.astro` owns card semantics, metadata, link behavior, and the stable visual frame;
- a focused project-artwork layer selects a progressive treatment by stable `translationKey` and falls back to the existing cover image;
- each interactive artwork has a small isolated component rather than placing all SVG and state logic in `ProjectCard.astro`;
- `BaseLayout.astro` owns the shared transition capability and global navigation shell;
- `global.css` owns shared tokens, responsive layout, focus, reduced-motion overrides, and the common timing vocabulary;
- project content owns claims, links, captions, and localized narrative copy;
- the content layer continues to enforce locale parity and exactly three published featured ranks.

No second project-linking model, duplicate locale registry, animation framework, or client-side application shell is introduced.

## Responsive behavior

Desktop retains the large lead card followed by two smaller cards. Mobile retains the same content order but does not reproduce desktop-only scroll choreography.

At narrow widths:

- EasyManager becomes an explicit five-step control or complete static sequence;
- Galaxy and SpinGO artwork motion is optional and never required for meaning;
- project metadata remains readable without 10px critical text;
- interactive targets remain at least 44px in either dimension where applicable;
- artwork and captions never create page-level horizontal scrolling;
- the existing native mobile menu remains the navigation model;
- project cards keep differentiated pacing rather than becoming three indistinguishable fixed-height panels.

The implementation must be verified at 320px, 390px, 768px, 1280px, and 1440px representative widths.

## Accessibility and failure handling

Accessibility, responsiveness, and performance are launch gates, not negotiable polish.

- Every animation has a complete reduced-motion state.
- EasyManager controls are keyboard reachable, expose the current step, and do not rely on color alone.
- Decorative artwork remains hidden from assistive technology; meaningful state is available as text.
- Focus remains visible before, during, and after a route transition.
- Route transitions do not trap focus or suppress browser history.
- A failed or unsupported motion enhancement leaves the underlying link, image, and copy intact.
- The existing skip link and semantic heading order remain valid.
- Serious and critical automated accessibility findings remain at zero on representative routes and widths.

## Launch readiness

The source may remain in preview mode during implementation. A launch-ready build requires all of the following together:

1. replace the placeholder GitHub profile URL with Samuele's real profile;
2. replace the placeholder site URL with the production origin;
3. provide both localized CV files or deliberately redesign the About CV surface before disabling preview mode;
4. remove the homepage structural-preview notice and all incomplete-material copy;
5. publish the complete bilingual EasyManager case study and activate the final featured trio atomically;
6. keep both EasyManager generations and all limitations accurately labeled;
7. ensure no public route, social link, image, or call to action is a placeholder;
8. pass the full verification command and the launch-readiness check.

The redesign is not allowed to set `isPlaceholder` to `false` while required CV files, the production site origin, or the publishable EasyManager case study are absent.

## Verification

Implementation is complete when:

1. Astro validation, unit tests, E2E tests, the production site build, and link scan pass;
2. both homepages render exactly three published featured projects in the same semantic order;
3. the public build never exposes draft EasyManager content;
4. EasyManager's service pulse is usable with pointer, keyboard, touch, reduced motion, and JavaScript disabled;
5. unsupported View Transitions fall back to ordinary navigation without lost focus or content;
6. Galaxy and SpinGO motion does not compete with the EasyManager interaction;
7. representative home, archive, project, article, About, and 404 routes have no page-level horizontal overflow at the required widths;
8. serious and critical Axe findings remain at zero at 320px, 768px, and 1440px;
9. shared typography, focus, and transition behavior remain equivalent in Italian and English;
10. static project images retain explicit dimensions, eager loading remains limited to the lead image, and later media remains lazy-loaded;
11. launch readiness fails clearly while any required public identity, CV, production-origin, or EasyManager content input is missing;
12. the existing complete verification command passes from a clean preview-server state.

## Deliberate exclusions

- no full visual rebrand;
- no replacement project-chapter homepage;
- no carousel, horizontal-scroll gallery, or immersive menu;
- no custom cursor, WebGL, or generalized animation dependency;
- no scroll hijacking;
- no public “coming soon” EasyManager card;
- no invented production, deployment, fiscal-certification, or performance claims;
- no equal homepage emphasis for Galaxy Trucker's later AI-assisted reconstruction;
- no increase beyond exactly three featured projects;
- no publication or deployment as part of implementation unless the missing launch inputs are supplied and separately authorized.
