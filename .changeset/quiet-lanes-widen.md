---
---

Add the `rename/<name>/<topic>` lane: the one lane that may carry an engine and
the composites that link it, for a member rename and the relinks it forces.
Resolves the deadlock where neither half of a cross-lane rename can be committed
first. Ownership is unchanged — `engine/*/*` still may not touch a composite,
and a `rename/*` branch still may not touch another engine. Documentation and
config only.
