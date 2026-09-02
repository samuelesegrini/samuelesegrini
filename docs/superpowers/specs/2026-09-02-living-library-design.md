# Living Library Design

**Status:** Approved

**Date:** 2026-09-02

**Scope:** Isolated toolbar motion prototype only

## Summary

Add a new top-level prototype section, `F · Living Library`, alongside the existing `E · Component Library`. The new section presents living alternatives for every compatible toolbar component without replacing or modifying the originals.

The system contains 27 new alternatives and the four existing living components—Progress Creature, Inbox Blob, Pixel Guest, and Mood Tile—as its reference organisms. Every alternative preserves the source component's purpose, category, footprint, and accessible outcome while expressing its data or action through a distinct creature body and physical verb.

## Goals

- Provide one living alternative for each of the 27 non-living components in the current 31-component library.
- Keep the existing Component Library unchanged and available for direct comparison.
- Make every creature's anatomy communicate its function or current value.
- Give each alternative a unique, playful motion without losing the portfolio's restrained editorial character.
- Preserve the source component's 1–4-slot footprint and interaction semantics.
- Make every interaction deterministic, keyboard-operable, reduced-motion safe, and resistant to repeated clicks.
- Keep the work isolated inside the throwaway motion prototype; do not modify production portfolio routes or components.

## Non-goals

- Replacing the original Component Library.
- Building a toolbar composer or production-ready component package.
- Adding decorative faces to components without a semantic body transformation.
- Refactoring unrelated prototype variants or production portfolio code.
- Making every component animate continuously.

## Information Architecture

The prototype navigation gains a sixth destination:

- `E · Component Library` remains the original 31-component catalogue.
- `F · Living Library` contains 27 alternatives plus four reference organisms.

The Living Library page has four regions:

1. A header titled **A toolbar that feels alive** with the summary `27 alternatives · 4 original creatures`.
2. An **Original Creatures** row containing full interactive cards for Progress Creature, Inbox Blob, Pixel Guest, and Mood Tile.
3. Category filters for `All 31`, `Originals`, `Actions`, `Data`, `Navigation`, and `Personality`.
4. A responsive **Living Alternatives** grid with three columns on desktop and one column on narrow screens.

Every alternative card includes:

- creature name;
- a source label in the form `Alternative to: <source component>`;
- a short functional description;
- an interactive stage;
- source category, footprint, and physical verb;
- a link that opens the matching source card in the Component Library.

The source link switches to the Component Library, activates its `All 31` filter, scrolls the matching source card into view, and moves programmatic focus to that card through a temporary `tabindex="-1"`. It must not alter the source card's interactive state.

All original cards receive stable `data-component` identifiers solely for this linking behavior. The four reference cards in the Living Library are independently rendered instances; no live DOM node is moved or cloned from the Component Library.

## Transformation Catalogue

### Actions

| Source component | Living alternative | Functional anatomy and verb |
| --- | --- | --- |
| Plane Send | Courier Moth | Folds its wings like paper, launches, and returns to its perch. |
| Camera-lens Search | Scout Eye | Its iris opens as the search aperture and refocuses on completion. |
| Trapdoor Download | Drop Beetle | Compresses its shell before releasing the payload through its underside. |
| Share Ripple | Echo Jelly | Contracts and emits visible confirmation rings through its body. |
| Copy Link | Link Twins | Two small bodies reach, snap together, and confirm the copy. |
| Command Launcher | Key Crab | Raises its claws, presses the command sequence, and settles. |
| Magnet Action | Compass Pup | Leans toward the pointer with layered body, icon, and shadow depth. |

### Data

| Source component | Living alternative | Functional anatomy and verb |
| --- | --- | --- |
| Split Metric | Counter Caterpillar | Its digit segments form the body; only the changed segment travels. |
| Departure Metric | Number Owl | Its split-flap eyes display the total; only affected eyes blink or turn. |
| Local Clock | Clock Bug | Its body holds local time while its antenna marks the ticking colon. |
| Activity Signal | Pulse Eel | Recent activity travels as a waveform along its spine. |
| Availability Sensor | Radar Snail | A feeler emits the availability pulse while the body reacts to status. |
| Pixel Weather | Weather Puff | Its body becomes sun, cloud, or rain and changes expression with conditions. |
| Signal Peg | Peek Sprout | Emerges, wobbles, and settles to communicate availability. |
| Knock Notice | Shell Knock | A notification taps the shell before the creature reveals or clears it. |

Inbox Blob remains an Original Creature and is not duplicated as an alternative.

### Navigation

| Source component | Living alternative | Functional anatomy and verb |
| --- | --- | --- |
| Conveyor Pager | Project Caterpillar | Carries the current project card away and brings the next card in from the chosen direction. |
| Section Checkpoints | Stepper Bug | Hops between section markers while preserving reading order. |
| Breadcrumb Cards | Trail Snail | Leaves or retrieves a breadcrumb as hierarchy changes. |
| View Flip | Turnover Turtle | Turns its shell to expose grid or list mode. |
| Filter Deck | Fan Bird | Spreads labelled feathers to reveal filters and folds them back together. |
| Twist Dial | Dial Snail | Rotates its shell between the language detents. |
| Peel Tab | Shy Sticker | Peels back its covering to reveal the selected route state. |
| Card-shuffle Label | Label Chameleon | Exchanges stacked labels by changing the visible layer of its skin. |

Progress Creature remains an Original Creature and is not duplicated as an alternative.

### Personality

| Source component | Living alternative | Functional anatomy and verb |
| --- | --- | --- |
| Magnetic Word | Letter Worm | Its letter segments scatter under resistance and reconnect in order. |
| Timezone Orbit | Orbit Pet | Its satellite orbits a body whose state represents place and local time. |
| Pasted Tag | Sticker Slug | Lifts and peels the label as part of its back. |
| Discovery Die | Dice Armadillo | Curls into a die, rolls, and unfolds on the selected route. |

Pixel Guest and Mood Tile remain Original Creatures and are not duplicated as alternatives.

## Living-System Rules

1. **Anatomy carries meaning.** The body must encode the value, control, progress, direction, or payload. A face alone is not a transformation.
2. **One primary verb per creature.** Each alternative gets a recognizable physical action that is not reused as its defining behavior elsewhere.
3. **Expressions report state.** Eyes and mouths may communicate anticipation, work, success, empty state, or error, but not arbitrary decoration.
4. **Footprints are stable.** The alternative uses the same slot count and external dimensions as its source.
5. **Accents are configurable.** Each creature accepts a `--accent` custom property so a toolbar page can provide its own highlight color.
6. **Motion is finite.** Continuous motion is limited to subtle, infrequent idle breathing where useful. Functional animations always settle.
7. **The result remains legible without motion.** Labels, values, control roles, and final states never depend on watching the animation.

## Motion Grammar

Interactive creatures use the state sequence:

`idle → anticipate → act → settle → idle`

The sequence is implemented through a `data-state` attribute. A component may skip an intermediate state when its action is very short, but it must always end in a stable state.

Motion differs by family:

- **Actions** use a short preparation, a decisive gesture, and visible confirmation.
- **Data** animate only the body part representing the changed value.
- **Navigation** preserve physical direction, order, and hierarchy.
- **Personality** may be more surprising, but reactions remain brief and non-blocking.

Typical functional motion lasts 450–1100 ms. Soft bodies use elastic deformation; shells and plates use heavier inertia; pixels and numerals use controlled stepped motion. Components may exceed the typical range only when the semantic journey requires it, such as a launch-and-return path, and must still prevent overlapping runs.

## Interaction State and Resilience

- A running component sets `data-busy="true"` and ignores additional activation until it settles, unless it is a stateful cyclic control designed to accept one discrete next state.
- Animation completion clears transient classes and busy state through `animationend` or `transitionend`.
- A duration-aware fallback timer restores the stable state if the expected event does not fire.
- Value changes and accessible-name changes occur in the same logical action.
- No component queues an unbounded sequence of animations.
- Decorative subparts use `pointer-events: none` so the interactive target remains stable.
- Every flying, rolling, stretching, or flipping part receives a dedicated internal safe area. SVG view boxes and internal wrappers must include the full motion envelope to prevent clipping.
- A controller failure leaves the card and its static control visible. One component's initialization must not prevent other components from mounting.

## Accessibility

- Interactive stages use native buttons or equivalent controls with correct roles and state attributes.
- Every action works with keyboard activation as well as pointer input.
- Focus indicators remain visible against each stage and accent color.
- Dynamic values update their `aria-label`, `aria-pressed`, or `aria-checked` state as appropriate.
- Information conveyed through expression or color is repeated in text or accessible state.
- Under `prefers-reduced-motion: reduce`, the control applies the final logical state immediately, suppresses decorative travel and deformation, and retains confirmation feedback.
- The Living Library mount point contains a static fallback summary and source mapping for use when JavaScript is unavailable. Interactive creature forms require JavaScript and are not presented as functional controls in that state.

## Implementation Boundaries

The existing prototype is intentionally isolated under:

`.superpowers/brainstorm/44547-1788275398/`

The new feature uses three focused files inside its `content` directory:

- `motion-playground.html` adds the navigation entry and Living Library mount point.
- `living-library.css` owns the section layout, creature anatomy, motion states, focus styling, responsive behavior, and reduced-motion rules.
- `living-library.js` owns the catalogue metadata, card rendering, filtering, source linking, interaction controllers, and shared state helpers.

The existing Component Library's inline implementation is not refactored as part of this work. The Living Library can reference existing visual tokens but does not depend on the original cards' internal markup or event handlers.

The JavaScript catalogue provides, at minimum, these fields per entry:

- stable component identifier;
- creature name;
- source component identifier and display name;
- category;
- slot footprint;
- accent;
- description;
- physical verb;
- renderer or template identifier;
- controller identifier.

Shared helpers manage busy state, motion completion, reduced-motion detection, accessible updates, and safe cleanup. Each creature controller handles only its own semantic state changes.

## Verification Strategy

Extend the existing Playwright suite rather than creating a second test harness.

### Structural coverage

- The Living Library exposes exactly 27 alternatives and four Original Creatures.
- Each alternative has a unique stable identifier and a valid source component.
- Category totals and filter results are correct.
- Every source link opens and focuses the matching original card.
- Slot footprints match their source components.

### Interaction coverage

- Run a smoke activation against all 27 alternatives and confirm each returns to a stable non-busy state.
- Add detailed behavioral assertions for at least one Action, Data, Navigation, and Personality alternative.
- Verify rapid repeated clicks do not create queues, duplicate values, or stranded transient states.
- Verify changed-value components animate or replace only the affected anatomy.
- Verify stateful controls update visible and accessible state together.

### Layout and visual coverage

- Check the full grid at desktop and mobile widths.
- Assert that interactive anatomy remains within its intended safe area during representative peak-motion frames.
- Check narrow digit, wing, antenna, shell, and rolling-creature cases for clipping.
- Confirm source links, filters, and focus indicators are usable at both widths.
- Perform a final visual inspection in the in-app browser.

### Accessibility and failure coverage

- Run the representative interactions with reduced motion enabled and assert immediate stable outcomes.
- Verify keyboard activation and focus visibility.
- Assert that the page has no uncaught JavaScript errors during the all-components smoke run.
- Confirm an intentionally failed controller mount does not prevent subsequent cards from initializing.

## Acceptance Criteria

The feature is complete when:

- `F · Living Library` is available beside the existing library.
- All 27 approved alternatives and four Original Creatures are present and filterable.
- Every alternative preserves its source component's function, category, footprint, and accessible result.
- All interactions terminate predictably and survive rapid repeated input.
- No representative animation clips at desktop or mobile sizes.
- Reduced-motion and keyboard behavior are verified.
- The existing Component Library remains unchanged in behavior.
- The full Playwright suite passes and the complete section has been visually inspected.
