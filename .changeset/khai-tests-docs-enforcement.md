---
"@chbrain/khai-tests": patch
---

Wire the engine docs standard into `validateEnginePackage` as an advisory lane.
`engineDocChecks(pkgDir)` runs the five doc-check atoms (clause-dash, link-text,
no-footer, frontmatter, loose-file) over a package's own `.md` files and
surfaces them as `warnings`, never `errors`: a downstream consumer is informed,
not failed, while the world migrates (the audit/warn level of the enforcement
model). `FileResult` gains an optional `warnings` field; the CLI prints them
with a `⚠` marker and never exits non-zero on them. Our own conformance suite
holds engines to zero warnings, so gender (already compliant) proves the wiring.
