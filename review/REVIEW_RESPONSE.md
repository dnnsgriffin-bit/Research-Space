# Response to the November 5 review

**Reviewed commit:** [`8cd996f`](https://github.com/dnnsgriffin-bit/research-space/commit/8cd996f6a06ac8bf2a542d31a81f24e952eefcef)
**Fix commit:** [`82285bc`](https://github.com/dnnsgriffin-bit/research-space/commit/82285bc) on `evidence-check-redesign`
**Self-assessed score:** 79.5 / 100, all gates passing (was 70.3 uncapped, 69 reported)
**Confidence:** Medium. This is the builder scoring their own fixes. Please treat it as a claim to verify, and re-run the original prompt with this file attached.

---

## 1. Findings reproduced on `8cd996f`

Each finding was checked by running the real rules module in a browser and inspecting the source.

| # | Finding | Status on `8cd996f` | What reproduced it |
|---|---|---|---|
| 1 | Brief turns selections into results | **Confirmed** | Quiz → “You can say people learned.” Metric only → “A business number moved.” Quiz + observation → “You can describe change on the job.” |
| 1b | *Not in the review:* wrong headline for confidence + workplace use + business metric | **Confirmed (new)** | Headline still said “participation and reactions”; decision said “Evidence runs along the chain” although Learning was only assumed |
| 2 | Example label missing from exports; edits drop it; own input matching a preset is labeled an example | **Confirmed** | `briefAsText()` had no provenance; label came from `matchPreset(measured)` |
| 3 | Reach headline overstates; pulse crosses assumed links | **Confirmed** | Default: “Your evidence describes the chain as far as Business outcome.” Later-measures case: pulse ran all 7 links with 1 measured run |
| 4 | “Cheapest” evidence; one “No” treated as settled | **Confirmed** | Heading “Cheapest next evidence”; decision “Fix the work conditions…” |
| 5 | Aggregator links; Hughes worded as causal | **Confirmed** | Consensus URLs; “explain about a third of transfer” |
| 6 | Phone legibility and contrast | **Partly addressed already** | Inspector crop had been fixed after the review images were captured. The table and the email-label contrast (3.22:1) were **confirmed**. |
| 7 | Video focus handoff; no text equivalent | **Confirmed** | Poster button replaced by `<video>` with no focus transfer |
| 8 | Auto-cycling hero without a pause control; live region announces auto-changes | **Confirmed** | `aria-live="polite"` updated every 5.2 seconds |
| 9 | Starting point keeps prior barrier answers | **Confirmed** | Preset only replaced `measured` |
| 10 | No direct path to the sample brief | **Confirmed** | Brief appeared only after the five-step scroll |

---

## 2. Changes made

| # | Behavior changed | Where | How it was verified |
|---|---|---|---|
| 1 | The brief separates **which measures exist** from results and contribution. Sentences now say “assessed,” “recorded” or “tracked.” Headlines say what is still open. A results note explains that values and a comparison are needed to report a result. | `buildCheckBrief()` in `src/lib/evidence-check.ts` | Matrix rows M1–M6 |
| 2 | Input origin is tracked on its own (`example`, `edited-example`, `own`), separate from which preset the ticks happen to match. The label appears on screen, in copy, in the copy fallback and in the downloaded file. | `InputOrigin`, `provenanceLabel()`, `EvidenceCheck.tsx` | M7, M8 |
| 3 | One `reachMessage()` drives the tool, the hero and the demo. It names the furthest **measured** link and, separately, the unknown or assumed links before it. Isolated measured nodes stay lit. The pulse switches to a blue “assumed” treatment whenever its path crosses an assumed link. | `reachMessage()`, `claimReach().measuredRun`, `EvidenceCheck.tsx`, `HeroChain.tsx`, `GuidedDemo.tsx` | M3b, M6 (rules and UI) |
| 4 | “Suggested next evidence” names the uncertainty each step addresses. A “No” produces a reported barrier and a verification step first. “Not sure” stays an uncertainty. The workplace-check timing is conditional on people having had real chances to apply the skill. | `buildCheckBrief()`, `briefAsText()` | M9 (rules and UI) |
| 5 | Research cards link to DOI or PubMed pages (each DOI checked against publisher records). Hughes is stated as “about 32% of the variance in transfer in the regression model.” Prototype design choices are listed separately from findings. Kirkpatrick levels are labeled as a rough cross-reference. | `Landing.tsx` `PAPERS`, `src/routes/check.tsx` `FINDINGS` | Automated link check |
| 6 | Each demo step has a plain-text “What you’d see” result, readable on phones and by screen readers. The comparison table stacks into labeled cards below 640px. Email field labels rose from 3.22:1 to 6.61:1 contrast. | `GuidedDemo.tsx`, `landing.css` | Widths 320, 390 and 768px under reduced motion |
| 7 | Activating the video moves focus into the player. A seven-step text transcript follows, linked with `aria-describedby`. The poster states “silent, captions on screen, example inputs.” | `VideoDemo()` in `Landing.tsx` | Keyboard test |
| 8 | A visible **Pause auto-play / Resume** control. The live region is `off` during auto-play and `polite` once the visitor takes control. Reduced motion disables cycling. Demo timers are cleared on every scene change. | `HeroChain.tsx`, `GuidedDemo.tsx` | Keyboard and live-region tests |
| 9 | Choosing a starting point replaces the measures **and** resets the work-condition answers, and says so on screen. “Blank slate” is your own input. | `pickPreset()` in `EvidenceCheck.tsx` | M10 |
| 10 | A **See a sample brief** button sits beside the hero actions. The sample shows its example inputs as a label. | `Landing.tsx` | Anchor test |
| — | Re-recorded both videos with example-labeled captions and corrected wording. Narration scripts were updated and trimmed to about 140 words per minute. | `public/demo/`, `screenshots/`, `review/NARRATION_SCRIPTS.md` | Frame review |

---

## 3. Verification matrix (47 of 47 passed on `82285bc`)

| Input or action | Result |
|---|---|
| Blank slate | ✅ “No measures selected”; a next step is given |
| Completion + satisfaction | ✅ Participation and reactions; skill, use and impact unestablished |
| Completion + quiz, no results | ✅ “Knowledge or skill was assessed”; a gain is unestablished |
| Business metric only | ✅ “A business metric is tracked. Nothing selected links it to the training”; direction and contribution unestablished |
| Quiz + workplace observation | ✅ Assessed and observed; change is still open |
| Confidence + workplace + outcome | ✅ Self-rating kept distinct; no “runs along the chain”; pulse flagged as assumed |
| Default example, then one measure edited | ✅ “Example inputs (…), edited” on screen, in the clipboard, the copy fallback and the download |
| Blank, then ticks matching a preset | ✅ “Your own selections”; the preset is not shown as pressed |
| Manager support No, then Not sure | ✅ Verification step, then uncertainty; decision updates |
| Starting point after a barrier | ✅ Answers reset; barrier cleared |
| Keyboard, both routes | ✅ Hero tabs (arrow keys), pause control, sample-brief link, FAQ, video (focus moves into the player), chain nodes (Enter, then Escape returns focus), measures (Space), conditions (Enter), visible focus outline |
| Reduced motion at 320, 390 and 768px, both routes | ✅ No horizontal scroll; result text, reach and brief visible |
| Console | ✅ No errors |

The 26-check regression suite from the earlier build also passes, including Studio inputs surviving use of the landing page and the tool.

**Not verified:** a screen reader with real assistive technology; smoothness on real phones; cold-load timing on a slow network; a session with a practitioner using sanitized data.

---

## 4. Rescore (same weights and gates)

| Category | Weight | Review → now | Points | Evidence |
|---|---:|---:|---:|---|
| Visual craft | 20 | 4.0 → **4.0** | 16.0 | **Observed.** Unchanged style; phone demo now pairs each mock with readable text ([07](images/07-guided-demo-on-phone.jpg)) |
| Interaction and motion | 10 | 3.5 → **4.0** | 8.0 | **Observed in tests.** Pulse meaning matches the states; pause control; reduced-motion end states. Device smoothness **unverified**. |
| Usability and IA | 15 | 4.0 → **4.0** | 12.0 | **Observed.** Direct sample-brief link and predictable starting points. The walkthrough is still long. |
| Creativity | 10 | 4.0 → **4.0** | 8.0 | Unchanged |
| Content and copy | 10 | 3.5 → **4.0** | 8.0 | **Observed.** Reach headline and brief now say the same thing in every view ([04](images/04-tool-first-screen.jpg), [05](images/05-tool-desktop-part2.jpg)) |
| Evidence integrity | 15 | 2.5 → **4.0** | 12.0 | **Observed.** Matrix M1–M6 and M9. Not 4.5: the older Studio pages still use some earlier wording, and the check can’t yet take actual values. |
| Trust and readiness | 8 | 3.5 → **4.0** | 6.4 | **Observed.** Provenance in every export; primary-source links |
| Accessibility | 7 | 3.0 → **4.0** | 5.6 | **Observed in automated tests.** No real screen-reader session yet. |
| Responsive and performance | 5 | 3.0 → **3.5** | 3.5 | **Observed.** 320, 390 and 768px pass. Runtime performance **unverified**. |
| **Total** | **100** | | **79.5** | **Strong**, close to the world-class band |

| Gate | Now | Evidence |
|---|---|---|
| G1 Claims stay within evidence | **Pass** | Matrix M1–M6; no result wording in headlines, decisions or allowed claims |
| G2 Examples are labeled | **Pass** | M7 and M8; demo brief, email, video captions, poster and sample brief all labeled |
| G3 Keyboard access | **Pass (automated)** | All primary flows by keyboard with visible focus. A manual screen-reader pass is still recommended. |
| G4 Readable contrast | **Pass on measured elements** | Email labels 6.61:1; result text 15.97:1; muted text 7.97:1; provenance pill 8.72:1. Full rendered-contrast audit not done. |
| G5 Honest status | **Pass** | Unchanged |

---

## 5. Still open

1. **A practitioner session with sanitized data.** This is the real test of whether the brief improves what people say or measure.
2. **Let users enter values.** For example, “the quiz average was 78%, the baseline was 64%.” Then the brief could report a result honestly instead of only noting that a measure exists.
3. **Bring the older Studio pages’ wording in line** (for example “cheapest useful step” in `studio-engine.ts`).
4. **A manual screen-reader pass** (VoiceOver and NVDA) and a real-device motion check.
5. **The “ideas to consider” in the review**, especially showing one claim sharpen as each input is added. This fits the product well and is a natural next build.
