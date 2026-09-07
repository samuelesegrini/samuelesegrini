# Bending Spoons subpage composition research

Date: 2026-08-30  
Scope: first-party visual and structural inspection of the current Bending Spoons homepage, primary subdirectories, jobs directory and detail route, and one engineering-event microsite. This note extends the broader site-system study in `2026-08-27-bending-spoons-site-system.md` and focuses on what should replace the portfolio's unsatisfying project-cover treatment.

## Executive finding

Bending Spoons does not establish hierarchy by making a hero image the same width as a title column. It uses two distinct compositions:

1. **Immersive landing pages** make media a scene: a viewport-wide product panorama or a centered card flanked by cropped neighboring cards.
2. **Information and detail pages** often omit hero media: title, metadata, filters, or introductory prose become the first-screen composition, and evidence appears later in the reading sequence.

The portfolio's narrowed project cover falls between these systems. It is too small to behave like a scene and too decorative to behave like evidence. The strongest direction is therefore not another width adjustment: remove the generic cover from the project hero and reintroduce visuals as a separate evidence band or at the first body section where each image supports a concrete claim.

## Inspected routes

| Route | Page job | First-screen composition | Media behavior |
|---|---|---|---|
| [Home](https://www.bendingspoons.com/) | Company and product positioning | Black, exactly viewport-height scene with a centered oversized statement | A wide, edge-cropped procession of product panels occupies the bottom half. The panels read as one immersive panorama, not one illustration under one text column. |
| [Careers](https://www.bendingspoons.com/careers) | Employer narrative | White, viewport-height hero with an oversized centered statement and repeated application action | One dominant rounded media card is centered beneath the title while partial cards remain visible at both edges. On mobile, the central card remains large and the side cards stay cropped, preserving the carousel-like scene. |
| [Events](https://www.bendingspoons.com/events) | Event discovery | Soft-gray text hero with centered serif/sans title, then a compact availability statement | No image is required in the first viewport. Photography belongs to later event discovery content rather than being forced into the hero. |
| [Jobs](https://jobs.bendingspoons.com/) | Searchable opportunity directory | Soft-gray centered title, three large filter controls, one student/new-graduate option | No hero image. The interactive controls are the evidence that matters for this route. |
| [Graduate AI software engineer](https://jobs.bendingspoons.com/positions/695a6f1127aeb1bf21a1b44d) | Long-form detail page | Two columns: title, location, contract, and action on the left; narrative introduction on the right | No hero image. The body begins inside the first viewport, and later sections keep a narrow, readable measure. The information hierarchy replaces decorative media. The route identifier is current as of the research date and may change. |
| [First Commit](https://firstcommit.bendingspoons.com/) | Engineering-event landing page | Large centered statement, concise deck, then one bordered metadata/action strip | No photographic hero. A faint full-field line texture gives the scene identity without competing with the title or event facts. |

## What the subpages actually reuse

The reusable unit is a **scene grammar**, not a fixed image component:

- A page chooses one dominant first-screen job: proposition, application, filtering, event facts, or detail orientation.
- Large media is used only when the media itself establishes the proposition. [Home](https://www.bendingspoons.com/) uses products; [Careers](https://www.bendingspoons.com/careers) uses people and work.
- When text, controls, or metadata carry the proposition, [Events](https://www.bendingspoons.com/events), [Jobs](https://jobs.bendingspoons.com/), and the [job detail](https://jobs.bendingspoons.com/positions/695a6f1127aeb1bf21a1b44d) leave the hero unburdened by an image.
- Background changes divide large narrative scenes. Inner cards are used for repeated or comparable units, not to box every section.
- Serif contrast is applied inside a large sans-serif statement, while metadata, controls, and body copy remain restrained.
- Mobile preserves the page's idea rather than merely stacking desktop columns. The Careers hero still presents one dominant card with neighboring cards partially visible; the event and jobs pages remain text-first.

## Implications for this portfolio

### Why the current project hero feels wrong

The portfolio currently combines a large title/deck grid with a generic cover below it. At full width the cover competes with the title and makes the dark hero taller than necessary. At title-column width it looks like a leftover card and leaves an unexplained empty region under the deck. Neither composition tells the reader what the image proves.

This differs from the inspected first-party pages:

- immersive Bending Spoons media deliberately spans or escapes the content frame;
- detail pages let title, metadata, action, and prose form the opening composition;
- later visuals change shape according to the evidence they contain.

### Recommended project-detail composition

Use a **text hero followed by evidence**, inspired by the information hierarchy of the jobs detail page rather than by the visual shell of the homepage:

1. Keep the dark project hero for identity, but include only back navigation, kind/year, title, and outcome-led deck.
2. Let the hero end near one viewport without requiring an image to fill the remaining height.
3. Begin the light section with the existing evidence rail and narrative introduction, so useful project facts appear immediately.
4. Move `coverImage` out of the generic hero. Render it only as a separate first evidence band when it adds information.
5. Give each flagship its most truthful first visual:
   - Highway: the implicit-graph explainer belongs beside the route-model section.
   - Priority Queue: the insertion/state visual belongs beside protocol evidence.
   - Galaxy Trucker: the authoritative-server flow can become the first wide technical scene.
   - SpinGO: the research-loop visual or interface artifact can lead the evidence section.
6. Keep secondary projects text-first until they have a genuinely explanatory asset.

This does not require every project to share one media aspect ratio. The shared system should be title hierarchy, gutters, evidence ordering, and responsive reading behavior; visual geometry should follow the claim.

## Viable alternatives

### A. Text hero plus first-evidence visual — recommended

Remove the generic cover from the dark hero and position a claim-specific visual in the light body. This produces the clearest project-detail hierarchy, shortens the hero, and matches Bending Spoons' distinction between detail pages and immersive landing pages.

### B. Full-width panoramic hero scene

Restore a wide image, but treat it like the [Home](https://www.bendingspoons.com/) product panorama: full inner width or edge-cropped, visually dominant, and specific to the project. This can work for Galaxy Trucker or SpinGO, but applying it to every project would manufacture drama where evidence is thin.

### C. Centered card with cropped neighbors

Adapt the [Careers](https://www.bendingspoons.com/careers) hero for projects that have several comparable artifacts: one central screenshot with neighboring interface or process frames peeking from the sides. This is useful only when a real sequence exists; it should not become a generic decoration.

## Decision recommendation

Undo the title-column cover rule. Adopt option A as the default project-detail composition, with B or C available only for projects whose assets support them. This translates Bending Spoons' strongest principle—route-specific evidence hierarchy—without copying its branding or turning every portfolio page into a marketing landing page.

## Sources

- [Bending Spoons home](https://www.bendingspoons.com/)
- [Bending Spoons careers](https://www.bendingspoons.com/careers)
- [Bending Spoons events](https://www.bendingspoons.com/events)
- [Bending Spoons jobs](https://jobs.bendingspoons.com/)
- [Bending Spoons job detail](https://jobs.bendingspoons.com/positions/695a6f1127aeb1bf21a1b44d)
- [First Commit by Bending Spoons](https://firstcommit.bendingspoons.com/)
