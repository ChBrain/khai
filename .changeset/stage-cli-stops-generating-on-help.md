---
"@chbrain/khai-stage": patch
---

Three argument-parsing bugs in `khai-stage`, all of which reported success.

`--help` was unhandled, so it became the source name and raised a 54-file house
called `khai-plays---help` in the working directory. A generator whose help flag
generates is the one flag a stranger tries first.

`--anchor` was in the usage line and the file's own header and was never in the
flag map, so `khai-stage buechner --anchor process_` stamped the house into a
directory literally named `--anchor` and called the Theatre Manager `process_`.
It now reaches the manifest: a canon house stamped with `--anchor culture_`
declares `anchor: "culture_"` instead of the `play_` default.

An unknown flag fell through to the positional list and became the target
directory, so a typo stamped a house into a folder named after the typo. It is
now an error naming the option.

Every error path writes nothing.
