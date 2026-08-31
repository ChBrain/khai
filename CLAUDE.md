# CLAUDE.md — khai monorepo

Claude-specific notes for this repository, and nothing else.

## Branch names

Claude offers a `claude/<something>` branch by default. This repo's lanes do not
include one, so the guard refuses it, and renaming afterwards costs a push. Do
not name a branch by hand at all: make the edits first and let the guard compute
the lane from the diff.

```
npx khai-guard branch <topic>
```

---

**Now read [AGENTS.md](AGENTS.md).** It is this repository's coding contract, it
is vendor agnostic, and it applies to you in full: voice first, then the lanes,
the hard rules, changesets and the gates. Nothing above replaces any of it.
