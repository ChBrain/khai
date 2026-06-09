---
"@chbrain/khai-tests": patch
---

validate: gate a closed plan's targets against the canon verdict vocabulary.
Pull `planVerdicts` from @chbrain/khai-arch (guarded fallback `[x]`/`[F]`/`[?]`)
and, for a `status: closed` plan, flag any target mark outside that set (`[-]`,
`[W]`, ...) as an unresolved verdict. `[ ]` stays pending; draft/active plans are
not held to it; orders keep their existing completion check.
