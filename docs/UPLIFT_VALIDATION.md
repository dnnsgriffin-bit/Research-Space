# Evidence Studio interface uplift

Reviewed and implemented 3 October 2026.

## Design decisions

Keep the homepage as the landing page. Give visitors an immediate, fictional decision to examine, followed by a short decision-brief preview. Preserve the warm ivory, forest and editorial typography. Use motion only for selection, disclosure and inspection, with reduced-motion support.

- Homepage: interactive conclusion exercise, optional case-specific evidence chain, expandable brief preview, deep forest Skeptical Review section and a smaller case image later in the page.
- Framework: definitions first, separate explanations of evidence state and provenance, and an optional concept chain with no inspector initially selected.
- Worked example: applied chain with observation labels, a three-design comparison with learner-time totals, and Diagnose / Design / Test / Decide phases.
- Studio: measured header offset, a concise decision summary, expandable supporting analysis, and a modal Skeptical Review ordered by risk. The review directs the practitioner back to the Reality check.
- Existing calculations, six workflow steps, fictional disclosures and claim limitations remain the basis of the experience. The homepage exercise does not modify Studio data.

## Completed validation

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit` passed.
- Targeted ESLint on changed TypeScript files: zero errors, seven Fast Refresh export warnings.
- Production client, SSR and Cloudflare-module build: `npm run build` passed. Build output includes plugin timing and module-directive warnings.
- `git diff --check`: no whitespace errors.
- Desktop homepage visually inspected in the browser.
- Homepage at a 390px viewport: document width and scroll width both 375px (15px browser scrollbar); no document-level horizontal overflow. Mobile menu opens and exposes all destinations.
- All three conclusion choices produced their respective feedback. The missing-link action opened the case chain.
- Transfer inspection showed case-specific observations. Escape closed the inspector and returned focus to the Transfer node.
- Entered a temporary working observation in Studio, navigated to the homepage, answered its exercise and returned to Studio: the observation was preserved. Removed the test text afterward.
- Loaded the fictional Northstar example, opened Decide and inspected the revised brief and Skeptical Review. High-risk items appeared first, with the first item expanded and the remaining items collapsed.

## Verification limits

The external browser connection became intermittent during final QA. Do not treat this record as confirmation of a complete keyboard audit, mobile review of every route, print/download testing, or a verified Lovable deployment. Reduced-motion and print behavior were reviewed in source. Sync and publishing status must be reported separately from local build success.
