---
"@chbrain/khai-review": patch
---

The review CLI now discovers `.md` files recursively, so nested element files
(e.g. `plays/<id>/play_<id>.md`, nested `persona_*.md`) under a target are
reviewed too, not just the top-level ones. It used a flat `readdirSync(t.dir)`,
which skipped everything in subdirectories even though the voice-chain resolver
is built to walk nested paths. A finding is labelled by its path relative to
the target dir, so a top-level file keeps its bare-name id (no churn) while a
nested one is disambiguated. node_modules and dot dirs are skipped; order is
deterministic.
