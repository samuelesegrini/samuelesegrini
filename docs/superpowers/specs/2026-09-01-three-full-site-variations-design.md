# Three Full-Site Portfolio Variations

**Date:** 2026-09-01  
**Status:** Approved direction; implementation pending  
**Scope:** Private `/lab/` prototype routes only

## Purpose

Turn the preferred studies from the twenty-direction style lab into three coherent portfolio systems. Each system must be experienced as a small site rather than as disconnected component samples. The prototypes are for comparative design decisions; they do not replace or modify the production portfolio.

The comparison must use the same real portfolio content in every variation. Differences should therefore come from hierarchy, typography, composition, color, and pacing rather than from stronger content in one option.

## Goals

- Create three clearly different but equally credible portfolio directions.
- Give every direction four working page types: homepage, project index, article detail, and project detail.
- Carry one visual system consistently through navigation, responsive layouts, reading surfaces, metadata, imagery, and evidence modules.
- Keep long-form reading primarily light and calm. Dark surfaces may mark an opening, media chapter, technical evidence section, or transition, but must not dominate every article.
- Use verified project facts and existing first-party artwork.
- Keep all prototype routes private, no-index, and outside the sitemap.
- Preserve every production route, component, stylesheet, and content document.

## Non-goals

- Replacing the production portfolio.
- Rebuilding all bilingual production routes.
- Adding a second CMS model or duplicating content files.
- Creating finished motion systems, WebGL effects, or elaborate page transitions.
- Designing new About, contact, RSS, search, filtering, or error pages.
- Publishing or deploying the lab.

## Shared Site Structure

Each variation will live under its own route prefix:

```text
/lab/sites/signal/
/lab/sites/signal/projects/
/lab/sites/signal/article/
/lab/sites/signal/project/

/lab/sites/monograph/
/lab/sites/monograph/projects/
/lab/sites/monograph/article/
/lab/sites/monograph/project/

/lab/sites/atlas/
/lab/sites/atlas/projects/
/lab/sites/atlas/article/
/lab/sites/atlas/project/
```

The short `article` and `project` paths deliberately represent one selected article and one selected case study. They keep the experiment focused on visual systems rather than recreating the production slug architecture.

Every route will expose real internal navigation between its four page types. A neutral lab switcher will sit outside the visual identity of each mini-site and let the viewer move among Signal System, Editorial Monograph, Living Atlas, and the original twenty-study gallery.

## Shared Content

All three variations use the same representative content:

- Featured projects: EasyManager, Galaxy Trucker, and SpinGO.
- Project detail: EasyManager.
- Article detail: “My first video game was a distributed system.”
- Supporting project facts and article excerpts come from the existing content collection or a small typed lab-content adapter derived from it.
- Artwork comes from the existing `/public/images/projects/` assets.

No metrics or status claims may be invented for visual convenience. Content extraction should fail during the build if a required record is missing rather than silently substituting placeholder copy.

## Variation 01: Signal System

### Character

Assertive, precise, and engineering-led. It takes the confident scale of Hero 01, the explicit structure of Hero 05, the cinematic work presentation of Cards 01, and the scan-friendly archive of Cards 02.

### Visual system

- Display type: Archivo.
- Narrative accent: Instrument Serif.
- Metadata: Space Mono.
- Foundation colors: chalk and near-black.
- Supporting color: cool blue.
- Accent: restrained dark red used only for active states, highlighted words, and evidence markers.
- Geometry: firm rules, compact rounded media frames, and minimal shadows.

### Page behavior

- **Homepage:** a light, oversized typographic hero with a status rail and indexed expertise. The first project uses a wide cinematic card; the remaining projects use a compact structured grid.
- **Project index:** a typographic list with type, year, and verified proof visible before opening a project. A selected or focused row may reveal its image.
- **Article:** a light technical notebook. A dark evidence chapter may contain an invariant, diagram, or state model; ordinary prose remains on a light surface.
- **Project detail:** a dark case-file opening containing title, year, role, system, and summary. The narrative body then moves to a light evidence-led layout.

## Variation 02: Editorial Monograph

### Character

Calm, reflective, and publication-like. It gives the engineering work the authority of a considered monograph without making it feel like a magazine imitation.

### Visual system

- Display and narrative type: Instrument Serif.
- Interface and headings: DM Sans.
- Small structural labels: Archivo.
- Foundation colors: warm ivory and ink.
- Supporting color: pale blue.
- Accent: oxblood, limited to links, drop caps, figure references, and current navigation.
- Geometry: fine rules, square or lightly rounded figures, generous whitespace, and no decorative card shadows.

### Page behavior

- **Homepage:** an editorial Hero 02 composition with a restrained issue line, large serif proposition, and an image-led featured-work section based on Cards 01.
- **Project index:** a quiet version of Cards 02. The list prioritizes title, role, and year; imagery appears as supporting material rather than as the entire card.
- **Article:** the narrow, quiet reader from Article 05 with Article 01 contents and marginalia on wide screens. The reading column remains stable as notes appear or collapse responsively.
- **Project detail:** a technical monograph based on Project Detail 04, with a title opening, figure sequence, metadata rail, restrained outcomes, and long-form narrative.

## Variation 03: Living Atlas

### Character

Experimental, navigational, and chapter-led. It uses Hero 05 as an active index, the poster energy of Cards 05, the cinematic openings of Article 04, and the sequential storytelling of Project Detail 02.

### Visual system

- Primary display type: Archivo.
- Poster labels: Unbounded, used sparingly.
- Narrative type: Instrument Serif.
- Metadata: Space Mono.
- Foundation colors: paper and deep navy.
- Supporting color: muted lavender.
- Accent: coral, restricted to route markers, chapter numbers, and selected states.
- Geometry: gridded atlases, chapter rails, full-width media apertures, and flat poster surfaces.

### Page behavior

- **Homepage:** a working-index hero with large typographic confidence. Featured projects appear as three vertical editions, followed by a concise text index.
- **Project index:** the Cards 02 information structure gains atlas numbering and poster-like image treatments without becoming a masonry collage.
- **Article:** a cinematic opening from Article 04 transitions into a light Article 01 reading system. Article 03 evidence modules may interrupt the prose only when a technical claim benefits from them.
- **Project detail:** Project Detail 02 chapter storytelling leads into a quieter Project Detail 04 prose surface. Images and system decisions alternate as numbered stages.

## Shared Components and Isolation

The mini-sites should share data and route scaffolding without sharing their visual decisions.

- A typed lab-content module exposes the selected projects, project detail, article, and navigation labels.
- A neutral lab switcher is shared across all twelve routes.
- Each visual system has one namespaced stylesheet or theme root. Selectors must not target production classes globally.
- Shared semantic page components may accept a theme identifier only when their document structure is genuinely identical. Different hierarchy should remain in variation-owned components rather than being forced through condition-heavy universal markup.
- The existing `/lab/styles/` gallery remains available and links to the three mini-sites once they exist.

## Responsive Behavior

- Desktop comparison target: 1280–1440 px.
- Mobile comparison target: 390 px, with a minimum supported width of 320 px.
- Navigation collapses without hiding access to any of the four page types or the variation switcher.
- Marginalia and metadata rails collapse into the reading flow on narrow screens.
- Poster titles and unbreakable technical labels must never be clipped by canvas overflow.
- All pages must avoid document-level horizontal scrolling.
- Interactive targets remain at least 44 px high on mobile where practical.

## Accessibility

- Semantic landmarks, heading order, navigation labels, and descriptive image alternatives are required on every route.
- All normal and large text must meet WCAG AA contrast.
- Keyboard focus must remain visible across each theme.
- The prototypes must respect reduced-motion preferences even if small transitions are added.
- Dark sections must preserve readable contrast and should not depend on accent color alone to communicate structure.

## Verification

The implementation is complete when:

- All twelve routes build and return successfully.
- Internal navigation works within every mini-site.
- The variation switcher reaches all three systems and the original gallery.
- The same selected content is visible in every system.
- Axe reports no serious or critical violations at 390 px and 1280 px for representative routes from each system.
- Mobile titles remain inside their visual bounds and no route creates horizontal overflow.
- Unit tests verify the route inventory, no-index metadata, sitemap exclusion, and selected content facts.
- The full existing unit and browser suites still pass.
- The production build and link scan pass.

## Delivery

The primary handoff is a local comparison experience beginning at `/lab/styles/`, with clear links to the three mini-sites. No production theme is selected or adopted as part of this work. A later decision can choose one direction, combine specific parts, or reject all three without requiring production rollback.
