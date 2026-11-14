# Hiring-panel review prompt (Claude, ChatGPT, Gemini, Copilot)

This prompt asks a model to review Evidence Studio the way a hiring panel would: as evidence of what its creator can do, not only as a product. It complements `REVIEW_PROMPT.md`, which is a design-award review of the product itself.

## Before you send it

1. **Publish first.** The prompt points at the live site, `https://evidence-studio-lab.lovable.app`. It must show the November 13 redesign (dark room and paper pages with one type system, ochre "measured", navy accent, orientation bands, the Studio that keeps work in the browser).
2. **Refresh the screenshots.** Most models cannot click through the interactive tool, so they rely on images. After publishing, capture the set listed under "Review pack" into `review/images/panel/` and push it. The old `review/images/` set shows the previous design and must not be used.
3. **Screenshot links are filled in.** They point at `https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel` (captured November 14 from the live site). If you recapture, keep the same file names.

## How to run it

Send the **same prompt, unchanged**, to each model, in a fresh conversation:

| Model | Setting |
|---|---|
| Claude | Turn on web search; attach the screenshots too if the links don't open |
| ChatGPT | Use the strongest model with reasoning and web search on |
| Gemini | Use the strongest model; attach the screenshots if links don't open |
| Copilot | Use its deeper reasoning mode. It shares model families with ChatGPT, so treat it as a fourth opinion, not a fully independent one |

Save each full answer as `review/panel/claude.md`, `chatgpt.md`, `gemini.md` and `copilot.md`. The merge is done from the **FIX LIST** tables at the end of each answer: a fix raised by three or four models is treated as real; one raised by a single model is checked before acting on it.

## Review pack (capture after publishing)

Desktop at 1440 px wide and phone at 390 px, reduced motion off unless noted:

1. `01-landing-hero.jpg`: first screen of `/`
2. `02-landing-full.jpg`: whole landing page (reduced motion on, so reveals show their final state)
3. `03-landing-phone.jpg`: landing page on phone
4. `04-check-first-visit.jpg`: `/check` on a first visit, with the "Start here" note
5. `05-check-own-data.jpg`: `/check` after changing the ticks and answering one barrier "No"
6. `06-check-brief.jpg`: the full brief at the bottom of `/check`
7. `07-example-top.jpg`: `/example` first screen with its orientation band
8. `08-example-chain.jpg`: `/example` with one chain link open in the inspector
9. `09-studio-top.jpg`: `/studio` first screen with its guide open
10. `10-studio-brief.jpg`: `/studio` final stage, with the worked example prefilled
11. `11-framework.jpg`, `12-about.jpg`: first screens

---

## The prompt

```text
You are a hiring panel reviewing a portfolio piece. The piece is a working product website, Evidence Studio, built by the candidate. Judge two things: the product, and what it shows about the candidate as a senior learning leader. Be candid. A polite review is useless to the candidate.

THE ROLE BEING HIRED FOR
Senior Director / Head of Learning Effectiveness and Measurement at a large organization. The role sets how the company decides whether learning programs work, advises executives on learning investment, and leads a team of learning scientists, designers and analysts.

THE CANDIDATE
Dennis Griffin, Ed.D., a learning scientist and L&D leader. Learn about him only from the site itself (its About page and footer). Do not search for or use other personal information.

THE PRODUCT
Evidence Studio is a free prototype for corporate L&D teams. Its question: "Training was completed. Did work change?" Pages:
- / : landing page (dark design).
- /check : the Evidence Check, a two-minute tool. You tick the measures you actually have; a seven-link evidence chain lights only where something was measured; you answer four workplace-barrier questions; you get a one-page decision brief.
- /example : a fictional worked case (Northstar Services) followed through Diagnose, Design, Test and Decide.
- /studio : a longer workspace for your own program, ending in a fuller decision brief. Work is kept in the visitor's browser only.
- /framework and /about.
It uses transparent rules and deliberately does not predict impact or calculate ROI.

MATERIALS
- Live site: https://evidence-studio-lab.lovable.app (open every page above if you can).
- Screenshots, because the tool is interactive and you may not be able to click it:
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/01-landing-hero.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/02-landing-full.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/03-landing-phone.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/04-check-first-visit.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/05-check-own-data.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/06-check-brief.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/07-example-top.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/08-example-chain.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/09-studio-top.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/10-studio-brief.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/11-framework.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/Research-Space/evidence-check-redesign/review/images/panel/12-about.jpg
First, state plainly which pages and images you could actually open. Do not describe anything you could not see. Mark every finding Observed (you saw it) or Inferred (you are reasoning from indirect evidence).

THE PANEL
Review in this order. Each persona works independently and does not repeat the others.

1. RECRUITER / TALENT ACQUISITION PARTNER (the first gate)
   Spends about 90 seconds. Decides whether the hiring manager ever sees this.
   Asks: In one sentence, who is this person and what level are they? Can I pitch them from this?

2. HIRING MANAGER: SENIOR DIRECTOR OF L&D
   Owns the hire and the team.
   Asks: Would I trust this person in front of my VP? Does this show judgment, or just skill?

3. PEER: SENIOR LEARNING SCIENTIST / PRACTITIONER
   Same level as the candidate. Checks the method.
   Asks: Is the evidence chain sound? Are research claims used accurately? Does anything overclaim, or underclaim to the point of being unhelpful?

4. VP OF TALENT (the executive the decision brief is written for)
   Also speaks for HR partners who bring business problems to L&D.
   Asks: Would this change a budget or program decision I make? Is the brief decision-ready?

5. L&D OPERATIONS / LEARNING TECHNOLOGY LEADER
   Would have to run this across many programs.
   Asks: Where would the data come from? What would adoption take? What breaks at scale? Is privacy handled sensibly?

6. UX RESEARCH AND INSIGHTS LEADER (outside L&D)
   A senior researcher from another field. Judges the craft without L&D's assumptions.
   Asks: Can a first-time visitor tell what to do on each page? Is the information architecture clear? Is the research thinking rigorous? Accessibility?

7. RED TEAM / CONTRARIAN (outside the panel; goes last)
   Dislikes everything on principle and has read the other six.
   Asks: What is the weakest claim? What would a skeptic screenshot? Why wouldn't a team just use a survey and a spreadsheet? Which praise above is too generous?

FOR EACH PERSONA, GIVE
- First impression (2–3 sentences, in their voice).
- Scores, 1–5, on: Clarity, Credibility, Usefulness, Craft, and Signal about the candidate. One line of evidence per score.
- Top 3 strengths (specific, with page and location).
- Top 3 fixes: the problem, where it is (page and section, quoting the exact text where possible), why it matters to this persona, and the fix.
- The one question they would ask the candidate in the interview.
- Verdict: ADVANCE, HOLD or PASS, with one sentence why. (The red team gives its verdict on the product, not the candidate.)

THEN, AS THE PANEL TOGETHER
A. Consensus: where three or more personas agree.
B. Disagreements: where personas split, and which side you find stronger.
C. Panel decision on the candidate: ADVANCE, HOLD or PASS, and the single change to the site that would most improve the decision.
D. FIX LIST: one table merging every fix, most important first, with exactly these columns:
   ID (F1, F2, ...) | Page | Location / quoted text | Problem | Fix | Raised by (persona numbers) | Severity (Critical / High / Medium / Low) | Effort (S / M / L)

RULES
- Be specific: page, section, quoted words. "Improve clarity" is not a finding.
- Do not invent features, testimonials, statistics or results, and do not recommend adding fake ones.
- The tool deliberately refuses to predict impact or calculate ROI. You may argue that this is the wrong choice, but do not penalize it for failing to do something it states it will not do without saying why that matters to the persona.
- Separate taste from problems: say when a point is a preference.
- Plain language. Tables where they help. No praise padding.
```
