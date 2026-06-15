---
"@chbrain/khai-tests": patch
---

reviewer-assist: add `titleLeakAudit`, an audit-only check that flags source-language text leaking into an element's English `title:` (the source name belongs in `declared:`). It never warns, fails, or edits — a blanket `title === declared` rewrite would corrupt proper nouns, so it surfaces candidates for human triage in two buckets (a source-language marker in the title; or `title` equal to `declared`). Wired into `validateInstanceFile`/`validateProject` and exported for direct use.
