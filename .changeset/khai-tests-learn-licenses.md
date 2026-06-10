---
"@chbrain/khai-tests": patch
---

The kit learns the canon's licence. `validateProject` now checks every content
instance's `license:` frontmatter against the licence the installed canon
stamps into its authoring template for that type — computed from
`@chbrain/khai-arch`'s `templates` export, never configured per repo, so a
licence ruling made once in the canon reaches every house on the next
dependency bump. A type the canon ships no template for (e.g. `order`) carries
no expectation, and a canon too old to export templates disables the check
rather than failing. `validateInstanceFile` and `validateContentFile` accept an
optional `license` expectation (`"canon"` to derive it, an explicit string to
pin it, `false` to skip); direct calls without it validate structure only, as
before.
