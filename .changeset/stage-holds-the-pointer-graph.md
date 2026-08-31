---
"@chbrain/khai-stage": patch
---

conduct.md's prescriptive references to `CLAUDE.md` name `AGENTS.md`, and say
where quirks live rather than folding them into the contract. The one historical
reference (`GEMINI.md` was 31 lines against `CLAUDE.md`'s 308) is untouched:
repointing it would falsify a measurement.

The README names what the stamper actually lays now, and `stage.test.mjs` gains a
wall for the shape rather than the file names: every vendor file must point at
`AGENTS.md` and at no other vendor, and `README.md` must carry the pointer too.
Presence was already asserted; the direction of the pointers was not, and the
direction is the property that keeps one tool from owning the house's contract.
