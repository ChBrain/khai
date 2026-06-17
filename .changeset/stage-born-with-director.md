---
"@chbrain/khai-stage": patch
---

Stamp the Director into every house. The stage blueprint now carries
`position_director`, `plan_stage_the_score`, and a per-house
`persona_director.md.tmpl`; `index.mjs` fills the `{{DIRECTOR_*}}` tokens and
renames the persona per house (a new optional `director` arg, default `director`).
New and synced houses are born with the Director, matching the chain reference cast.
