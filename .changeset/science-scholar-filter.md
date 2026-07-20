---
"@chbrain/khai-tests": patch
---

Make the science index's `surnames()` a deterministic scholar filter. Strip parenthetical qualifiers (so `Brooks (communication)` keys to `Brooks`, not the tag), keep only tokens that begin with an uppercase letter (a scholar surname is a proper noun), and drop the one declared placeholder (`Practitioner`). This removes pseudo-scholars the old last-token rule manufactured from non-author Origin rows — honest-note phrases (`Boundary of the effect`), mechanism labels (`The individual calculus`), field markers and bare years — without a hand-maintained blocklist, and recovers real authors previously lost behind qualifier tags. Dropped rows still render verbatim in the by-unit section, so nothing is lost from the index.
