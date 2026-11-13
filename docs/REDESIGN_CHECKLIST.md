# Redesign checklist

Source of truth for the design is `docs/DESIGN_FRAMEWORK.md`. This file only says what to do, in order. Read the framework first; do not re-decide anything it already decides.

**Status:** DRAFT, derived from the framework on November 13, 2026. Edit freely; a session should treat the list as authoritative once you are happy with it.

## How to work a phase

- Do the steps in order. One step = one commit (`redesign: step N <short name>`).
- Before each step, re-read the framework section it cites. After each, tick the box and add one line under **Notes** if anything surprised you.
- Do not add a new accent hue, glow, glass, bouncy easing or a smooth-scroll library (framework section 7).
- Verify visually: run the app and check `/`, `/check`, `/studio`, `/example`, `/framework`, `/about` at desktop and phone width, with reduced motion on and off.
- If a step needs a design decision the framework does not make, stop and ask rather than guess.

Suggested model: **Sonnet 5.5 for Phase 1** (mechanical, well-specified). **Opus 5.5 for Phase 2** (design judgment, signature moments).

---

## Phase 1: Unify the system (mechanical)

Goal: the dark product pages and the ivory Studio pages read as one product. Cheapest, biggest win (framework section 2).

- [x] **1. Inventory.** List every color, font, radius, easing, duration and `transition: all` in `src/styles.css` and `src/landing.css`. Write the counts to Notes. No code changes. (Sections 2, 6)
- [x] **2. Token layer.** Define one set of CSS variables: the four state colors (measured, assumed, unknown, barrier) for both dark and paper, three surface steps each, one hairline, two text strengths, the three golds, and the motion tokens `--ease`, `--ease-swap`, `--dur-fast`, `--dur-base`, `--dur-slow`. Values come from framework sections 3 and 6. (Sections 3, 6)
- [x] **3. Paper ochre.** Choose and test one ochre for "measured" on ivory that passes contrast (gold `#f2c66d` fails on `#F8F6F0`). Record the chosen value and its contrast ratio in Notes. (Section 3)
- [x] **4. Type unification.** Replace DM Serif Display and Source Sans 3 on the Studio pages with Instrument Serif and IBM Plex Sans; keep IBM Plex Mono for instrument labels. Remove the unused font imports. (Section 4)
- [x] **5. Apply state colors.** Point every Studio page component (`src/components/studio/*`) at the shared state tokens so measured, assumed and unknown mean the same thing everywhere. Check `EvidenceLabel`, `EvidenceChain`, `ChainDiagram`, `BriefPreview`. (Sections 2, 3)
- [x] **6. Radius family.** Apply one family: 2 px on paper, 12 px on dark panels, pills for buttons only. (Section 5)
- [x] **7. Motion cleanup.** Replace the 18 plain `ease` uses and all 9 `transition: all` rules with the tokens; animate transform and opacity (and color where meaning changes) only. Confirm reduced motion replaces movement with an instant change or a short fade. (Section 6)
- [x] **8. Tabular figures and grain.** Apply tabular numerals wherever a number appears. Add the 5% grain to the tool page (`/check`) to match the landing page. (Sections 4, 5)

**Phase 1 exit check:** click landing, check, studio, example, framework, about in order. Nothing should feel like a different product. Write a short before/after note in Notes.

### STOP: model switch gate

When steps 1 to 8 are ticked and the exit check is written up, **stop working. Do not start step 9.** Commit, then tell the user, in these words or close to them:

> Phase 1 is done. Switch the model to Opus 5.5 in the model picker, then start Phase 2 (steps 9 to 15) of docs/REDESIGN_CHECKLIST.md.

If you are running on Sonnet and reach step 9 for any reason, treat it as this same gate. The reverse also holds: a session on Opus should not redo Phase 1 steps that are already ticked.

Before starting Phase 1, check the git log: some of it may already be done (for example `Warm the dark palette and apply the framework's motion rules` touches steps 7 and 9). Tick what is genuinely done, verify it against the step text, and do only the rest.

---

## Phase 2: Signature moments (design judgment)

> **Model check on entry (Opus 5.5 required).** Before step 9, tell the user: "Phase 2 needs Opus 5.5. Please confirm the model picker is set to Opus 5.5 before I continue." If you are not running on Opus 5.5, stop here and wait. Do not begin step 9 on Sonnet.

Goal: add the few things that are distinctive, each tied to data or state, borrowing one element per reference (framework section 9). Do these only after Phase 1 is done.

- [ ] **9. Warm the void.** Test moving the dark surface from `#0a0d10` toward a warmer value (for example `#0d0c0b`). Compare screenshots side by side; decide, then update the token. (Section 9, open question)
- [ ] **10. Emphasis by dimming.** In quotes and headlines, drop the payoff phrase to lower contrast instead of coloring it, so gold stays reserved for "measured". (Hebbia, section 9)
- [ ] **11. Proof as type.** Add big serif numbers with small mono labels beneath for the proof section; large serif quotes from named people only if real ones exist. Do not invent quotes or impact/ROI claims. (Hebbia and Harvey, sections 7, 9)
- [ ] **12. Evidence-chain signature.** In the evidence-chain section only: raw records that come together into a readable document as you scroll, with one accent phrase in the headline. Motion limited to transform and opacity. (Clinia, section 9)
- [ ] **13. Dark room to paper.** Make the move from the dark page to the ivory decision brief read as one brand: a card that expands into the full view, then a print reveal for the brief. (Harvey, section 6 vocabulary)
- [ ] **14. Data motion.** Numbers that count up when a value becomes measured; lines that draw from a flat baseline when a metric appears; the spark from a tick to the link it lights, kept rare. Extend line styles (dotted, dashed, solid) to charts, legends and any film. (Sections 5, 6)
- [ ] **15. Final audit.** Run through section 7 (hard no's) and section 6 rules line by line against the finished site. Check contrast, reduced motion, phone width, and that no glow appears except on measured links. List anything left undone in Notes.

---

## Notes

**Phase 1 (done on Sonnet 5.5, November 13, 2026).**

- **Step 1, inventory.** Across `styles.css` and `landing.css`: 63 distinct hex, 33 oklch and 66 rgba values; 9 radii besides pills and circles (6 to 22 px); 3 cubic-beziers on the dark side, one more (`.45,0,.2,1`) on landing; about 55 transition durations. Already fixed by an earlier commit: all nine `transition: all`, the warm void (`#0d0c0a`), and the `--ec-*` motion tokens. The framework's "18 plain ease" was mostly `var(--ec-ease)`; only `ease-out` once and two infinite `ease-in-out` loops were really plain.
- **Step 2, tokens.** One set now lives in `:root` in `styles.css`: `--ease`, `--ease-swap`, `--dur-fast/base/slow`, `--gold-shine/lamp/ember`, `--state-measured/assumed/unknown/barrier`, `--r-paper/panel/field`. The `--ec-*` motion tokens in `landing.css` are aliases of them. The duplicate `.ec` token block in `styles.css` is removed, so `/check` now uses the landing values (differences of 1 to 2% in a few greys and alphas).
- **Step 3, paper ochre.** Measured on paper is `oklch(0.50 0.09 78)`, 5.6:1 on ivory (gold `#f2c66d` is 1.5:1). Assumed on paper is now sky, `oklch(0.50 0.06 240)`, 5.5:1, because the old amber failed contrast (3.9:1) and sat too close to the ochre. Unknown stays grey (4.8:1), barrier stays brick (6.1:1). Computed with the script in the session scratchpad, not a browser.
- **Step 4, type.** `--font-sans` is IBM Plex Sans, `--font-display` is Instrument Serif, and a new `--font-mono` (IBM Plex Mono) now drives `label-xs`. DM Serif Display and Source Sans 3 are gone from CSS and from the Google Fonts link; Plex Sans 700 added for the one `font-bold`.
- **Step 5, state colors.** Only the state tokens changed (`--evidence`, `--plum` and `--state-*`), so the 38 measured uses and the chain follow automatically. `--clay` and `--tint-clay` are kept for "moderate", "fragile" and cost; they are not states. The two assumed callouts in `/example` use the new `--tint-assumed`.
- **Step 6, radius.** Dark panels 12 px, fields and segmented controls 8 px, paper surfaces inside dark pages (`.ec-brief`, `.gd-brief`, `.l-paper*`) 2 px. The Studio pages already derive from `--radius: 2px`, so no change there.
- **Step 7, motion.** 79 `transition` durations mapped to 150 / 300 / 600 ms (those over 1 s and all keyframe animations left alone, since the intro is choreographed with delays). The one plain `ease-out` is now the shared curve.
- **Step 8, figures and grain.** `tabular-nums` on `body` and `.ec`. The landing grain layer is now also mounted on `/check`.

**Not verified in a browser.** The local `node_modules` cannot run the app (`vite dev` fails on a TanStack `#tanstack-router-entry` import and `vite build` cannot resolve `react`), so the phase 1 exit check (click through all six pages, phone width, reduced motion) is still open. What was checked: the CSS compiles with Tailwind, and every `var(--...)` used is defined (the only unresolved ones are set at runtime by Radix or JS).

**Flagged for later (not changed).**

- `.ec-stage::before` is a drifting gold and sky haze that runs forever (`ec-drift`, 18 s). Framework section 7 forbids ambient glow, so this is a step 15 candidate.
- `.hc-dot.playing` uses a green (`#7fd1a0`) glow that pulses. It is a fifth hue; decide in step 15.
- The Studio accent (`--teal`, forest) is still in use for links, focus rings and the primary button. The framework says "do not add a fifth hue", so Phase 2 should decide whether it becomes navy or ochre.
- Step 9 (warm the void) was already done by the earlier commit `50ca139`; Phase 2 only needs to compare and confirm it.
