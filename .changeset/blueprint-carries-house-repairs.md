---
"@chbrain/khai-stage": patch
---

The blueprint disagreed with the guard it ships. Its contract said a play add
takes no changeset while `khai-guard changeset-check` requires a `minor` on any
count-driven add, and both content houses had converged on `minor` independently,
each documenting the `0.<count>.1` drift. Its manifest template had no `prepare`
script, so the pre-push hook it stamps was never installed by `npm ci`. Its
release workflow was still on changesets/action v1 with the old input names, the
failure two houses had already repaired with the same test. And every house it
raised points at `node_modules/@chbrain/khai-stage/conduct.md` without depending
on khai-stage, so the case law was unreachable from every house.

All four are repaired in the stamp, and the stamp now carries what the houses
built beside them: a declared `gates` list run by one script and by the pre-push
hook after a lockfile check, a `countDrivenAdd` policy with the CI job that reads
it, `.changeset/**` as a rider, `.gitattributes` forcing LF, `.claude/` ignored,
current pins, and a stamped test that holds `registry.json` to a fresh build and
the management core to the installed blueprint. Two kit house checks are wired
dormant and wake on the kit bump that exports them.
