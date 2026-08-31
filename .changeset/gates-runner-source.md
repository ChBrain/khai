---
"@chbrain/khai-tests": patch
---

`src/gates.mjs`, the house gates runner, lifted out of this repo's
`scripts/gates.mjs` so every khai house runs one runner instead of
hand-maintaining its own. khai-cultures built a second one from the same idea and
it drifted from that house's CI without anybody noticing (local 10/10 while CI
failed all ten jobs on `npm ci`), which is what two implementations of one rule
cost: two things to get wrong and only one of them read.

`loadGates` reads the walls a house declares in the `gates` key of its
khai-guard.config.json, through `findGuardConfig`'s walk-up, so the runner never
owns a second notion of where the config lives and a workspace-shaped house keeps
its walls where it keeps its lanes. `runGates` checks visibility first and STOPS
on it (a wall run against a tree the runner has said it cannot see produces an
answer that means nothing, and it means nothing expensively), records each wall
through the shell, and computes one verdict off the same records the counts come
from. `renderGates` is pure, prints the measured counts verbatim, names a record
it could not read rather than dropping it, and declares unconditionally that the
pass used the installed `node_modules` and not a fresh `npm ci` -- the sentence
that was missing from both logs.

It verifies and does not fix: a failing wall's `fix` is a string carried to the
reader, never a command the runner runs. Declaring no gates is a finding, not a
clean pass, because green on nothing is the failure mode a new house meets first.

`khai-tests gates [dir] [--content-root <path>]` is the CLI, and this repo now
adopts its own lift: the walls it used to hold in code are declared in
`khai-guard.config.json` and `scripts/gates.mjs` is the entry point and nothing
else.
