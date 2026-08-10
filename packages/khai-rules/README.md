# @chbrain/khai-rules

The pure, canon-agnostic validation mechanism for khai content — the rule
atoms and the minimal markdown parser they run on.

Every checker takes its contract as an argument and imports **nothing** from
the canon. A rule that needs a type's chapters receives them; it does not know
that "persona" exists. This keeps the dependency graph acyclic: `khai-arch`
(the canon) and `khai-tests` (the conformance kit) both depend _down_ into
here, and nothing here depends back up.

```
khai-rules     → gray-matter            how to check (pure)
khai-arch      → gray-matter, khai-rules the canon; self-validates via khai-rules
khai-tests     → khai-rules, khai-arch   pulls the contract from arch, feeds it to rules
```

## What's here

- `rules.mjs` — rule atoms. Each takes parsed input (and, where needed, a
  contract) and returns a list of error strings; empty means pass.
- `voice.mjs` — `checkVoice`, the text-level half of the CVI (the house writing
  rules: the em dash, the en dash, brackets in prose, first person singular,
  supplicant phrasing, sentence length, the doubled space) as one
  markdown-aware atom, plus `proseLines`, the masked prose view it runs on.
- `parse.mjs` — `parseDoc` (frontmatter + header tree), `sectionBody` and
  `fencedLines`.

`checkVoice` follows the same contract-as-argument rule as everything else, and
takes it one step further: **every voice rule is off unless the caller switches
it on**, so `checkVoice(text)` returns `[]` for any input. khai's own content
does not conform to the CVI, and an atom does not get to decide that it should.

## What's not here

The wiring that _pulls the contract from the canon and composes the atoms_
lives in `khai-tests` (`validate.mjs`). The judged, model-graded checks live
in `khai-review`. This package is mechanism only.

The visual half of the CVI (palette, type scale, page structure) is not
portable and stays in the website repo. Only the text-level rules — the ones
computable from the bytes of a markdown file — live here.
