---
"@chbrain/khai-tour": patch
---

Exclude the Playwright wiring guide from every tour. `findFiles` now drops
`playwright_instructions.md` at the single chokepoint every tour path funnels
through, so no collection glob can leak the guide into a deployed bundle. The
guide is dev-steering (it explains an engine's model so a Playwright wires it),
not runtime content, and never goes on tour.
