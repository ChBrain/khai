---
---

Cover the config walk-up: dormant tests. Eight cases for a `guard-config.mjs`
that does not exist yet; the source follows.

The class: a house that takes khai's workspace shape moves its content root down
into `packages/<house>`, and `khai-guard.config.json` stays at the repository
root, because lanes are a repository-level fact. `loadWorkPolicy(root)` and
`scholarPolicy(root)` read the config from the content root alone and return
empty policies when it is absent -- so the day a house migrates, its canon list,
its contrast and support vocabulary and its homonym declarations all silently
become defaults. The misfits house documents this exact shape from the other
side: a vocabulary declared where nothing reads it is indistinguishable from a
vocabulary nobody has used.

The cases that carry the design: nearest wins as a WHOLE FILE, never key-level
inheritance, since a merged policy is a computation no file on disk shows; no
config anywhere still means the kit defaults, not an error; and both public
loaders are exercised through the walk, not just the helper, because the loaders
are what a migrating house actually calls.
