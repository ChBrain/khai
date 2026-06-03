---
"@chbrain/khai-arch": patch
---

Persona `type:` is now required. `frontmatterExtras(persona)` declares
`{ type: { values: [real, archetype, fictional], required: true } }`, so every
persona must state its real-world exposure class. The template and the kit's
fixture personas already declare it; a persona without `type:` now fails
validation ("missing required key: type").
