---
"@chbrain/khai-tests": patch
---

Retire the Title -> Taxonomy migration tolerance: the kit goes strict. The
rename has landed end to end (canon, this kit's fixtures, the gender engine
content), so `validateContentFile` no longer accepts the legacy `Title`
spelling of a "TO \_\_\_" type's first slot -- the T slot is `Taxonomy`, the group
above, and `Title` is now drift. Drops the tolerance branch and flips the
guarded `toPrefix` fallback to `["Taxonomy", "Owner"]`. The kit's own fixtures
move to `## Taxonomy`, and a regression test pins the strictness (a persona
spelling the slot `Title` is rejected; `Taxonomy` passes). Stale "Title (T)"
comments are corrected. The orphaned `checkTitle` echo in khai-rules is left for
a separate follow-up.
