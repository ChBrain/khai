---
"@chbrain/khai-arch": patch
---

Add authoring templates for the element types under `templates/`, one fillable
skeleton per type, each a valid content instance (proven by khai-tests). Section
guidance is friction-first: every chapter carries a self-test, and relational
sections add a modeling checkpoint ("link it where it already has a file; where
it does not, ask whether it should use a khai type"). Expose a `templates`
accessor on the canon (keyed by type id) and ship the `templates/` dir.
