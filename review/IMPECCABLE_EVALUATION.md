# Impeccable evaluation (November 5, 2026)

[Impeccable](https://github.com/pbakaus/impeccable) by Paul Bakaus is an open-source design skill for AI coding tools. Its deterministic detector (62 rules, no AI judgment) was run against the rendered landing page (`/`) and Evidence Check (`/check`).

It was **not installed into this repository**: no skill files and no edit hook. It was run with `npx impeccable detect` from a scratch folder.

## Results

| Rule | `/` before → after | `/check` before → after | Decision |
|---|---|---|---|
| Low contrast | 18 → **0** | 4 → **0** | **Fixed.** Unknown-link numbers and inactive demo steps now meet 4.5:1 |
| Undersized UI text (<11px) | 19 → **0** | 8 → **0** | **Fixed.** State labels, tags and plan notes raised to 11.5–12px |
| Tiny body text | — | 1 → **0** | **Fixed** |
| Side-tab accent (left stripe on rounded box) | 5 → **0** | — | **Fixed.** Introduced last round in the “What you’d see” boxes |
| Pulsing dot | 2 → **0** | — | **Fixed.** The badge dot is still; the “Live engine” dot pulses only during auto-play |
| Cream page background | — | 1 → **0** | **Fixed.** The dark pages now own the page background |
| Orphaned last word | 8 → 1 | — | **Fixed** with `text-wrap: pretty` |
| Italic serif display | 3 | 1 | **Kept.** The italic gold “Did work change?” is the brand line. The rule itself notes that editorial registers may legitimately use it. |
| Gradient text | 1 | — | **Kept.** It is part of the same brand line |
| Colored glow | 4 | 5 | **Kept.** The gold glow *means* “measured,” the product’s core visual language |
| Radial spotlight | 1 | — | **Kept.** A subtle glow behind the final call to action |
| Eyebrow labels above headings | 9 | 3 | **Open for discussion.** See below |
| Nested cards | 1 | 2 | **Kept.** The skeptical-review box and next-evidence box are deliberate emphasis |

**Totals:** `/` 71 → 20 findings · `/check` 25 → 11 findings. Every remaining finding is a deliberate identity choice.

## Verdict

- **Useful as a quality checker.** It found real legibility problems that three AI reviews had disagreed about, and it settled them objectively.
- **Risky as a style director.** About a third of its rules target exactly what defines this product’s look: the italic gold line, the glow that means “measured,” and the editorial section labels. Its steering commands (`bolder`, `quieter`, `overdrive` and others) should not be run on this design without a written brief that protects those elements.
- **Recommendation:** use `detect` as a regular check, with these identity rules acknowledged as exceptions. Use `shape` to plan new features. Skip the edit hook and the restyling commands.

## Open question: section labels

The detector flags every small uppercase label above a section heading (“How it works,” “Pricing,” “Questions”). There are 11 on the landing page. Several repeat what the heading already says. Trimming to the few that add meaning, such as “Made by a learning scientist,” would make the page feel less templated. This is a visible editorial change, so it waits for the owner’s decision.
