---
"@chbrain/khai-tests": patch
---

registry build: source a play's `description` from its frontmatter (the
English-facing logline the canon already permits) instead of the first `## Arc`
paragraph. The Arc (the declared-language synopsis the book reads) stays the
fallback when no frontmatter description is authored, so a house keeps building
while its plays adopt the field. This lets `registry.json` be English while the
play files stay in their declared language.
