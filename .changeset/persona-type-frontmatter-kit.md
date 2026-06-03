---
"@chbrain/khai-rules": patch
"@chbrain/khai-tests": patch
---

Frontmatter: support per-type extra keys. `checkFrontmatter` now accepts an
`extra` map (key -> allowed enum) beyond the base `khai/license/stamp`, and
`validateContentFile` pulls it from the canon (`khaiArch.frontmatterExtras`,
guarded) per instance type. Backward-compatible: with no extras, behavior is
unchanged. This is the kit-side permission that lets the canon add persona's
`type:` (real/archetype/fictional) next.
