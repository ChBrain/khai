---
"@chbrain/khai-tests": patch
---

Make playhouse registry build and verify consistent: verify now resolves the
playbook file with the same `play_*.md` discovery buildRegistry uses and applies
the same id title fallback, so a freshly built registry.json passes verification
even when a play's frontmatter omits `title`. buildRegistry now warns (without
failing) when an extracted blurb won't pass the verify gate, and normalizes
registry validation results to the standard errors/warnings/audit shape.
