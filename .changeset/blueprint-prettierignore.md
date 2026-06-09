---
"@chbrain/khai-stage": patch
---

Ship a `.prettierignore` in the house blueprint. The audit workflow commits
machine-written `audit/*/log.md`, `ledger.json`, and `meta.json`; without an
ignore file, a house's `prettier --check` (the `test` gate) fails the moment the
audit bot writes a non-trivial finding. The blueprint now stamps a
`.prettierignore` (mirroring the khai monorepo) that excludes those generated
artifacts, and registers `.prettierignore` as a shared path in the house
`khai-guard.config.json` so it stays lane-neutral. Every newly raised house is
gated correctly from the start.
