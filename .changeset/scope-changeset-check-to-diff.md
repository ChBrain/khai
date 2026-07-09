---
"@chbrain/khai-guard": patch
---

changeset-check: scope the releasing-changeset drift check to the changesets the
PR actually introduces or edits, not every file on disk. `main` legitimately
accumulates unconsumed releasing changesets between a release-carrying merge and
the "Version Packages" PR that consumes them; a leftover no longer falsely blocks
a docs/governance PR that ships no package `files`. The CLI now filters
`readChangesets()` to the added/modified changeset paths in the diff before the
check; the genuine "ships nothing but carries a releasing changeset" drift case
still fails.
