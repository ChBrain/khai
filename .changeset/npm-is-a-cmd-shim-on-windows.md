---
"@chbrain/khai-guard": patch
"@chbrain/khai-tests": patch
---

Three checks spawned `npm` by bare name, which is an executable on Linux and a
`.cmd` shim on Windows, so `execFileSync` threw ENOENT there: the packing suite,
the lockfile sync check and the drift check. `npm run gates` could not finish on
Windows, and the run read as a broken machine.

`npmBin(platform)` names the right binary, taking the platform as a parameter so
both branches are testable from either one.

Two further defects the same report surfaced, both in the lockfile check:

`npmUnavailable(err)` separates npm refusing from npm never running. The check
caught every throw and read it as a lockfile mismatch, so an ENOENT surfaced as
"package-lock.json does not match the manifests (npm named no offender)". A wall
that says the wrong thing confidently sends the reader to fix the wrong thing --
here, to delete the lockfile and rebuild it.

`platformCoverage(lock)` refuses a lockfile that carries only one platform's
binaries. `rm package-lock.json && npm install` records only what resolves on the
machine running it: on Windows that took this repo from 47 os-constrained
packages across ten platforms to 3 across one, and `npm ci` on Linux then removed
its own binaries and exited 0. The sync check passes that by design, because npm
is asked whether it can install and it can.
