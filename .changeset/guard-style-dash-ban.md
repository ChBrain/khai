---
"@chbrain/khai-skills": patch
---

Add em-dash and en-dash to the khai-skills style denylist in `lib/guard.mjs`. The check runs via `validateNeutrality` on every text file in a skill bundle at pre-commit and CI, so a dash in any README or SKILL.md now blocks the commit rather than slipping through to a consumer surface.
