---
"@chbrain/khai-guard": patch
---

Give `changeset-check` a per-package view, and with it catch the first release that skips its own initial version.

`changesetCheck` judged the repository as a whole. Its shipped set came from `readShippedGlobs()`, which reads the **root** manifest — so in a monorepo whose workspace root is private and has no `files`, the set resolved to empty and the ships-nothing rule silently switched itself off. It has been off in khai for its whole life. The gate has no notion of which package a changed path belongs to, so it could not have been otherwise.

The new `packages` input is the workspace's own view of itself, one record per publishable package: the name a changeset names, that package's own shipped globs, and whether it has ever been released. Both per-package rules now judge the package the changeset actually names. When `packages` is empty the legacy root-only behaviour stands, so a single-package house is unchanged; the CLI resolves both shapes, a publishable root and an npm workspace.

That view makes a second rule computable. `changeset version` bumps **from** the version in `package.json`, so a package created at `0.1.0` that has never shipped and carries any releasing changeset is versioned to `0.1.1` and first published there: `0.1.0` never reaches the registry at all. A first release must declare no bump. The manifest version is the initial version, and `changeset publish` ships any package whose version is not yet on the registry without one. This was not hypothetical: 108 packages were queued to do exactly that, and 118 already had.

Release history is read from the package's `CHANGELOG.md`, which `changeset version` writes on the first bump and never removes: local, free and deterministic, with no registry call behind a pre-push hook. Absence alone is not enough to convict, because a house that has never cut a release has no CHANGELOG anywhere and every ordinary patch would be flagged. So it counts only where some sibling package **does** have one, which is what shows the house releases through changesets at all; a manifest added in the PR under judgement stands on its own, since a package cannot predate the PR that introduces it. Checked against the registry across a 235-package workspace: the local signal agrees on all 235, with no false positives and no false negatives.

A changeset naming a package the workspace does not know is left alone. The guard does not own that manifest and must not guess at it.
