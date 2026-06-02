---
"@chbrain/khai-tests": patch
---

`engineDocChecks` now voice-checks the WIRES card prose too. The card lives in
`package.json` (JSON), outside the `.md` doc-checks, yet it is what the website
renders, so a dirty card (clause dash or em/en-dash) previously slipped through
and had to be caught by hand. It is now an advisory warning per chapter
(`package.json#card.<chapter>`), so "cards stay clean" is self-enforcing for
every engine instead of manual. Gender (already clean) stays at zero warnings.
