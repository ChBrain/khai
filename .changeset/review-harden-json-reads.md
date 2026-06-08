---
"@chbrain/khai-review": patch
---

The review CLI now upholds its "always exits 0" advisory contract on malformed
input. The manifest, target package.json, ledger, and decisions files were all
read with an unguarded JSON.parse, so a hand-edited or corrupt file threw an
uncaught exception that crashed main() with a non-zero exit — turning the
advisory lane into a hard gate. A malformed manifest now reports and exits 0, a
malformed target manifest is skipped, readJson returns its fallback on bad JSON,
and a top-level catch keeps any unexpected error from gating.
