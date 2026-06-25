# @chbrain/khai-skills

## 0.0.30

### Patch Changes

- 9a75953: Migrate js-yaml to v5 in skills lane (4/4). js-yaml 5 removed the default export; switched to namespace import `import * as yaml` and bumped the dependency to ^5.1.0 in @chbrain/khai-skills.
- Updated dependencies [a37cb14]
  - @chbrain/khai-arch@0.1.20

## 0.0.29

### Patch Changes

- 06ca32e: guard/build: frontmatter via js-yaml 4.2.0 instead of gray-matter

  guard.mjs now exports parseFrontmatter (read) and stringifyFrontmatter (write)
  built on js-yaml 4.2.0, and build.mjs uses them to read and stamp SKILL.md —
  replacing gray-matter (matter / matter.stringify) and dropping its js-yaml 3.x
  (exposed to the merge-key DoS GHSA-h67p-54hq-rp68). stringifyFrontmatter is
  deterministic, so the stamped bundle hash stays stable. Self-contained;
  behaviour unchanged.

- Updated dependencies [046d1a9]
  - @chbrain/khai-arch@0.1.19

## 0.0.28

### Patch Changes

- 445866a: Align the khai-director skill with its operating guide: fold the
  conditions-not-instructions rule, the uncalled persona, and the director's
  over-attribution bias into SKILL.md (echoed in the persona and README), and add
  the guide as the skill's companion at references/operating-guide.md.

## 0.0.27

### Patch Changes

- 3c51976: Pitch tuning model across the playwright and director skills, on one canonical
  source.

  Both skills now inject the pitch defaults from the canon (defaults:pitch, from
  @chbrain/khai-arch defaults/pitch.md) instead of carrying hand-authored copies, so
  the "khai defaults" are a single source that cannot drift (provenance-checked at
  build, like the element templates). The director gains a build directive for the
  inject; the playwright adds it beside the element templates.

  The model: the playwright learns from the khai default pitches and, when writing a
  play, tunes one into a play-specific pitch (one per play, linked from the Company;
  a plot may tune its own as the exception). The director tunes for staging from
  both the khai defaults and the play's own pitch, starting from the play key and
  re-tuning from the defaults, or tuning one itself where the play left it open.

- Updated dependencies [64f5207]
  - @chbrain/khai-arch@0.1.18

## 0.0.26

### Patch Changes

- 8c9198c: Rewrite the khai-director skill from a teller to a control-loop seat, and drop
  its khai authoring templates.

  The skill now runs a play as a living production: it makes the separation of two
  stances (an immersed cast, the director outside reading and redirecting) the
  first principle, since behaviour is evidence only if the reader did not produce
  it. Adds the uncalled method and cold control runs, the play-latency vs
  production-inertia distinction, the persistent-cast memory and permanent-
  contamination rules, an outcome-first framing (explore plural readings or
  converge to a handed-over script), the cast charter, and convergence by
  steer-without-scripting. Capture is promoted from keepsake to a possible terminal
  deliverable, assembled from what the cast performed and never authored by the
  director.

  Removes skill.build.json so the director no longer injects khai's element
  templates (template_play, template_persona, ...): those are the playwright's
  authoring schema and have no place in a portable directing skill. In their place
  the bundle ships the references a directing skill actually expects: a director
  position (the seat), a default persona (with the clear option to use your own),
  and a pitch palette, so a persona holding the position runs the craft. The bundle
  no longer depends on khai's file formats.

  Adds a pitch knob and references/pitch.md: the director tunes a run to one
  dominant pitch, the tonal key the fixed events are played in (grieving, comic,
  dread, ...). The reference is a portable echo of the khai pitch type (TO TUNE:
  Tenor, Undertow, Nerve, Echo) with a starting palette of tenors, so the skill
  stays dependency-free while khai-arch owns the type. A pitch is a reading, never a
  rewrite: the play's events do not change.

- 7bd731f: Let the playwright author a play's pitch. Now that pitch is a khai type, the
  playwright skill injects template:pitch alongside the other element templates, and
  SKILL.md fields the pitch in the Company as the play's default key. Unlike the
  system elements (drawn by a plot's Cue/Action/Stage/Tension beats), the pitch is
  not beat-drawn: it sets the key the play is read in, authored only when the play
  has a native key worth fixing, and the Director may tune it at production time.
- Updated dependencies [a222634]
  - @chbrain/khai-arch@0.1.17

## 0.0.25

### Patch Changes

- ca463e0: Rebuild the Director skill as a control loop over a living production, not a
  frozen one-shot telling. The old skill rendered the score into one canonical
  prose telling and deposited it; that is a teller, not a director. The rebuilt
  skill directs the living board: put the play's elements in motion, read the
  behaviour, and redirect in each element's idiom (talk to personas; work pieces on
  their load-bearing line; time places; recast positions; trigger or cut processes;
  let plans press or break); request the cast be adapted (recast, alter, double,
  cut, add) as an explicit sanctioned call, never a silent rewrite. The output is
  productions: plural, partial, repeatable runs. A run can be captured and
  deposited (the archive keeps captured runs). The play (what happens) stays fixed;
  the knife-edge is held between authoring the lines and shapeless improv.

## 0.0.24

### Patch Changes

- 9a23301: Add the Director skill: stage a ready khai play (the score) into a told
  performance, a venue-neutral result (the Standard) in the house voice with the
  mechanics spent not shown. Reads the play via the injected canon templates and
  produces the writing-archive result schema (it carries the layout + frontmatter,
  so it is self-contained and LLM-agnostic). Holds the director boundaries: stage,
  do not re-author the score; deposit, do not ship. Builds to dist/khai-director.zip
  (standard + neutrality + provenance), the bundle the website skillbook serves.

## 0.0.23

### Patch Changes

- 61a13fa: theatre-manager: a play addition takes no changeset. The build (`khai-tests registry build`) is the single writer of the version — it sets `0.<count>.0`, and `changeset publish` ships it. Changesets are reserved for non-play patches. This removes the `0.<count>.1` double-bump drift (a patch changeset re-bumping the patch on top of the minor the build already moved).

## 0.0.22

### Patch Changes

- 750ba53: The theatre-manager skill's versioning guidance now matches the derived-version
  flow: changesets pick the release level only, and the build sets the minor from
  the play count. Adding a play is a patch changeset, not a hand-bumped minor.

## 0.0.21

### Patch Changes

- 814efaf: skill(playwright): add the cast-an-existing-Position-file check. A role named
  only in prose raises no duty (not every seat is worth a file), but each
  `position_[name].md` that exists must be claimed by at least one persona's
  Taxonomy (`[its name](position_[name].md)`) or the conformance kit (castErrors)
  fails it. Lets a solo model catch an uncast Position file before shipping.
- Updated dependencies [79d467a]
  - @chbrain/khai-arch@0.1.15

## 0.0.20

### Patch Changes

- c83ff4d: Teach khai-engineer the Playwright wiring guide. The skill now carries the guide
  contract every engine ships in `playwright_instructions.md`: the HACKS chapter
  contract (Human steers, Agent acts, Collaboration asks for help, Knowledge
  teaches the model, System holds the do/don't), the anchor taxonomy (over time ->
  play/plot; contested -> plan; inner self -> persona; structural role -> position;
  mechanism -> process; charged object -> piece; environment -> place; more than
  one allowed), and the lock-only-what-is-certain philosophy (the Roadie plumbing
  is locked, the rest is reasoning space). Wired into Mode A's steps and the create
  and audit self-checks.

## 0.0.19

### Patch Changes

- d22cfa2: Add the khai-roadie skill: the technical voice that runs the two Tour-and-Stage
  jobs over the deterministic packages. Set up the Stage (inbound) materializes the
  engines a world uses into the production repo; Take on Tour (outbound) composes a
  venue's deployment (Standard x Adaption, engines at Knowledge) and stages it as an
  upload bundle or a repo tree. Vendor-neutral (venue kind/source, never a product
  name), modelled on khai-impresario. Implements docs/ROADIE.md build-order item 4.
- 8b718f8: Add the khai-theatre-manager skill: the house voice. It runs one production house
  day to day, staging finished plays into it (Estate resolved, in the house voice,
  conformant), versioning it by the house rule (a new play is a minor bump, else
  patch), keeping its gates (the guard picks the lane, the gate is never bypassed,
  nothing is merged), and aligning cross-house needs upward to the chain rather than
  editing them from inside. Vendor-neutral, modelled on khai-impresario / khai-roadie.
  This fills the last of the four voices whose position and persona already existed.
- 29229bb: khai-roadie: the Stage job now sets up the management structure. The roadie stamps
  a house's management structure with khai-stage (the voice contract
  `management/management_instructions.md` plus the company: the positions and their
  named personas) and refreshes it when the blueprint changes, the same managed sync
  as the engines. The impresario judges the source and lists the house; the roadie
  does the technical setup and keeps it current.

## 0.0.18

### Patch Changes

- 923ed11: Add the khai-engineer skill. In khai-engineer mode the agent works a khai engine
  end to end, in three modes over one contract (the weave): Mode A (create) builds
  a new engine and wires it; Mode B (audit) reviews an engine and returns findings
  with a verdict; Mode C (repair) fixes a flat or weak engine by adding the missing
  ties and lifting the content, without rewriting it. The weave: one anchor that
  names the engine, every member tied down from it and back up to it, and siblings
  tied across to each other, all woven in prose. Ships a graph self-check
  (anchor-down, member-up, sibling-across, no orphan), and bundles the canon
  element templates (process, position, piece, place) pulled from khai-arch at
  build time so a no-tools model has them in hand.
- Updated dependencies [65dd38d]
- Updated dependencies [db6e497]
  - @chbrain/khai-arch@0.1.14

## 0.0.17

### Patch Changes

- 55638ea: khai-playwright: present the plan target markers as one uniform list, `[ ]` open
  alongside the four resolved verdicts `[x]` done, `[F]` failed, `[W]` waived, `[-]`
  struck, each on its own line, so the open marker reads as a peer of the verdicts.
- 592da30: khai-playwright: pin a plan's target states to the moment the curtain rises. A
  play opens before its schemes have played out, so every step the production will
  still enact stays `[ ]`, the live edge the scenes decide; only what is settled
  before the first scene, the backstory, carries a verdict (`[x]`/`[F]`/`[W]`/`[-]`).
  Woyzeck opens with the Doctor's diet already running, so that step is `[x]` while
  the killing it drives stays `[ ]`. Mark the present, not the ending.
- 8840c42: khai-playwright: spell the corrected closed-plan verdict vocabulary, `[x]` done,
  `[F]` failed, `[W]` waived (dropped or overtaken by events), `[-]` struck (cut as
  moot or never applicable), retiring the incoherent `[?]` flagged.
- Updated dependencies [ea7ae45]
- Updated dependencies [9c8c56a]
  - @chbrain/khai-arch@0.1.13

## 0.0.16

### Patch Changes

- bd26a1a: khai-playwright: spell the plan Targets verdict vocabulary as the canon now
  defines it, `[x]` done, `[F]` failed, `[?]` flagged (the former `[W]` waived
  becomes `[?]` flagged).
- Updated dependencies [0ad27c2]
  - @chbrain/khai-arch@0.1.12

## 0.0.15

### Patch Changes

- 0199cb0: khai-playwright: teach the plan Owner taxonomy. A plan is directed intent toward
  a subject, and the Owner is that subject, which sets the kind: a persona (a
  personal scheme), a position (a mandate, where the office acts not the person), a
  process (a method), a place (a development), a piece (a making), or the project (a
  production directive). A plan commands by reference, never copying, so two plans
  may drive one process without duplication. The Owner is what the plan is for; the
  Orders name the agents who act.
- Updated dependencies [91b3c98]
  - @chbrain/khai-arch@0.1.11

## 0.0.14

### Patch Changes

- 7d7056d: khai-playwright: teach the plan element and its Targets verdict vocabulary. A
  plan is an in-world blueprint (a mechanism with order), and its Targets carry a
  verdict on each step: `[ ]` open (the live edge), `[x]` done, `[F]` failed, `[W]`
  waived. "Resolved" is a verdict, not a success. Keep an in-world plan
  `status: active` and let the line between `[ ]` and the rest mark the moment the
  scene captures, between decision and execution; `[F]`/`[W]` are where a scheme's
  failures become drama. A plan steers the scene structurally, never dictating the
  lines.
- Updated dependencies [4c0b468]
  - @chbrain/khai-arch@0.1.10

## 0.0.13

### Patch Changes

- 964dc17: The drift check no longer reads an unreadable upstream validator version as
  "still current". A reachable PyPI whose payload lacks `info.version` now yields
  an empty string (distinct from offline, which is undefined), and checkDrift
  surfaces that as an advisory notice instead of skipping it via a falsy guard.
  Offline (both signals unreachable) still skips silently.
- 3fd4d72: composeSkill now errors on a bundled reference nested more than one level deep
  (e.g. references/sub/x.md). The cultures layout (and the agentskills "references
  one level from SKILL.md" rule) only represents SKILL.md plus one flat content
  subfolder; previously such a file was silently flattened by culturesLayout, with
  only an advisory warning on deep links inside SKILL.md, never on the actual
  bundled files. It is now a blocking conformance error.
- Updated dependencies [ae0c95e]
- Updated dependencies [9965037]
- Updated dependencies [11425ea]
  - @chbrain/khai-arch@0.1.8

## 0.0.12

### Patch Changes

- cde3f3f: Update playwright skill instructions in SKILL.md to specify drawing plan in Stage and Tension.
- Updated dependencies [4178749]
  - @chbrain/khai-arch@0.1.7

## 0.0.11

### Patch Changes

- c556f55: Add plan to the ENACTS playwright skill, injecting the plan template from canon and supporting the plan\_ element.
- Updated dependencies [7cd2eda]
  - @chbrain/khai-arch@0.1.6

## 0.0.10

### Patch Changes

- d19a342: Update impresario skill guide to instruct on generating and authoring a unique Manager persona for each house.

## 0.0.9

### Patch Changes

- 1b65a9a: Update impresario and playwright skill guides to include voice-authoring instructions for setting house voice in README.md and play voice in the play file.
- Updated dependencies [d4c3079]
  - @chbrain/khai-arch@0.1.4

## 0.0.8

### Patch Changes

- 72bbc7d: Thin khai-impresario to orchestrate khai-stage and khai-plays. The skill now
  stays fat where it judges (the source, its rights, the card) and collapses to a
  pointer where the house is computed: run khai-stage to stamp the invariant house,
  finish the handoffs, then list the house on the khai-plays bill. The wiring is no
  longer described file by file in prose; it is stamped, so it cannot drift between
  houses or between models.
- f527b57: Point khai-impresario step 4 at the `khai-plays register` command instead of a
  hand-written card. The repo is the house and the package is its programme; both
  default from the slug, so the impresario passes only the blurb it judged. This
  follows khai-plays gaining a `register` CLI and requiring `repo`: the skill stays
  fat where it judges (the source) and a thin pointer where the bill is computed.
- 6cba198: Add the khai-impresario skill: the source-agnostic guide for raising a khai
  production house. In khai-impresario mode you stand up a khai-plays-<source>
  collection repository, wired to the four pillars, gated, protected on both faces,
  seeded with a fixture for a green first run, and listed in the khai-plays
  registry. It mints the house's Estate identity (the owner every play logs in its
  Estate) and hands back an empty venue; the plays are written separately, in
  khai-playwright mode.
- Updated dependencies [c5cb182]
- Updated dependencies [7dc7952]
- Updated dependencies [6bffe4e]
  - @chbrain/khai-arch@0.1.3

## 0.0.7

### Patch Changes

- 62718ee: Rename the play-authoring skill from creating-a-play to khai-playwright (the
  SKILL.md name and its source directory). The published bundle is now
  khai-playwright.zip; invoke the skill as khai-playwright.

## 0.0.6

### Patch Changes

- 58934d6: Add em-dash and en-dash to the khai-skills style denylist in `lib/guard.mjs`. The check runs via `validateNeutrality` on every text file in a skill bundle at pre-commit and CI, so a dash in any README or SKILL.md now blocks the commit rather than slipping through to a consumer surface.
- 61ab1b2: Remove em-dashes from the creating-a-play and retro-4ls skill READMEs (Problem/Solution/What you get sections), rewriting the parentheticals with parentheses and a colon. Brings the skill prose in line with the house no-em-dash writing rule so consumer surfaces rendering it verbatim stay brand-clean.

## 0.0.5

### Patch Changes

- 345af83: Add README.md to creating-a-play and retro-4ls with Problem / Solution / What you get structure.
- d4ff1d2: Add a `khai.tagline` to package.json, a house-voice one-line description of the skills kit, so a consumer surface prints it verbatim instead of authoring its own copy.
- Updated dependencies [9d0674d]
- Updated dependencies [d2307ba]
  - @chbrain/khai-arch@0.1.2

## 0.0.4

### Patch Changes

- 5d1fd1b: Add retro-4ls skill: 4 L's Retrospective facilitator (Liked, Learned, Lacked, Longed for). Attributed to Gorman and Gottesdiener (2012).
- Updated dependencies [c9eff7b]
  - @chbrain/khai-pack@0.0.3

## 0.0.3

### Patch Changes

- d5b585c: Refactor khai-skills onto `@chbrain/khai-pack`: drop the package's private zip
  writer and use the shared serve engine to assemble the bundle in the cultures
  layout (overhead at the root, content in the `references/` subfolder), zip it,
  and hash it. Output is byte-identical to before; the duplication of the zip
  writer is gone and packaging now lives in one place for every repo.
- Updated dependencies [0d822cd]
  - @chbrain/khai-pack@0.0.2

## 0.0.2

### Patch Changes

- c3744d0: Add `@chbrain/khai-skills`: portable, vendor-neutral Agent Skills built from the
  khai-arch canon so cheaper or non-code-aware models can do khai work to the
  agentskills.io open standard. Composes each skill by pulling templates from
  canon at build time (`build:skills`), emits a deterministic per-skill zip, and
  guards it in pure Node across two tiers (Tier 1 standard conformance; Tier 2 khai
  policy: vendor neutrality + canon provenance). Pins the official PyPI
  `skills-ref` validator version plus the spec content hash, with a lazy upstream
  drift check that surfaces a move order on the next touch of any skill. First
  skill: `creating-a-play` (the `play` house type, ENACTS).
