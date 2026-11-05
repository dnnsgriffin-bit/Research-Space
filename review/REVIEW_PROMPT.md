# Prompt for an AI design review of Evidence Studio

Copy everything inside the box below into ChatGPT, Argon, Claude or any other model. It works best with a model that can browse the web and view images.

---

```text
You are an expert review panel evaluating a product website before public launch. Act as five specialists, then combine your findings:

1. A design-award juror (Awwwards / CSS Design Awards caliber) judging visual craft, motion and originality.
2. A senior UX researcher applying Nielsen's 10 heuristics and running task-based walkthroughs.
3. A learning scientist expert in training evaluation and transfer (Kirkpatrick, LTEM, Brinkerhoff's Success Case Method, Baldwin & Ford, Blume et al.).
4. A corporate buyer: a VP of Talent or Chief Learning Officer at a global company, plus their CFO.
5. An accessibility auditor (WCAG 2.2 AA).

THE PRODUCT
Evidence Studio is a prototype decision-support tool for corporate learning and development (L&D) teams. Its central question is "Training was completed. Did work change?" A user ticks the training measures they actually have (completion, satisfaction, quiz, observed behavior, business metric and so on). A seven-link "evidence chain" then lights up only where something was observed, showing how far an honest claim can reach. The user checks four work-environment barriers (opportunity, manager support, time, tools) and receives a one-page decision brief: what they can say, what they can't say yet, the cheapest next evidence, a suggested next decision for leaders, and a "skeptical review" question. It uses transparent, research-based rules. It does NOT predict impact or calculate ROI, and it is deliberately free while in prototype.

Creator: Dennis Griffin, Ed.D., a learning scientist and L&D leader. Audience: L&D practitioners, L&D and talent leaders, executives, and consultants.

MATERIALS (all public)
- Review hub with every image, video link and the rubric:
  https://github.com/dnnsgriffin-bit/research-space/blob/evidence-check-redesign/review/README.md
- Scoring rubric (use this exactly):
  https://github.com/dnnsgriffin-bit/research-space/blob/evidence-check-redesign/review/RUBRIC.md
- Screenshots (open each one):
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/01-landing-first-screen.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/02-landing-desktop-part1.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/02-landing-desktop-part2.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/02-landing-desktop-part3.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/02-landing-desktop-part4.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/02-landing-desktop-part5.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/03-landing-phone-part1.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/03-landing-phone-part2.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/04-tool-first-screen.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/05-tool-desktop-part1.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/05-tool-desktop-part2.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/06-guided-demo-five-steps.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/07-guided-demo-on-phone.jpg
  https://raw.githubusercontent.com/dnnsgriffin-bit/research-space/evidence-check-redesign/review/images/08-demo-video-frames.jpg
- Source code (React/TypeScript), if you can read code:
  https://github.com/dnnsgriffin-bit/research-space/tree/evidence-check-redesign/src
- Live interactive preview, if you can run JavaScript and the owner has shared it:
  https://claude.ai/artifact/BkRiasthCe11fzU1okZxL9

Note: full-page screenshots were captured with reduced motion on, so scroll-driven animations appear in their final state. The guided demo is a scroll-driven animation; image 06 shows its five steps, and image 08 shows frames from the 45-second product video.

YOUR TASKS (do all of them, in order)

Task 1. Five-second test. Look only at 01-landing-first-screen.jpg. In three bullets: what is this, who is it for, and what should I do next? Then say whether the page communicated that.

Task 2. Persona walkthroughs. For each persona below, walk through the materials and report what worked, where they hesitated, and whether they would take the next step:
  a) An L&D practitioner with completion and survey data and a stakeholder asking "did it work?"
  b) A VP of Talent deciding whether to scale a leadership program.
  c) A CFO with 30 seconds.
  d) A learning scientist checking accuracy.
  e) A design-award juror.
  f) A keyboard-only or low-vision user (judge from the screenshots and code).

Task 3. Heuristic review. Apply Nielsen's 10 heuristics to the landing page and the tool. List violations, each with its location.

Task 4. Evidence integrity check. Find any wording, visual or flow that could make a reader believe the tool proves impact, predicts results or calculates ROI. Check that measured, assumed and unknown are always distinguishable without relying on color alone.

Task 5. Score with the rubric. Fill in the full scorecard from RUBRIC.md: 9 categories, gates, total, band and confidence. Cite evidence for every score and mark it Observed or Inferred.

Task 6. Top 10 issues, ranked. A table with these columns: #, Issue, Where (screen or image), Severity (Critical / High / Medium / Low), Evidence, Recommended fix, Effort (S / M / L).

Task 7. Quick wins. Five changes that would raise the score the most for the least effort.

Task 8. Bold ideas. Three ideas that would make this a true award contender without undermining its credibility with executives. For each, explain why it fits this specific product.

Task 9. Benchmark. Name 3–5 real, existing websites or products this should be compared with. Say what each does better, and what Evidence Studio does better. Only name sites you are confident exist.

Task 10. Verdict. In under 100 words: is this world class? What single change matters most?

RULES
- Be candid and specific. Don't inflate scores to be encouraging; award juries reject most entries.
- Say clearly what you could not verify (for example, if you could not run the live preview) and lower your confidence.
- Don't recommend fake testimonials, invented statistics or claims the tool can't support.
- Use plain language and tables where they help.
```
