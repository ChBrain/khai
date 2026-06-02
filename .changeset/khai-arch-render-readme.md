---
"@chbrain/khai-arch": patch
---

Add `renderEngineReadme(pkg)`: the canon-owned generator for an engine's README.
The README becomes a generated pointer - title, tagline, the member files (from
the composition tree, root marked as the anchor), and where the real sources of
truth live (the manifest / WIRES card and REFERENCES.md) - never a second copy
of the card. Em/en-dashes in the tagline are normalized to the sanctioned
" - ". This is the first half of the engine-package docs standard; the kit will
regenerate-and-diff so a README can never drift from its manifest.
