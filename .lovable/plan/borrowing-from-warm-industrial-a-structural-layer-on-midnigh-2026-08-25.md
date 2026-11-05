# Borrowing from "Warm Industrial" — a structural layer on Midnight Indigo

Yes — most of that system is usable, but not all of it. The parts worth taking are structural and textural (grid, noise, stroke type, clip reveals, status pulse). The parts to refuse are the ones that would undo the identity you already chose (warm gray #EBEBE8 background, Inter/Playfair, electric blue accent), plus a few that fight the product's seriousness.

## What to take

1. **12-column structural grid** — a fixed, full-page background layer of thin vertical rules at ~8% opacity, max-width 1600px, centered, sitting behind all content. This is the single highest-impact borrow: it makes the whole site read as engineered rather than decorated, and it costs nothing in legibility.
2. **Fractal-noise overlay at 0.04** — one fixed SVG-noise layer, pointer-events none, above the background and below content. Adds tactility to the indigo bands.
3. **Stroke text** — `-webkit-text-stroke` with transparent fill, used sparingly: one word in the hero headline and the oversized footer wordmark. Keeps huge type from turning into a wall.
4. **Clip-path reveal** — `inset(0 0 0 100%)` to `inset(0 0 0 0)` over 0.6s on the shared easing, applied to the Example project rows and the homepage proof strip so the "after" state wipes in rather than fades.
5. **Status pulse** — a 6px pulsing dot. Reuse it with meaning: green for *measured*, amber for *assumed*, violet for *unknown*, so it teaches state instead of just signalling "live".
6. **High-inertia easing** — standardise every transition on `cubic-bezier(0.16, 1, 0.3, 1)` as a single `--ease-out-expo` token.
7. **Technical readout labels** — 10px bold uppercase at 0.2em tracking for micro-labels; a tightening of the existing `label-xs`.
8. **Marquee ribbon** — one only, low-key, used for the evidence-chain link names so it reinforces the model. Slow, pausable, hidden under reduced-motion.

## What to skip, and why

- **The #EBEBE8 background and Zinc borders** — swapping to warm gray would discard the Midnight Indigo identity you picked. The grid, noise and stroke effects all work on indigo paper.
- **Inter + Playfair Display** — DM Serif Display already provides the editorial voice; Playfair would be a lateral move, and Inter is explicitly a default-AI look.
- **#0066FF electric blue** — you already have electric indigo `#4f46e5` as the single accent. Two blues would blur meaning.
- **8xl–10xl (128–160px) hero type** — too loud for an executive-facing analytical tool. Cap the hero around 4rem as it is now.
- **Grayscale project photography and cursor-following "View" circle** — this product has no photography, and the cursor circle reads as agency-portfolio rather than decision studio.

## Where each change lands

```text
__root.tsx      grid layer + noise overlay wrapping the app shell
styles.css      --ease-out-expo, .stroke-text, .grid-lines, .noise, .pulse-dot, tighter label-xs
index.tsx       stroke word in hero, clip-path proof reveal, one marquee ribbon
example.tsx     project-row hover with clip-path reveal + italic shift
ChainDiagram    state pulse dots on measured/assumed/unknown nodes
SiteChrome      header/footer aligned to the 12-column grid; footer stroke wordmark
```

## Technical notes

- Grid and noise are two fixed `aria-hidden` divs in `__root.tsx`, `pointer-events-none`, `z-0`; content sits above with `relative z-10`.
- Noise is an inline data-URI SVG `feTurbulence` — no image asset, no network request.
- All new values are tokens in `src/styles.css` (`@utility` for the effects); no hardcoded hex in TSX.
- Every animation is disabled under `prefers-reduced-motion`, including the marquee.
- No logic files touched: `studio-engine.ts`, `studio-logic.ts`, `transfer.ts` and the store are untouched.
