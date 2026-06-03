# @chbrain/khai-rules

## 0.0.2

### Patch Changes

- ab4667c: Remove the dead `checkTitle` rule. It enforced the old `## Title` == H1 echo,
  which the section contract retired when the T slot became `Taxonomy` (the group
  above, never a re-name of the H1). The kit stopped calling it then; it had no
  remaining callers, no test, and no re-export -- pure orphaned machinery. With
  the Title -> Taxonomy migration complete, the house is clean.
- c2f86b5: KAIHACKS retirement: migration ledger + khai-rules core (Loop 1: encoding)
- ad5cd0c: Frontmatter: support per-type extra keys. `checkFrontmatter` now accepts an
  `extra` map (key -> allowed enum) beyond the base `khai/license/stamp`, and
  `validateContentFile` pulls it from the canon (`khaiArch.frontmatterExtras`,
  guarded) per instance type. Backward-compatible: with no extras, behavior is
  unchanged. This is the kit-side permission that lets the canon add persona's
  `type:` (real/archetype/fictional) next.
- 73f5f9d: Frontmatter: support a `required` flag on per-type extra keys. `checkFrontmatter`
  now accepts `{ values, required }` (a bare array stays shorthand for an optional
  key) and flags a missing required key. The fixture personas declare `type:` ahead
  of the canon flipping persona's `type:` to required (next, in the arch lane).
- f17e74e: security: fix polynomial ReDoS vulnerabilities in khai-rules

  Fix two CodeQL alerts (js/polynomial-redos) with security severity high:
  - Alert #11 (line 215): Changed markdown link regex from /\[([^\]]_)/ to /\[([^\[\]\n]_)/ to prevent ambiguous backtracking on malicious input
  - Alert #12 (line 271): Replaced regex /\s+$/ with trimEnd() to eliminate polynomial time complexity

  Both changes maintain functionality while eliminating denial-of-service risk from crafted input strings.
