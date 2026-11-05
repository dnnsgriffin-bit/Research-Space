# Add colour, contrast and life — Midnight Indigo edition

The structure and logic stay exactly as they are. This is a visual and interaction pass: a new colour identity, real typographic character, an editorial homepage composition, and moderate motion.

## How to decide colour and taste (short answer)

Three rules I'll apply throughout, so the result reads as deliberate rather than decorated:

1. **One dominant, one accent, one alert.** Deep indigo carries the page, electric indigo carries action and emphasis, and a warm signal colour is reserved for caution. Nothing else competes.
2. **Colour must mean something.** In this product the natural meaning is evidence state — measured, assumed, unknown. Each gets one fixed hue used everywhere it appears, so colour teaches instead of just decorating.
3. **Contrast comes from surface, not from more hues.** Alternating dark and light bands creates visual interest without adding a fourth colour.

## 1. Colour identity: Midnight Indigo

New OKLCH tokens in `src/styles.css`, replacing the ivory/navy/teal palette:

- Ink `#0a0a1a`, deep surface `#141432`, mid indigo `#1e1e5a`, electric accent `#4f46e5`
- Light-mode paper stays warm-neutral so long reads remain comfortable; dark indigo is used for hero, section bands, the chain diagram and the brief.
- Evidence states get fixed hues: measured = green-teal, assumed = amber, unknown = muted violet. Applied consistently in the chain, evidence labels, matrix and brief.
- Accent used sparingly: primary buttons, active step, selected chain node, focus rings, gradient rules.

## 2. Typography: DM Serif Display + Fira Sans

- Loaded via `<link>` in `src/routes/__root.tsx`, registered as `--font-display` / `--font-sans` tokens.
- DM Serif Display for h1/h2 and pull-quote-scale statements; Fira Sans for body, labels and UI.
- Keeps the existing uppercase micro-label treatment, now in Fira Sans with tighter tracking.

## 3. Homepage: magazine composition

Recomposed `src/routes/index.tsx` (same content, new arrangement):

```text
[ dark indigo hero: oversized serif promise | live chain visual ]
[ featured proof story — Northstar before/after, large left column ]
[ supporting grid: who it's for (3) + how it works (3) ]
[ light band: the chain, with the transfer break highlighted ]
[ closing call to action on indigo ]
```

- Hero sits on the dark indigo with a subtle gradient veil and hairline texture.
- The proof story becomes the visual centrepiece: large serif claim, struck-through "claim you wanted", accented "claim the evidence supports".
- Section bands alternate paper / tinted / indigo so the page never runs flat.

## 4. Interactivity (level 3 — noticeable, not busy)

- Chain diagram: hover raises a node, shows its state colour and a one-line tooltip; the weakest link pulses once on entry.
- Scroll reveals: sections fade and rise 12px on first view, staggered, disabled under reduced-motion.
- Homepage proof strip: a small toggle switches between "what was claimed" and "what the evidence supports", animating the difference.
- Studio: animated stage progress bar, smooth cross-fade between stages, collapsible "Show the reasoning" panels with height transitions.
- Buttons and cards get accent-tinted hover and press states.

## 5. Consistency pass

Framework, Example, About and all studio steps updated to the new tokens and type scale so nothing looks left behind. Chart/state colours updated in the same pass.

## Technical notes

- All colour changes are token-level in `src/styles.css` (`:root`, `.dark`, `@theme inline`); components consume semantic classes only — no hardcoded hex in TSX.
- Fonts loaded with a `<link>` in `__root.tsx`; never `@import`ed in CSS.
- Motion via CSS transitions and a small IntersectionObserver reveal hook — no new animation dependency.
- No changes to `studio-engine.ts`, `studio-logic.ts`, `transfer.ts`, the store, or the route set.
