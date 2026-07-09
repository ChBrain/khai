---
"@chbrain/khai-tests": patch
---

Conformance: gate `registry.json` against build drift. The validator now rebuilds
the registry from source in memory (a new pure `computeRegistry`, factored out of
`buildRegistry`) and asserts the committed `registry.json` equals it — catching a
hand-edited or stale registry (a description that no longer matches its play's
frontmatter, a missing or reordered entry, a drifted version) at the content PR
instead of at release, where the `version` script's rebuild would otherwise expose
it. `buildRegistry` is unchanged in behaviour (it now calls `computeRegistry`, then
writes). The build stays the single writer of `registry.json`; a hand edit is a finding.
