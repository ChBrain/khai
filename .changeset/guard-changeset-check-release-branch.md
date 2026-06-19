---
"@chbrain/khai-guard": patch
---

changeset-check: exempt the changesets release branch. The bot's "Version
Packages" PR (`changeset-release/<base>`) exists to consume changesets and bump
the version, so it carries none by design — the presence gate must not red it.
`runChangesetCheck` now resolves the branch (`--branch`, else `GITHUB_HEAD_REF`,
else git) and skips when it is the release branch, so every house is covered by
the guard itself without wiring a per-repo CI skip.
