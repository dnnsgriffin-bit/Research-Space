# Evidence Studio design framework (draft, November 13, 2026)

This describes the design the code actually has today, names its point of view, marks where it contradicts itself, and sets rules for what to add. Colors and numbers come from `src/styles.css` and `src/landing.css`. Nothing here changes the site; it is a proposal to react to.

## 1. Point of view

**Evidence under a lamp, then printed on paper.**

The product pages are a dark room (the "light table"). A link that was measured is lit gold. A link that was not measured stays dark. The output, the decision brief, is a sheet of warm paper laid on that table. That sequence is the whole idea: examine in the dark, take away something you can put in front of an executive.

| Quality | What it means here |
|---|---|
| Energy | Calm, unhurried, exact. Nothing bounces. |
| Tone | Forensic and editorial: a scientific journal meeting a lab instrument. |
| Attitude | Honest before impressive. The interface refuses to overclaim, and its look should refuse to oversell. |
| Words to design toward | Forensic, editorial, instrument-like, warm, quiet. |
| Words to avoid | Futuristic, playful, glossy, hyped, neon, "AI". |

## 2. The contradiction to resolve

The site is two design systems:

| | Product pages (`/`, `/check`) | Studio pages (`/studio`, `/example`, `/framework`, `/about`) |
|---|---|---|
| Surface | Dark `#0a0d10` | Warm ivory `#F8F6F0` |
| Display type | Instrument Serif | DM Serif Display |
| Body type | IBM Plex Sans, IBM Plex Mono labels | Source Sans 3 |
| "Measured" color | Gold `#f2c66d` | Forest `#14594C` |
| "Assumed" color | Sky `#93b4cc` | Muted amber |
| "Unknown" color | Grey `#69737c` | Quiet grey |
| Corners | Pills and 10 to 18 px | 2 px |

Same meanings, different colors and shapes. A visitor who clicks from the landing page into Framework feels they changed products. This is the first thing to fix, because it is cheaper and bigger than any new effect.

Suggested resolution: keep the dark room as the product, and make the Studio pages "the paper". They already are ivory. Give them the product's type pairing and one shared set of state colors (below), so they read as the printed half of the same idea.

## 3. Color system

### Roles, not swatches

| Role | Dark room | Paper | Use |
|---|---|---|---|
| Surface | `#0a0d10` void, `#11161b` panel, `#1b232a` raised | `#F8F6F0` ivory, `#fdfcf9` card | Backgrounds, in three steps each |
| Line | `rgba(255,255,255,.10)` | `oklch(.8878 .0093 92)` | One hairline, always 1 px |
| Text | `#ece7dc`, muted `#9ea7ae` | navy `#192132`, mid `oklch(.34 .029 264)` | Two text strengths only |
| **Measured** | Gold `#f2c66d` | Needs a darker ochre; gold on ivory fails contrast | The one color that carries meaning |
| **Assumed** | Sky `#93b4cc` | Muted amber `oklch(.59 .10 72)` today | State only |
| **Unknown** | Ash `#69737c` | Quiet grey | State only |
| **Barrier** | Coral `#ef8f74` | Brick `oklch(.49 .135 30)` | Caution only |

### Do you have an accent color?

Yes: gold, and it is a strong one. It is also the "measured" color, which is the site's most valuable idea. That makes gold a constraint as much as a brand:

- **Rule:** gold means measured, or it is the brand line, or it is the single primary button. It is never decoration. This is why the corner haze had to go.
- **Do not add a fifth hue.** You already have four (gold, sky, ash, coral). The feeling of "only two colors" comes from gold dominating. Adding more would dilute the meaning.
- **What to add instead:** depth inside the existing family.
  - Three golds: a pale highlight (text shine, `#f8dfa3`), the lamp (`#f2c66d`), and an ember (`#c9933a`, already used in the brand line gradient).
  - One more neutral on paper: a warm mid-grey for secondary labels.
  - A single ochre for "measured" on paper so the meaning survives on ivory.
- **Unify the state colors** across both halves of the site, then use only those four.

## 4. Type

| Role | Face | Notes |
|---|---|---|
| Display | Instrument Serif; italic gold = the brand line | Keep. It is the most distinctive thing on the site. Use on paper pages too, replacing DM Serif Display. |
| Body | IBM Plex Sans | Keep. |
| Instrument labels | IBM Plex Mono, small, uppercase, letter-spaced | Keep. These labels (`STEP 1`, `MEASURED`) are what make it feel like an instrument, not a SaaS page. |
| Numbers | Tabular figures everywhere a number appears | Not yet applied consistently. Small change, large "precision" effect. |

## 5. Texture and form

| Element | Today | Direction |
|---|---|---|
| Grain | 5% noise on the landing page only | Keep, subtle. Add to the tool page so the two match. |
| Paper | The brief is ivory inside the dark page | The signature surface. Use it for anything that is an output. |
| Lines | Hairlines; chain links use dotted (unknown), dashed (assumed), solid (measured) | Distinctive: meaning is carried by line style, not only color. Extend it to charts, legends and the film. |
| Glow | Gold glow on measured links | Only where something is measured. |
| Radius | Mixed: pills, 10 to 18 px, and 2 px on Studio pages | Choose one family. Recommendation: 2 px on paper, 12 px on dark panels, pills for buttons only. |

## 6. Motion

Today: one good easing (`cubic-bezier(.22,1,.36,1)`, 79 uses), but 18 plain `ease` and durations spread from 180 ms to 1.1 s, and 9 `transition: all` rules.

| Token | Value | Use |
|---|---|---|
| `--ease` | `cubic-bezier(.22,1,.36,1)` | Everything |
| `--dur-fast` | 150 to 180 ms | Hover, press |
| `--dur-base` | 250 ms | State changes, reveals |
| `--dur-slow` | 600 to 900 ms | Chain lighting, page-level reveals |
| Signature | The spark from a tick to the link it lights | The one motion that is yours. Keep it rare. |

Rules: animate transform and opacity (and color where meaning changes), never `all`; always honor reduced motion.

## 7. Hard no's for this site

- Ambient glows or gradients that don't come from something lit.
- Gold used for decoration.
- A new accent hue.
- Glass or blur under data or text.
- Playful or 3D elements, bouncy easing, scroll-jacking.
- Marketing superlatives and any impact or ROI claim in the interface.

## 8. What to look for in references (staying close, no rewrite)

Accept a reference if it shares at least three of these five. Fewer than three is a rabbit hole.

1. Serif display type paired with a clean sans or mono.
2. Dark, warm-neutral surfaces (not blue-black or purple-black).
3. One restrained accent that means something.
4. Motion tied to data or state change, not to decoration.
5. A paper, print or archive metaphor somewhere.

Categories that tend to fit: editorial data journalism and visual essays; research and archive sites; quiet analytics and finance tools; instrument-style product pages; museum and library sites. Categories to skip: neon developer-tool SaaS, aurora-gradient AI landing pages, agency sites built on heavy scroll animation.

In galleries, search tags such as: editorial, serif, dark mode, data visualization, archive, minimal, monochrome.
