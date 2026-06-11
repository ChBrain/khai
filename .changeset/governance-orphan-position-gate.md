---
"@chbrain/khai-tests": patch
---

Add the orphan-position gate: a needed position without a persona is a failure.
`castErrors` groups position*\*.md and persona*\*.md per directory and flags any
position no persona links to (via its Taxonomy); wired into validateProject so
`khai-tests --project` enforces it. Makes the rule computed, not judged. The
reverse (a persona pointing at a missing position) stays covered by the link
check.
