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
- `parse.mjs` — `parseDoc` (frontmatter + header tree) and `sectionBody`.

## What's not here

The wiring that _pulls the contract from the canon and composes the atoms_
lives in `khai-tests` (`validate.mjs`). The judged, model-graded checks live
in `khai-review`. This package is mechanism only.
