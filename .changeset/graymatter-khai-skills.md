---
"@chbrain/khai-skills": patch
---

guard/build: frontmatter via js-yaml 4.2.0 instead of gray-matter

guard.mjs now exports parseFrontmatter (read) and stringifyFrontmatter (write)
built on js-yaml 4.2.0, and build.mjs uses them to read and stamp SKILL.md —
replacing gray-matter (matter / matter.stringify) and dropping its js-yaml 3.x
(exposed to the merge-key DoS GHSA-h67p-54hq-rp68). stringifyFrontmatter is
deterministic, so the stamped bundle hash stays stable. Self-contained;
behaviour unchanged.
