---
"@chbrain/khai-arch": patch
---

arch(play): split builder instructions out of the rendered coda

The play.md coda carried a mix of reader description and authoring
guidance ("a play carries no generic ## Owner or ## Taxonomy prefix ...
adding Owner or a Title back is not a fix but a break"). Builder
instructions belong in the template layer (never rendered), not in the
spec the website renders.

Rendered coda now matches the pattern every other type uses: pair labels

- "A [type] file succeeds when ...". The non-TO constraint and mnemonic
  discipline move to a trailing builder note in template_play.md.
