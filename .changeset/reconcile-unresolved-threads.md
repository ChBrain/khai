---
"@chbrain/khai-review": patch
---

reconcile now blocks a settled finding (accepted/transferred/reduced) whose
comment thread is still unresolved, as its docstring already promised. The
gate previously read only the treatment and resolution detail and ignored the
`resolved` flag the decisions carry, so a settled finding could pass with its
PR comment thread left open — weakening the "the conversation is the gate"
guarantee.
