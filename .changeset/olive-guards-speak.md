---
"@chbrain/khai-guard": patch
---

Bring `member-check`'s own guidance into line with `CLAUDE.md` rule 7: a
colliding member stem is resolved by a distinct name, usually the field's own
compound term, and a `memberPolicy.homonyms` entry is the last resort and the
maintainer's call rather than a co-equal option. Message text only — the gate's
behaviour, verdict shape and exemption handling are unchanged.
