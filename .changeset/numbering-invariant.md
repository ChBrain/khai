---
"@chbrain/khai-tests": patch
---

Enforce the playhouse numbering invariant in `validatePlayhouseRegistry`: a
house's version minor must equal its play count (adding a play is a minor bump,
so the minor tracks the count). A drifted minor, a non-semver version, or a
non-zero major (which would reset the minor while the count keeps climbing) is
now an error rather than silent drift found downstream. Existing registry test
fixtures are aligned to the invariant (version 0.<count>.0).
