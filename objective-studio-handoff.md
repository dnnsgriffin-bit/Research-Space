# Objective Studio: handoff for the next Claude session

Prepared 14 Nov 2026 for Dennis Griffin, Ed.D. Paste this whole file into a new Claude chat (or attach it) and say what you want to work on next.

## 1. What this is

Objective Studio is a **portfolio-first** L&D product that shows Dennis can design and build learning tools. Tagline: **"A climbing gym for thinking."**

| Part | Job | Where |
|---|---|---|
| **Landing** | Front door: interactive Bloom's climbing wall, live four-part checker, 20-sec demo | `/` |
| **Studio** | Desktop work tool: AI drafts objectives → rubric → assessment; you edit and decide | `/studio` |
| **Gym** | Phone-friendly practice: 5-rep sessions climbing Bloom's levels 2→6 from a 40-rep bank | `/gym` |
| **Tour** | Native, silent 20-second looping product tour plus a short practice challenge | `/tour` |

The big idea (the "loop"): the Studio notices what your objectives miss, the Gym practices it, and the session sends you back to fix real work.

## 2. Where everything lives

- **Live site:** https://design-my-objective.lovable.app
- **Lovable project:** "Objective Craft", project ID `1cd11375-3d05-4b2e-8a62-9361c0709ba8`, workspace `cfavnR7g3PyzeH9w919Z`. Editor: https://lovable.dev/projects/1cd11375-3d05-4b2e-8a62-9361c0709ba8
- **Latest commit seen:** `1b1c143` ("Add project README", 13 Nov). The last feature commit was `c8dd9ce` (12 Nov).
- **GitHub:** no repo for this project is visible to Claude sessions (checked 14 Nov). The README mentions GitHub sync, so if Dennis connects one, add it to the session and work in code directly.
- **Stack:** TanStack Start (React and Vite), Tailwind and shadcn. AI calls go through the Lovable AI gateway to `google/gemini-2.5-flash`.

### Key files in the Lovable project
| File | What it does |
|---|---|
| `public/home.html`, `public/gym.html` | Standalone pages served raw by `src/routes/index.tsx` and `gym.tsx` (`?raw` import). Edited in Lovable since the original copy, so Lovable's versions are now the source of truth. |
| `src/routes/studio.tsx`, `src/routes/tour.tsx` | The Studio app and the tour |
| `src/lib/objectives.server.ts`, `src/lib/rubric.server.ts` | **AI system prompts. Don't change without Dennis's OK.** |
| `src/lib/studio-ux.ts` | Rule-based A/B/C/D checker, `GYM_URL`, `DATA_NOTE`, trust rules (has tests) |
| `src/lib/moments.ts` | One-shot "grab + chalk puff" motion |
| `src/components/hold-marker.tsx`, `results-panel.tsx`, `global-header.tsx` | Hold markers, route wall and summary, shared navigation |
| `DESIGN.md`, `PRODUCT.md`, `.impeccable/critique/…` | Written by the Impeccable design skill on 12 Nov, including a baseline critique of the Studio |
| `AGENTS.md`, `roadmap.md` | Lovable's agent rules and the completed-work checklist |
| `README.md` | **Out of date:** it's the original August brief (parchment and serif look). See open items. |

### Claude artifacts (private unless shared)
- Design system (tokens and rules): https://claude.ai/artifact/Rqvt84jEWMEq7TTTwvKHrC
- Design directions (why "Bouldering" won): https://claude.ai/artifact/35btu1yXrT8ZfnS8KoiAbj
- October UX review (23 findings): https://claude.ai/artifact/9PurpPq79V5WYKmJkwAjGv
- "Graded by its own rubric" review: https://claude.ai/artifact/ByWbMGwJTysyXf7yNfDvcS
- Superseded first versions of the Gym and landing page: PALU4PkvuKp5SJAU4koovw, QEu8eTrP9oVUzq8H1LWdkH (use the live site instead)

## 3. Decisions already made (don't relitigate)

- **Direction "Bouldering":** Bloom's six levels are six climbing-hold colors, each always paired with its number. In order: 1 blue, 2 teal, 3 green, 4 yellow, 5 orange, 6 pink. Harder thinking is higher on the wall.
- **Type:** Archivo 800 at `font-stretch: 118%` for headings, Figtree for body, JetBrains Mono for numbers and tags. Sentence case, no all-caps.
- **Themes:** Studio is light by default; the Gym is dark ("night") by default.
- **Climbing language is light:** only in feedback and moments ("Sent it", "Not yet", "Session", "Rep", "Project"). Buttons and labels stay plain ("Level 5 · Evaluate", "Build rubric").
- **Motion:** 120ms press, 300ms feedback, 450ms maximum. Motion only confirms something happened. Reduced motion shows the end state. **No points, streaks, leagues, confetti or sound.**
- **Honesty rules:**
  - The data note says inputs go to an AI model.
  - Applied revisions show "Revised, not re-checked" and move to Review.
  - Summaries count the rule-based A/B/C/D check, not the AI's "Ready".
  - Never claim the Gym is personalized until it is.
- **Learning-science basis:** retrieval and spaced practice (Projects), confidence-before-answer (hypercorrection), the generation effect (sessions end with writing), elaborated feedback, constructive alignment, and self-determination theory (progress = competence).

## 4. What exists now

- **Landing:**
  - Interactive climbing wall with route lines and "Check this objective" samples
  - Live four-part checker
  - "Watch 20-sec demo" opens `/tour` in a dialog
  - Shared header (Studio, Gym, 20-sec tour, The science, About Dennis)
  - Links to www.DennisRGriffin.com
- **Gym:**
  - 40 reps in 8 workplace areas; each session pulls one rep per level, levels 2–6
  - "I'm sure / Not sure" before every check, with a calibration summary
  - Missed reps become Projects that return next session
  - A wall of 40 holds; progress is saved in the browser (`objective-gym-v1`)
- **Studio:**
  - Steps 1 Objectives → 2 Rubric → 3 Assessment
  - Live A/B/C/D chips; undo; Export menu; honest data note
  - Gym moments: send puff, route wall, "X of Y have all four parts" summary, Gym handoff card, "Route sent" finish
  - Source handoffs between steps
- **Videos:** a wide and a square 20-sec MP4 with music, for social and show-and-tell, not the site. They're in Lovable's Files, alongside `objective-studio-review-kit.md` (review prompt and a LinkedIn post draft).

## 5. Open items and known issues

1. **Confirm what's live.** Edits went in on 12–13 Nov; republish if the new header or `/tour` isn't on the live site.
2. **Verify `/studio` loads.** On 12 Nov, Lovable reported "Importing a module script failed" (blank screen); no fix commit is visible after it. It was probably a temporary preview error, but check.
3. **Rewrite `README.md`.** It describes the old August design. Replace it with a short current overview pointing to `DESIGN.md` and `PRODUCT.md`.
4. **Video URL.** The walkthrough videos show a made-up address, "objective-studio.app". Swap in design-my-objective.lovable.app before posting.
5. **Two design references.** The design-system artifact and `DESIGN.md` can drift apart. Pick one source of truth (the in-project `DESIGN.md` is easiest for Lovable).
6. **Gym isn't personalized yet.** The Studio's handoff card is generic. A natural next feature: `/gym?focus=degree` to weight reps toward the part most often missing.
7. **Projects return next session, not on a day schedule.** Real spaced practice would schedule them by days.
8. **Sharing:** claude.ai artifacts are private; share any you want public from their Share menu.

## 6. Suggested next steps (ranked)

1. Verify the live site end to end (ask Lovable to run Playwright on all four routes) and republish.
2. Run a 15-minute usability test with 3–5 instructional designers. Script: first objective set, quality review, rubric, Gym session.
3. Personalize the Gym from the Studio (the focus parameter in item 6).
4. Grow the rep bank and move Projects to day-based spacing.
5. Build a small MCP server or plug-in exposing the rule-based checker (`check_objective`, `suggest_verbs`), with each result linking back to the site.
6. Write a portfolio case study for www.DennisRGriffin.com: problem, decisions, evidence, before/after.

## 7. How to work on it

- **Lovable connector tools:**
  - `send_message`: use `wait=false` for long jobs, then poll `get_message`
  - `get_diff` and `read_file` to review what changed
  - `deploy_project` to publish
  - Each run costs credits, roughly 1–10.
- **Sandbox limit:** the Claude sandbox couldn't open `*.lovable.app` addresses. Verify through Lovable's screenshots, `get_diff`, or Lovable's own Playwright checks.
- **To copy a file into Lovable exactly:** upload it with `get_file_upload_url` plus an HTTP PUT. Ask Lovable to `cp` it unchanged and confirm its `sha256`.
- **Ask Dennis before:** changing AI prompts or the model, big credit spends, or deleting anything.
- **Dennis's preferences:** plain language, visual tables and comparisons, and a short "learning along the way" concept where it helps. Honest critique over cheerleading.
