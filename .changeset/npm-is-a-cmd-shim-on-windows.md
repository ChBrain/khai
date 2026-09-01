---
"@chbrain/khai-guard": patch
"@chbrain/khai-tests": patch
---

Three checks spawned `npm` by bare name, which is an executable on Linux and a
`.cmd` shim on Windows, so `execFileSync` threw ENOENT there: the packing suite,
the lockfile sync check and the drift check. On Windows `npm run gates` could not
finish, and the whole run read as a broken machine.

`npmBin(platform)` names the right binary, and takes the platform as a parameter
so both branches are testable from either one. A platform branch exercisable only
on the platform it is wrong about is how this lasts.

Not `shell: true`: that pushes every argument through a command interpreter and
makes quoting a problem this code does not otherwise have.

Reported from a Windows house, as an environment quirk. It was ours.
