---
"@chbrain/khai-arch": patch
---

Add Play (ENACTS) and move the playbook's structure into the canon.

- **play.md**: a new `house`-class type. ENACTS -- Estate, Name, Arc, Company,
  Triggers, Stakes -- the production that holds the plots: one Company they draw
  from, Triggers that chain them, an Arc they interweave on, and the Stakes they
  raise. Sits above Plot in the canon.
- **plot.md**: `class: system -> house`. Play and Plot are peers in `house`;
  "system" is retired as a classifier.
- **model.md** now owns the playbook spine: a `groups` block (production, cast,
  rests on, enriched by) that consumers render instead of re-declaring.
  `index.mjs` exports it as `playbook`.
- **\_schema.yml**: class enum `system -> house`; the mnemonic form is no longer
  tied to class (Play is `house` with a bare ENACTS).
