---
"@chbrain/khai-guard": patch
"@chbrain/khai-tests": patch
---

`lockfile-check` now asks whether the root lockfile still matches the manifests,
which is the question CI's `npm ci` asks at install and nobody asked before it.

The wall a house declares was already called `lockfile` and only hunted stray
nested ones, so a reader saw `ok lockfile` and concluded the lockfile was fine.
The check lands inside that command rather than beside it, so every house that
already declares the wall gets it with the version and edits nothing.

One direction only, and it says so: `npm ci` rejects a manifest dependency the
lock does not carry and ACCEPTS an extra lock entry no manifest names. Both were
run before this shipped.

khai-tests: the runner's standing "Not run" sentence claimed a lockfile mismatch
was invisible to the pass. For a house whose lockfile wall now asks, it is not,
so the sentence names the gap conditionally and keeps unconditional only what no
declared wall can see -- what a real install decides.
