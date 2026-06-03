---
"@chbrain/khai-arch": patch
---

Add the first authoring template: `templates/template_process.md`, a fillable
skeleton aligned to the process IDLE chapters (Initiated by / Direction / Lever
/ Echo) with one-line guidance in each section. Expose a `templates` accessor on
the canon (keyed by type id) and ship the `templates/` dir. khai-tests proves
each template is a valid content instance.
