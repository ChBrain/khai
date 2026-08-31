# CLAUDE.md, the {{SOURCE_TITLE}} house

**Read [AGENTS.md](AGENTS.md).** It is this house's coding contract, it is vendor
agnostic, and it applies to you in full: voice first, then branching, versioning,
authoring and the gates. Nothing here replaces any of it.

What follows is only what is specific to Claude.

## Branch names

Claude offers a `claude/<something>` branch by default. This house's lanes do not
include one, so the guard refuses it, and renaming afterwards costs a push. Do
not name a branch by hand at all; make the edits first and let the guard compute
the lane:

```
npx khai-guard branch <topic>
```
