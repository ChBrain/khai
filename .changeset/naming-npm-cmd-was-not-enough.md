---
"@chbrain/khai-guard": patch
"@chbrain/khai-tests": patch
---

`npmBin` named `npm.cmd` on Windows and stopped there, and that was necessary
without being sufficient. Since the CVE-2024-27980 hardening (Node 18.20.2,
20.12.2, 21.7.3) `execFileSync` REFUSES to run a `.bat` or `.cmd` without
`shell: true` and throws EINVAL before the process starts, so the previous
release traded ENOENT for EINVAL and the walls still could not run.

`npmCommand(platform)` returns the binary and whether it needs a shell, and the
three call sites pass both.

The argument made against `shell: true` last time -- that it pushes arguments
through an interpreter and makes quoting a problem -- was true and beside the
point: without it the call does not execute at all on Windows. These arguments
are subcommands, flags and workspace package names, with no spaces and no shell
metacharacters.

Also: `.husky/pre-push` described `lockfile-check` as rejecting a nested lockfile
and nothing else, two releases after it grew the manifest-sync and platform
breadth checks. A reader debugging that wall went looking for a stray lockfile
that was never there.
