# @chbrain/khai-rules

## 0.1.3

### Patch Changes

- 7aa9796: Allow the optional `language` frontmatter attribute in all ENACTS files.

## 0.1.2

### Patch Changes

- 8ab94b7: Permit an optional `title` frontmatter key on content instances. This is the
  permit-only step: `title` is now an allowed key (no longer rejected as unknown),
  ahead of the engine files declaring it and a later change making it required.
- b5ab771: Require a `title` in content frontmatter, and enforce that it echoes the H1
  name (`# Type: <Name>`). `khai-rules` gains a `checkTitle` atom; `khai-tests`
  wires it into `validateContentFile`, so every validated instance -- engine
  content, consumer instances, and content surfaces generate downstream -- must
  carry a `title` that matches its H1. One pattern, recoverable from the markdown
  alone when the YAML is stripped.

  `checkH1` also now enforces that an instance carries **exactly one** H1 (`#`):
  by design a khai file has a single first-level header, so a second `#` is drift.

  Note: this is a stricter gate. Downstream content without a matching `title`, or
  with a second H1, will now fail validation; bump accordingly if releasing to
  external consumers.

## 0.1.1

### Patch Changes

- c9eff7b: Add the `license-check` subcommand and `licensePolicy` config: every package must declare an allowed (NonCommercial) license and every SKILL.md a NonCommercial CC license, so khai's concepts can't be resold under a bare permissive license. Relicense khai-guard, khai-pack, and khai-rules from plain MIT to the dual-license string (`SEE LICENSE IN LICENSE and LICENSE-CODE`) — content NonCommercial, code MIT — to comply.

## 0.1.0

### Minor Changes

- 2ccfbc2: Version floor: align every published package at 0.1.0. khai-arch, khai-tests,
  and khai-guard reached 0.1.0 with the LORE + Title -> Taxonomy release; this
  raises the remaining packages (khai-rules, khai-review, khai-engine-gender) to
  the same floor, marking the line's first coherent version. A maintainer's
  deliberate minor, not a feature delta -- declared by the maintainer, which is
  the only one who may call a minor.

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
