---
"@chbrain/khai-tests": patch
---

The policy loaders find `khai-guard.config.json` above the content root.

`loadWorkPolicy(root)` and `scholarPolicy(root)` read the config from the
content root alone and returned empty policies when it was absent. Correct while
every house keeps its content beside its config; quietly wrong the day a house
takes khai's workspace shape, because the content root moves down into
`packages/<house>` and the config stays at the repository root, where the lanes
it declares live. From that day the house's canon list, its contrast and support
vocabulary and its scholar homonyms all silently become defaults -- loud
symptoms with the wrong diagnosis, since the namesake wall would report
declarations missing that sit one directory up, read by nothing.

So the config is resolved the way `instructions.mjs` already resolves an
installed package: walk up from the root until found (`findGuardConfig`, new,
exported). Nearest wins, as a whole file and never per key -- a package carrying
its own config keeps exactly that config, because a merged policy is a
computation no file on disk shows, and a maintainer reading the nearer file
would be reading the wrong policy. No config anywhere up the walk still means
the kit defaults, exactly as before; nothing changes for any house today, since
a config beside the content is found first.

Proven against the real case it exists for: khai-misfits' config against a
simulated `packages/khai-misfits` content root resolves all 32 canon works, the
3 supporting markers and the 81 declared surnames that the old loaders would
have replaced with defaults. This unblocks the misfits workspace migration.
