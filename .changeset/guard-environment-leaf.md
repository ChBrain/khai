---
"@chbrain/khai-guard": minor
---

The environment report runs before `npm ci`, which is when it is asked for.
`npmSpawn` and `renderEnvironment` move to `environment.mjs`, a leaf that
imports nothing outside node, with a `reportEnvironment` that gathers the facts
and a main guard so `node packages/khai-guard/environment.mjs` works on a fresh
clone. `index.mjs` re-exports all three, so every existing import is unchanged,
and the CLI's `environment` subcommand now calls the shared one.
