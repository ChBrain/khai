---
"@chbrain/khai-guard": patch
---

changeset-check: flag a releasing changeset that ships nothing. A PR whose
changed files are all outside the package's published `files` set, yet which
carries a changeset that declares a bump, would cut a release that republishes
identical content and drift the version (the spurious `0.<count>.1` patch a
REFERENCES/docs/tooling PR produces when it uses a `patch` changeset instead of
`--empty`). The CLI reads the package's `files` (normalized) and passes the
shipped set in; when `files` is absent the set is unknown and the rule stays off.
