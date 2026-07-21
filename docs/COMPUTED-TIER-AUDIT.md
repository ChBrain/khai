<!-- Working audit that seeds Order: Computed, Harnessed, Instructed (order 1). -->
<!-- Not a khai instance; carries no `khai:` frontmatter, so the conformance -->
<!-- kit does not read it as content. Landed for the maintainer to convert -->
<!-- into the governance/ wall PRs. -->

# Audit: the Computed tier

This audit answers step 1 of the order **Computed, Harnessed, Instructed**:
enumerate what the `khai-tests` conformance kit already gates, then place every
check the order's order-1 bullets name into one verdict:

- **covered**: a wall already gates it (cited to the atom or the kit).
- **add-wall**: canon-agnostic, deterministic, cheap, and not yet gated; a new
  `khai-rules` atom wired into the kit closes it.
- **demote-to-harness**: it reads as a wall in the bullet, but deciding it needs
  meaning, so it belongs to `khai-review` (order 2), not here.
- **stays-maintainer**: computable in part, but the residual is the maintainer's
  labelled judgement (a bump escalation) and must not be auto-gated.

The verdict list is deliberately the first draft of order 4's boundary: each
`add-wall` names a global mechanism, and where it carries a local knob (a word
register, a threshold) that is called out, because that split is exactly what
order 4 rules once.

## What the walls already gate

Read from `packages/khai-rules/rules.mjs` (the atoms) and
`packages/khai-tests/src/*.mjs` (the kit that composes them).

**Per content instance** (`validateContentFile`, `validateInstanceFile`):

- encoding: BOM, CRLF, em/en-dash, the U+FFFD decode scar, a literal unicode
  escape, a missing final newline (`checkEncoding`).
- filename: ASCII only, underscores not hyphens (`checkFilename`).
- frontmatter: closed key set, known lowercase `khai` type, stamp shape, and the
  licence pinned to the canon's template value (`checkFrontmatter`, plus the
  licence block in `validateContentFile`).
- title line: exactly one H1, read as `# Type: Name`, and a frontmatter `title`
  that echoes it (`checkH1`, `checkTitle`).
- sections: the H2 set exact, ordered, and closed against the canon mnemonic
  (`checkH2SetAndOrder`); the Owner block closed and valued (`checkOwner`); any
  H3+ that the manifest did not declare rejected (`checkExtensions`).
- links: every relative `.md` target resolves, and every package-specifier link
  resolves only through a declared, installed dependency (`checkLinks`, the
  composite hard-reference contract); wiring requirements the installed engines
  declare are present and, where a basename is ambiguous, qualified
  (`checkWiring`).
- plan and order targets: a resolved target carries a valid verdict from the
  canon vocabulary, and a closed plan or any order leaves no open `[ ]`
  (`targetVerdictErrors`, the pending-count check).

**Per package / house** (`validateEnginePackage`, `validateCollectionRegistry`):

- manifest against the filesystem: every referenced member exists, no instance
  file on disk is unlisted by the manifest (the orphan check), the README is
  byte-identical to `renderEngineReadme`, the WIRES card and the LORE
  `REFERENCES.md` parse, and the Playwright guide is present.
- registry against its collection: schema and id shape, unique ids, a
  description within 10 to 120 characters and one sentence with no HTML or
  markdown, `references` that resolve, bidirectional directory sync, title
  alignment with each anchor's frontmatter, the numbering invariant (the minor
  version equals the primary item count), and a build-drift gate (the committed
  `registry.json` must equal a fresh build).
- science: the `docs/SCIENCE.md` drift gate (`verifyScienceIndex`), and
  `collectScience` throws when an engine's Origin table does not parse at all.
- casting: a position with no persona is a failure (`castErrors`); a plot that
  casts no element of its play's Company is a failure, a Company element no plot
  casts is a warning (`castingCoverageErrors`).

**Governance** (`khai-guard`, run in the pre-push hook and the required CI
check): `branch-check`, `branch-scope`, member `collision`, `member-check`,
`license-check`, `changeset`, `bump-scope` (advisory), `lockfile-scope`.

## The order-1 bullets, placed

### 1. completeness

**Covered** for the engine and registry surfaces: the manifest orphan check, the
registry bidirectional sync, and `checkLinks` together give "no billed-but-missing,
no present-but-unlisted" and "every listed element resolves". Persona and position
reciprocity is covered from both sides (`checkLinks` catches a persona pointing at
a missing position; `castErrors` catches the orphan position).

**add-wall** (one narrow gap): the play-level "present-but-unlisted" case. A
persona or plot file that sits in a play directory but is named by neither the
Company nor any plot is not caught today; `castingCoverageErrors` treats the
Company as an upper bound (a dead Company entry is a warning) and does not run the
reverse check (a file on disk that the Company never lists). The atom is the
mirror of the engine orphan check, lifted to the play.

### 2. collision

**add-wall.** Member collision across engines is gated by `khai-guard member-check`,
but the order's collision is different and ungated: no two elements across kinds
share a display title within a house, and a whole-phenomenon piece must not
silently reuse the play title. Both are pure string comparisons over already-parsed
H1 or `## Name` values, so this is a clean global wall.

### 3. cut-to-fit floor

**This bullet splits across two tiers, and that split is the order-1 / order-2 seam
made concrete.**

- **add-wall**: the numeric floors. "At least three personas" and "at least one
  plot per beat" are counts over the parsed cast and the beat structure; nothing
  gates them today. Deterministic, cheap, global.
- **demote-to-harness**: "no element that carries no vector." The structural
  shadow of this (a plot that casts nothing) is already `castingCoverageErrors`;
  but "carries no vector" in the load-bearing sense, an element that is fielded
  yet adds no distinct force, is a meaning judgement. It is order 2's
  `load-bearing` rubric, not a wall.

### 4. shape of the warrant

- **add-wall**: Origin-row well-formedness. `parseOriginTable` (`science.mjs`)
  silently *skips* a row that is not a clean three-cell row (`cells.length < 3`
  continues). A malformed warrant row is therefore dropped, not flagged. The atom
  gates a line that opens with `|` inside the Origin chapter but does not parse to
  a valid row.
- **add-wall**: the generalised scholar-parses invariant. `surnames()` is already
  the deterministic filter (recently hardened in the "deterministic scholar filter"
  changes). Lift it into a gate: a Source cell that is not the declared
  `Practitioner` placeholder yet yields zero surnames is an uncreditable warrant
  and a finding.
- **covered**: "every Encoding piece resolves." The Encoding chapter lists member
  links, and `checkLinks` already resolves them; the orphan check covers the
  reverse.

### 5. field bounds

- **covered**: the play description cap (10 to 120 characters, one sentence),
  gated in `validateCollectionRegistry`.
- **add-wall (promotion)**: the dash ban gates on content instances
  (`checkEncoding` plus `checkClauseDash`), but on the WIRES card and the README it
  is only a *warning* (`engineDocChecks`). The order wants the deterministic slice
  of voice to gate; promote the dash lint to an error on the card and the README.
- **add-wall (global mechanism, local knob)**: the spelling register. No lint
  exists. This is the deterministic slice the order wants lifted out of the judged
  `voice-conformance` rubric. The mechanism (a register lint) is a global wall; the
  *word list it enforces is local voice*, so it is parameterised, never hard-coded.
  This is the cleanest illustration of order 4's rule: the wall is global, the
  words are local.

### 6. changeset correctness

- **covered** where it is a count: "a new unit is a minor" is enforced for a
  registry house by the numbering invariant (the minor equals the item count), and
  the build-drift gate reconciles the committed registry against source.
- **stays-maintainer**: the general "the bump matches the change class" beyond the
  count. `bump-check` is deliberately advisory (it prints the banner, never blocks),
  and CLAUDE.md hard rule 4 reserves minor and major to the maintainer's label and
  forbids self-escalation. So the residual here must *not* be auto-gated; walling it
  would collide with the label policy. The computable part is already a wall; the
  rest is correctly a human decision.

## The seam, ruled as a ratchet

The order-1 / order-2 boundary is not drawn as a fixed line down the middle of the
craft; it is drawn as a **ratchet**, which answers the caution that "the
deterministic slice of voice" is where meaning leaks in:

1. Default every candidate check to **computable**, and attempt it as a wall.
2. The first time a real counterexample proves the check needs meaning to decide,
   demote that specific check to `khai-review`.
3. That demotion is not a failure; it is the boundary evidence order 4 wants,
   recorded as it happens.

The `cut-to-fit floor` bullet already exercises the ratchet: the numeric floors
stay walls, "carries no vector" demotes to the `load-bearing` rubric. The dash ban
(a wall) versus voice-conformance (a rubric) is the same split already living in the
codebase.

## First-draft classification (feeds order 4)

Every `add-wall` above is global (it lands in `khai-rules` plus `khai-tests`, rides
the `arch/` or `governance/` lanes, and cannot drift between houses). Exactly one
carries a local knob: the spelling register lint, whose *mechanism* is global and
whose *word list* is local voice. Nothing in order 1 is house-only taste. That
matches the order's own rule, and it means the wall work needs no per-house
negotiation: the houses inherit these gates by bumping the dependency, and only the
spelling register asks a house to declare its list on adoption.

## Suggested sequence for the wall PRs

Each is a self-contained `governance/` (or `arch/`) PR, gates on landing, and
protects every house on the next dependency bump:

1. collision atom (display-title across kinds; piece-reuses-play-title).
2. cut-to-fit floors (at least three personas; at least one plot per beat).
3. warrant shape (Origin-row well-formedness; the generalised scholar-parses
   invariant).
4. play-level orphan (a play file on disk that the Company never lists).
5. field bounds (promote the dash lint to gate on card and README; add the
   register-lint mechanism with a per-house list).

The `load-bearing` "carries no vector" judgement is handed to order 2, not built
here. The bump-class residual is left to the maintainer's label, by policy.
