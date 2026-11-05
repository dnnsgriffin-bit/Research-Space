# A taste pass: "The Editor" — refining Midnight Indigo

Keep everything that exists — navigation, numbered journey, stage colors, studio logic, transfer engine. This is a pure craft pass that takes the current palette and typography from "good" to "distinctive," borrowing from editorial data-storytelling sites (The Ken, serious research journals) rather than SaaS dashboards.

## The taste rules being applied

1. **Typography does the heavy lifting.** One oversized serif statement per page; everything else steps back.
2. **Color is rationed.** The stage colors and evidence-state colors already carry meaning; the pass removes competing tints rather than adding new ones.
3. **Whitespace is the luxury.** More air around dense panels so the studio reads as calm, not crowded.

## Changes

### 1. Typography scale
- Increase the gap between display and body sizes: hero and section headlines grow (~15–25%), body text stays at its current comfortable size.
- Give `label-xs` micro-labels slightly wider tracking and consistent casing across all pages.
- Pull-quote treatment for one key sentence per page (About, Framework, Example) — large italic serif with a teal left rule.

### 2. Surface and spacing rhythm
- Standardize vertical rhythm: every section band gets the same top/bottom padding scale so pages feel composed, not assembled.
- Increase inner padding on dense studio panels (Reality matrix, Sandbox comparison, Brief) — the "text too close together" fix applied everywhere, not just the chain diagram.
- Alternate band backgrounds more decisively: paper → tinted → deep indigo, so the eye always knows where one idea ends.

### 3. Restraint pass on borders and tints
- Audit tinted borders: keep stage-color left rules and ribbons, but quiet the low-alpha tinted hairlines that currently compete on cards and rows — fewer, stronger lines.
- One shadow style only (the existing `lift`), applied consistently.

### 4. Interaction polish
- Chain diagram nodes: subtle accent underline sweep on hover, in addition to the existing lift.
- Numbered path strip on the homepage: the active/hovered step fills with its stage color.
- Keep all motion on the existing `--ease-out-expo` token and reduced-motion safe.

## What does not change

- No new pages, routes, or features. No logic changes (`studio-engine.ts`, `transfer.ts`, store untouched).
- Palette tokens stay Midnight Indigo; stage colors (plum/teal/clay/indigo) and evidence-state colors (measured/assumed/unknown) unchanged.
- Navigation order and numbered journey stay exactly as built.

## Technical notes

- Token-level edits in `src/styles.css` (type scale, spacing tokens); component-level edits in `SiteChrome.tsx`, `index.tsx`, stage routes, and studio step panels.
- Fonts already loaded via `<link>` in `__root.tsx` — no changes there.
- Verified with a browser screenshot pass over home, one stage page, and the studio.
