---
---

Tests for the per-package `changeset-check` view: the first-release rule (a package that has never been published must declare no bump) and the ships-nothing rule judged per package rather than against the repository root. Dormant via `describe.skipIf(DORMANT)` until the source lands, per the source/test-split rule. Ships nothing: tests are not in the package `files`.
