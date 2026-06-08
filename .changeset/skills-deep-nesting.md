---
"@chbrain/khai-skills": patch
---

composeSkill now errors on a bundled reference nested more than one level deep
(e.g. references/sub/x.md). The cultures layout (and the agentskills "references
one level from SKILL.md" rule) only represents SKILL.md plus one flat content
subfolder; previously such a file was silently flattened by culturesLayout, with
only an advisory warning on deep links inside SKILL.md, never on the actual
bundled files. It is now a blocking conformance error.
