---
"@chbrain/khai-tests": patch
---

The registry gate's "missing registry.json" error now points at the generator
(`run khai-tests registry build`), so the (intended) hard requirement is
actionable rather than just stated. Behavior is unchanged: a playhouse without
a registry.json still fails.
