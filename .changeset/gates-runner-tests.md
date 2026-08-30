---
---

Dormant tests for `src/gates.mjs`, the house gates runner lifted out of this
repo's `scripts/gates.mjs` so every khai house runs one runner instead of
hand-maintaining its own. They pin `loadGates` (the wall manifest under the
`gates` key, resolved through `findGuardConfig`'s walk-up, so the runner never
owns a second notion of where the config lives), `runGates` (commands in,
records out, gates injected rather than read from a caller's real config) and
`renderGates` (pure: records in, paste block out).

Two findings the runner exists for are pinned as behaviour rather than prose.
**No gates declared is a finding, not a clean pass**: green on nothing is the
failure mode, and a house that calls the runner before declaring a manifest must
not hear that all its gates pass. **The block declares what it did not run**, at
minimum that it ran against the installed `node_modules` and not a fresh
`npm ci`, because the khai-cultures runner reported 10/10 while CI failed all ten
jobs on `npm ci` and no line of either log said "lockfile". Unconditional, not a
caller's option: a caller that forgets it loses exactly the sentence that was
missing.

Also pinned: a failing wall names its fix and the runner never executes it,
untracked paths under the content root are refused and stop the pass, an
unreadable record is named rather than dropped, and one verdict covers the whole
run. Tests only; they do not ship, and they skip until the source lands.
