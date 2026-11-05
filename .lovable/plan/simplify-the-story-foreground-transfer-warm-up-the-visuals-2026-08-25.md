# Simplify the story, foreground transfer, warm up the visuals

Three changes, none of which touch the reasoning engine: a clearer homepage promise, a shorter studio flow, and a richer but still restrained visual layer. Plus a proper treatment of learning transfer, which is currently buried inside the chain and the sandbox.

## 1. Homepage: one promise, one proof, one door

Replace the current multi-module explainer with a tighter sequence:

- **Hero** — a single sentence promise: *"Most training claims fall apart under one question: how do you know? This studio helps you answer it — and shows where the learning actually fails to transfer."* One primary action (Start the studio), one secondary (See a worked example).
- **The 30-second proof** — a compact before/after strip from the Northstar case: the claim a team wanted to make, the claim the evidence actually supports, and the one test that would close the gap. This is the "is this for me" moment.
- **The chain, framed as a transfer story** — keep the existing diagram but label it as *where the chain breaks*, with the transfer link visually emphasised as the most common break point.
- **Who this is for** — three short lines (L&D / talent leaders, research and OE, executives approving spend). No feature grid.
- **One "how it works" row** — three steps, not six modules.

Everything else currently on the homepage (framework depth, evidence label glossary, module inventory) moves to `/framework`, which stays as the deep read for people who want it.

## 2. Studio flow: six steps become four

The six steps stay as logic but collapse into four visible stages, so the progress bar reads as a decision, not a curriculum:

```text
1. Context      (learner context + the "is this even a learning problem?" check)
2. Design       (intervention builder + scenario comparison)
3. Evidence     (measurement reality check + what you can/cannot say)
4. Decide       (pilot design + executive brief, brief shown first)
```

- Context and the learning-problem check merge into one screen.
- Intervention and Sandbox merge into "Design" with the comparison shown alongside the builder rather than after it.
- Pilot and Brief merge into "Decide", with the brief at the top and the recommended next test below it as the action.
- Each stage gets a one-line plain-language subtitle stating what the user walks away with.
- Advanced panels (11-dimension table, judgment notes, evidence matrix detail) become collapsible "Show the reasoning" disclosures — present, not in the way.

## 3. Learning transfer as a first-class theme

Transfer currently exists only as a chain node and a scoring dimension. Add a dedicated **Transfer Conditions** block inside the Design stage that makes it explicit and deterministic:

- Five conditions scored from existing context and intervention inputs: opportunity to apply, timing/proximity to real work, manager reinforcement, workload headroom, and social/peer support.
- Each shows a qualitative band and the specific input driving it — no invented numbers.
- A "transfer risk" summary sentence naming the weakest condition, plus one design move that would address it and the tradeoff that move costs.
- The Evidence stage gains a transfer-specific claim rule: with no post-event behaviour, usage, or observation data, transfer is explicitly listed under "what you cannot say yet".
- The executive brief gains a single transfer line: the condition most likely to break and what would prove otherwise.

## 4. Visual treatment: warmer, more colour, still senior

Keep the existing typography and layout discipline. Add:

- An expanded accent range built on the current navy/teal/sage tokens plus a warm clay/amber for caution and a deeper plum for "unknown", all as OKLCH tokens in `src/styles.css` — no hardcoded colours in components.
- Soft tinted section surfaces so the page alternates rather than running as one ivory sheet.
- Colour-coded evidence states applied consistently: measured, assumed, unknown each get a stable hue used in the chain, the labels, the matrix, and the brief.
- Subtle gradient rules and a hairline texture on the hero only; no glow, no glass.
- Chain diagram gets state-coloured connectors so the break point is visible at a glance.

## Technical notes

- No changes to `studio-engine.ts` scoring logic; transfer conditions derive from existing context and intervention state via a new pure helper.
- Step components are re-composed, not rewritten: `StepContext` + the learning-problem panel, `StepIntervention` + `StepSandbox`, `StepPilot` + `StepBrief`. The store keeps its current shape.
- New tokens added to `@theme inline` in `src/styles.css`; components consume semantic classes only.
- Route set is unchanged (`/`, `/studio`, `/framework`, `/example`, `/about`); the studio step index shifts from 6 to 4.
