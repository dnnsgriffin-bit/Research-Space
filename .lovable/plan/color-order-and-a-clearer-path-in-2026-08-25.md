# Color, order, and a clearer path in

Keep the Midnight Indigo identity, but make the site read as one numbered journey with far more colour and fewer neutral-grey lines.

## 1. Remove the grey vertical lines

The fixed 12-column grid overlay (`grid-lines`) behind every page is the source of the vertical grey rules. Remove that overlay from the root shell and delete the utility. The fine noise texture stays — it adds warmth without lines.

## 2. Colour throughout

- Replace neutral `border-border` hairlines on cards, list rows, and section eyebrows with tinted borders derived from the accent tokens (teal / clay / sage / plum at low alpha), so dividers read as colour rather than grey.
- Give each stage of the journey its own accent colour, used consistently on the home page, the nav number, and the step header inside the studio:
  1. Framework — teal
  2. Studio — indigo/navy
  3. Example — clay
  4. About — sage
- Add soft tinted section backgrounds (`--tint-*`) alternating down the home page so bands of colour separate sections instead of grey rules.
- Colour the evidence-state marks and label pills a touch more saturated so measured / assumed / unknown pop at a glance.

## 3. Filled, italic, accent "how do you know?"

In the hero headline, drop the outlined stroke treatment: render "how do you know?" as solid, italic display type in the accent colour (teal on the dark hero) with a subtle underline swash. Same for the footer wordmark — "Evidence Studio" becomes a filled, low-opacity accent-tinted display word instead of outline strokes.

## 4. Numbered order so users know where to go

- Nav order becomes: About, Framework, Example, Studio — with small step numerals (01–04) above each label, so the header itself is the map. The "Start an Experiment" button stays as the primary action on the right.
- Home page gets one dominant entry: a full-width numbered path strip (01 Understand → 02 Learn the framework → 03 See it worked → 04 Enter the studio) where each item is a link in its stage colour, ending in the large "Enter the Studio" call to action.
- Each page gets a matching coloured "Step 0X of 04" ribbon at the top plus a "Next: …" link at the bottom, so the order is unmistakable while browsing.
- Inside the studio, the existing 4 stages keep their numbers but pick up the same colour coding.

## Technical notes

- Files: `src/routes/__root.tsx` (remove grid overlay), `src/styles.css` (drop `grid-lines`, add stage colour tokens, tinted border utilities, filled-display utility replacing `stroke-text`), `src/components/site/SiteChrome.tsx` (nav order + numerals, footer wordmark, next-step ribbon component), `src/routes/index.tsx` (numbered path strip, colour bands, hero headline), and `about/framework/example/studio` routes for the step ribbon and next link.
- No changes to the reasoning engine, studio logic, or data.
