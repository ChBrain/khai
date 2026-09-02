# @chbrain/khai-tests

## 0.4.4

### Patch Changes

- Updated dependencies [df605dc]
  - @chbrain/khai-stage@0.0.28

## 0.4.3

### Patch Changes

- e1b0e8a: `npm pack --dry-run --json` prints an array of package records on npm 10 and
  11 and an object keyed by package name on npm 12.0.2, and `packing.mjs` parsed
  only the array shape in both places it reads pack output. On npm 12 that read
  zero records and every packing check passed silently, having proven nothing.
  
  `packRecords(raw)` now parses the JSON once, returns the records as an array
  whichever shape the top level took, and throws naming the shape when it is
  neither an array nor an object or when it holds zero records: a pack that
  reports nothing is a finding, never an empty pass.
- Updated dependencies [3f6d2ca]
  - @chbrain/khai-stage@0.0.27

## 0.4.2

### Patch Changes

- 7269e97: `khai-guard environment` reports what this machine is: platform, node, what npm
  itself reports, how npm must be spawned here, the path separator, the line
  ending, whether this process can create a directory symlink, and the shell
  signals it can see. AGENTS.md asks every agent to run it before its first shell
  command.
  
  `npmSpawn` replaces `npmCommand` and asks in the order that costs least to be
  wrong about. Under `npm run` and `npx` -- every path this repo uses -- npm sets
  `npm_execpath` to its own CLI, a plain `.js` file, so `node <npm-cli.js>` is
  identical on every OS: no shim, no shell, no platform branch. The platform guess
  remains as a fallback, labelled `platform-guess` so an answer cannot be mistaken
  for a fact.
  
  That fallback is also on a clock. Node 24 deprecates passing args alongside
  `shell: true` (DEP0190), which is exactly what the Windows guess must do, so the
  report says so where it applies.
- fbbb0ae: Add house content walls (`resolveHouse`, `unitsOf`, `touchedUnits`, `isolationErrors`,
  `filenameErrors`, `ratchet`) and the `khai-tests house check` CLI, lifting the house-built
  resolver, isolation, ASCII-filename and ratchet mechanics that khai-misfits and khai-cultures
  each carried locally into the shared kit, house-neutral and provider-neutral, so any collection
  house gets them by installing the kit rather than re-deriving them per house.
- 46de294: Three delivery walls existed twice downstream and were about to exist a third
  time: khai-cultures' preflight re-derived its CI job list against a gates
  manifest that quietly falls behind `ci.yml`, both khai-cultures and khai-misfits
  hand-wrote the same test pinning `changesets/action@v2`'s renamed inputs after
  four dead releases went unnoticed, and khai-cultures and khai-misfits each wrote
  their own version of "the registry's promise held against the tarball" for two
  different reasons (a hollow tongues package, a registry naming misfits nobody
  shipped).
  
  The kit now holds all three. `gates verify-ci` matches a house's declared
  `gates` array to its CI workflow's job ids one-to-one, with `ciPolicy` in
  `khai-guard.config.json` (`only`, `split`, a gate's own `job`) for where the
  names do not fall out on their own. `release verify` pins a release workflow to
  the input names changesets v2 actually reads. `checkRegistryPacking` (paired
  with the new `packedFilesAny`, which packs a flat house the way `packedFiles`
  packs a workspace one) holds registry.json's entries against the box and
  refuses governance content in any tarball.
  
  Measured against both houses: `release verify` and `packing verify` are clean
  on each as they stand. Neither declares `ciPolicy` yet; with one added locally
  (a `split` for the one job that runs several gates as steps, and for
  khai-misfits a `job` override where a local gate's own name does not match its
  job id) `gates verify-ci` clears khai-cultures entirely and leaves khai-misfits
  with one real finding: `khai-changeset-check` runs in CI with no equivalent in
  that house's own `npm run gates` -- a genuine gap in that manifest, not an
  idiom, and left standing rather than routed around.
- 2751c44: khai-misfits carried a second generation of science-index checks that
  `@chbrain/khai-tests` never owned: two walls on the index's own key
  computation (a homonym form declared in a misleading order, an index key that
  is a generational suffix rather than a person), the axis/opposition wall (a
  unit's warrant may declare an `axis`/`sign` in frontmatter, and two units on
  one axis with opposite signs must each name the other), and three probes
  (undeclared namesakes, the mixed-cell reading list that is their complement,
  and a hidden compound work behind a semicolon in a Key Work cell). All of it
  was kit-shape-agnostic in the house's own reading, just never lifted.
  
  It is lifted now, as `src/science-walls.mjs`, exported from the kit's public
  entry point and wired into the `science` CLI as `forms`, `suffixes`,
  `opposed`, and `probe`. Two of the three lifted walls turn out to be reading
  this build's OWN keying rather than the older first-match, suffix-keeping
  build the house's account of them describes: this build already resolves a
  homonym by longest match and already strips a trailing suffix before taking a
  surname, so `forms` and `suffixes` catch a misleading declaration order and a
  genuinely person-less Source cell, never a citation the build actually
  mis-keys. Measured against khai-misfits, khai-cultures, and this repository's
  own tree (a homonym house, a house with no Origin tables at all, and an
  engine monorepo) before shipping, per this kit's own case law on measuring a
  wall against every house it will judge.
- 1d27b3c: `lockfile-check` now asks whether the root lockfile still matches the manifests,
  which is the question CI's `npm ci` asks at install and nobody asked before it.
  
  The wall a house declares was already called `lockfile` and only hunted stray
  nested ones, so a reader saw `ok lockfile` and concluded the lockfile was fine.
  The check lands inside that command rather than beside it, so every house that
  already declares the wall gets it with the version and edits nothing.
  
  One direction only, and it says so: `npm ci` rejects a manifest dependency the
  lock does not carry and ACCEPTS an extra lock entry no manifest names. Both were
  run before this shipped.
  
  khai-tests: the runner's standing "Not run" sentence claimed a lockfile mismatch
  was invisible to the pass. For a house whose lockfile wall now asks, it is not,
  so the sentence names the gap conditionally and keeps unconditional only what no
  declared wall can see -- what a real install decides.
- 6ab42a7: `npmBin` named `npm.cmd` on Windows and stopped there, and that was necessary
  without being sufficient. Since the CVE-2024-27980 hardening (Node 18.20.2,
  20.12.2, 21.7.3) `execFileSync` REFUSES to run a `.bat` or `.cmd` without
  `shell: true` and throws EINVAL before the process starts, so the previous
  release traded ENOENT for EINVAL and the walls still could not run.
  
  `npmCommand(platform)` returns the binary and whether it needs a shell, and the
  three call sites pass both.
  
  The argument made against `shell: true` last time -- that it pushes arguments
  through an interpreter and makes quoting a problem -- was true and beside the
  point: without it the call does not execute at all on Windows. These arguments
  are subcommands, flags and workspace package names, with no spaces and no shell
  metacharacters.
  
  Also: `.husky/pre-push` described `lockfile-check` as rejecting a nested lockfile
  and nothing else, two releases after it grew the manifest-sync and platform
  breadth checks. A reader debugging that wall went looking for a stray lockfile
  that was never there.
- d34122b: Three checks spawned `npm` by bare name, which is an executable on Linux and a
  `.cmd` shim on Windows, so `execFileSync` threw ENOENT there: the packing suite,
  the lockfile sync check and the drift check. On Windows `npm run gates` could not
  finish, and the whole run read as a broken machine.
  
  `npmBin(platform)` names the right binary, and takes the platform as a parameter
  so both branches are testable from either one. A platform branch exercisable only
  on the platform it is wrong about is how this lasts.
  
  Not `shell: true`: that pushes every argument through a command interpreter and
  makes quoting a problem this code does not otherwise have.
  
  Reported from a Windows house, as an environment quirk. It was ours.
- Updated dependencies [489244e]
- Updated dependencies [673b628]
- Updated dependencies [78e05f0]
- Updated dependencies [0212931]
- Updated dependencies [63df3e2]
- Updated dependencies [a80948f]
- Updated dependencies [e774ef2]
- Updated dependencies [5a1b033]
- Updated dependencies [3182253]
  - @chbrain/khai-arch@0.1.27
  - @chbrain/khai-stage@0.0.26

## 0.4.1

### Patch Changes

- 8e7bcd1: Let a `scholarPolicy.nonAuthorSources` entry be a **pattern** as well as a string, so a house declares an intentional non-author class as one rule rather than as a list of every cell in it.
  
  The wall this widens is right and stays intact. An Origin `Source` cell that yields no scholar used to VANISH from the science index, taking its citation with it: a composite whose Origin held "Cognitive-behavioral model" and "Clinical presentation" lost both rows and Frost, Hartl and Steketee with them, keeping one record where there should have been five, and every gate green. `originRowErrors` closed that by making such a row declare itself, which is right for khai, whose tree holds six such rows and lists them as strings.
  
  It was unadoptable by a house whose non-author rows are a **convention**. Measured over khai-misfits' corpus (every `misfits/*/REFERENCE.md` Origin chapter): **499 errors, 352 distinct Source values, 268 misfits affected**. 120 are `Practitioner`, the kit's own anticipated case; the long tail is that house's documented convention, a Source that deliberately names no person ("Boundary of the effect", "The measurement dispute", "Whether any settlement reaches it"). Declaring 352 strings is precisely the "closed list of the `NON_AUTHOR` kind ... a list to maintain" that house's own ruling forbids.
  
  An entry is a pattern iff it opens and closes with `/` around at least one character; it compiles with the `i` flag and matches the same qualifier-stripped Source the string path uses. One rule, `"/^(The|Whether|Why|What|How|Whose|Where|When|A |An ) /"`, plus `Practitioner` and two named cells, takes that house from **499 to 58**, leaving a 39-value residue for it to decide on. This is the shape `workPolicy.contrastMarkers` already has: a declared vocabulary for an intentional class, authored by the person who knows the class and never inferred from the prose.
  
  The wall keeps its prey, because a pattern exempts what it names and nothing else: that rule reaches neither "Cognitive-behavioral model" nor "Clinical presentation". The two degenerate readings are refused for the same reason -- `"/"` and `"//"` carry no body and stay strings, rather than compiling to the empty regex that would match every Source and silently disarm the wall for a whole house, and a slash inside an entry (khai's own `NFPA / DOE hydrogen safety`) stays a literal, since read as a regex it would match unanchored.
  
  **An invalid pattern throws, naming the entry**, and throws before a single row is read. A pattern that cannot compile declares nothing, which is indistinguishable from a vocabulary nobody has used yet; the fault belongs on the build that introduced it, not on the row that eventually needed it.
  
  New export `matchesNonAuthor(source, entries)`, the single reading of the policy that both the wall and any caller share. Both existing call sites pass `nonAuthorSources` through unchanged, and khai's own config does not change: its six entries are strings.

## 0.4.0

### Minor Changes

- 6dbed8f: An Origin row whose Source names no scholar is now an error rather than a
  silent drop. The uppercase-initial rule cannot tell a deliberate non-author
  idiom from a mistyped one, so the six legitimate cases are declared in
  `scholarPolicy.nonAuthorSources` and anything else fails the collector.

### Patch Changes

- 0239d13: `src/gates.mjs`, the house gates runner, lifted out of this repo's
  `scripts/gates.mjs` so every khai house runs one runner instead of
  hand-maintaining its own. khai-cultures built a second one from the same idea and
  it drifted from that house's CI without anybody noticing (local 10/10 while CI
  failed all ten jobs on `npm ci`), which is what two implementations of one rule
  cost: two things to get wrong and only one of them read.
  
  `loadGates` reads the walls a house declares in the `gates` key of its
  khai-guard.config.json, through `findGuardConfig`'s walk-up, so the runner never
  owns a second notion of where the config lives and a workspace-shaped house keeps
  its walls where it keeps its lanes. `runGates` checks visibility first and STOPS
  on it (a wall run against a tree the runner has said it cannot see produces an
  answer that means nothing, and it means nothing expensively), records each wall
  through the shell, and computes one verdict off the same records the counts come
  from. `renderGates` is pure, prints the measured counts verbatim, names a record
  it could not read rather than dropping it, and declares unconditionally that the
  pass used the installed `node_modules` and not a fresh `npm ci` -- the sentence
  that was missing from both logs.
  
  It verifies and does not fix: a failing wall's `fix` is a string carried to the
  reader, never a command the runner runs. Declaring no gates is a finding, not a
  clean pass, because green on nothing is the failure mode a new house meets first.
  
  `khai-tests gates [dir] [--content-root <path>]` is the CLI, and this repo now
  adopts its own lift: the walls it used to hold in code are declared in
  `khai-guard.config.json` and `scripts/gates.mjs` is the entry point and nothing
  else.
- Updated dependencies [d55da1c]
- Updated dependencies [2300bef]
- Updated dependencies [38e97ee]
  - @chbrain/khai-arch@0.1.26
  - @chbrain/khai-stage@0.0.25

## 0.3.4

### Patch Changes

- d1187af: The policy loaders find `khai-guard.config.json` above the content root.
  
  `loadWorkPolicy(root)` and `scholarPolicy(root)` read the config from the
  content root alone and returned empty policies when it was absent. Correct while
  every house keeps its content beside its config; quietly wrong the day a house
  takes khai's workspace shape, because the content root moves down into
  `packages/<house>` and the config stays at the repository root, where the lanes
  it declares live. From that day the house's canon list, its contrast and support
  vocabulary and its scholar homonyms all silently become defaults -- loud
  symptoms with the wrong diagnosis, since the namesake wall would report
  declarations missing that sit one directory up, read by nothing.
  
  So the config is resolved the way `instructions.mjs` already resolves an
  installed package: walk up from the root until found (`findGuardConfig`, new,
  exported). Nearest wins, as a whole file and never per key -- a package carrying
  its own config keeps exactly that config, because a merged policy is a
  computation no file on disk shows, and a maintainer reading the nearer file
  would be reading the wrong policy. No config anywhere up the walk still means
  the kit defaults, exactly as before; nothing changes for any house today, since
  a config beside the content is found first.
  
  Proven against the real case it exists for: khai-misfits' config against a
  simulated `packages/khai-misfits` content root resolves all 32 canon works, the
  3 supporting markers and the 81 declared surnames that the old loaders would
  have replaced with defaults. This unblocks the misfits workspace migration.

## 0.3.3

### Patch Changes

- 6674544: `roleOf` reads `workPolicy.supportingMarkers`, symmetric with `contrastMarkers`.
  
  A house could declare its **contrast** vocabulary and had no way to declare its
  **support** vocabulary. `roleOf` knew the `support` role but reached it only
  through the `**Support.**` prefix, which must LEAD the Scope cell -- right for a
  cell an author is writing now, wrong for the hundreds already written where the
  phrase sits mid-sentence.
  
  khai-misfits hit that gap and filled it locally: a `supportingMarkers` list its
  own `--compound` instrument read and this wall did not, shipped with the
  divergence documented as an accepted limit. **Two checks reading the same policy
  and disagreeing is worse than either answer**, and the mitigation ("it costs
  nothing today, the wall holds at zero") is exactly what makes it expensive later:
  the first real collision, an author declares the row background, watches one
  instrument clear it, and gets a red build with no explanation.
  
  So the vocabulary comes home. `supportingMarkers` is now read by the wall, with
  the same defaults the house had already chosen (`cited as background`,
  `background, not the spine`, `(background)`), and `loadWorkPolicy` returns it.
  Both forms mean one thing and both reach the same wall: the prefix declares a
  role at the head of a cell, the marker declares it anywhere in one.
  
  Nothing migrates. Unmarked rows are still spines, the contrast path is untouched,
  and khai-misfits holds at zero findings against this kit with the config it
  already merged.
  
  The analogous change (adding the `support` role at all) took `bump:minor` in
  0.3.0. This is the same kind of loosening -- fewer findings, never more -- so the
  maintainer may want the label; not self-escalating.

## 0.3.2

### Patch Changes

- 3d0f156: Collect the Playwright instructions of the packages a repository installs.
  
  Every khai package that publishes typed content ships a
  `playwright_instructions.md`, and 376 of them exist across the engines and
  composites because the validator has required one since the convention began.
  Nothing read them for the Playwright. The guidance a package wrote about its own
  wiring reached the author only if a model happened to open the file, which is a
  person remembering doing a computer's job.
  
  `collectInstructions(root)` walks the **declared** dependency closure and returns
  what it finds, deepest dependency first. Declared rather than scanned is the
  point: a hoisted workspace holds every package's dependencies in one directory,
  so a scan would hand a repository a stranger's instructions. A cultures house
  gets the language engine and its tongues; a different house gets its own.
  Nothing about any domain enters khai.
  
  `khai-tests instructions [--root .]` renders it. Two layers, because five
  chapters times a large closure is a context bomb and a Playwright casts from a
  few packages: the default carries each package's one-line exported `law`, and the
  chapters come only for `--package <name>` or `--full`. `--law` executes each
  entry point, so running dependency code stays the caller's choice.
  
  This also gives `law` a reader. Forty packages export one and nothing consumed
  it.
  
  **A production now ships a Playwright guide**, on the rule every engine already
  obeys: a package that PUBLISHES khai typed content ships one. The first draft of
  the production contract left it out alongside the WIRES card and the generated
  README, and that was wrong in a way the other two are not -- a production is
  precisely the thing a Playwright casts FROM. The rule is not "engines and
  composites", it is "whatever publishes khai types", and tooling needs no
  carve-out: the two tooling packages carrying a `khai:`-framed design record ship
  neither, since both sit outside `files`.
  
  **`validateProject` no longer walks the guide as content**, which building the
  above exposed. It is dev-steering, so treating it as part of the production made
  an English authoring guide inside a German culture demand a `declared`, and made
  every engine wiring law aimed at a project's Instructions chapter fire on it.
  Neither was a real fault; both were the check reading the wrong kind of file. The
  collision and orphan rules already exempted it for exactly this reason.

## 0.3.1

### Patch Changes

- 32ec1cc: `science verify` names the line that drifted. The out-of-date error carried no
  detail, so a stale index and a builder that changed under you looked identical.
  It now reports the first differing line and column with an excerpt of both
  sides, windowed on the difference rather than the start of the line.
- Updated dependencies [06c1c91]
  - @chbrain/khai-language@0.1.24

## 0.3.0

### Minor Changes

- 163c2bf: Give a citation a declared role. `roleOf` reads a Scope cell opening
  `**Contrast.**` or `**Support.**` and returns `contrast`, `support` or `spine`;
  the overlap wall now refuses only a work carrying a **spine** in more than one
  unit, so a boundary citation and a corroborating one are legitimate second uses
  rather than findings. Unmarked rows are spines and the legacy contrast
  vocabulary still reads, so nothing migrates and no existing finding changes.

### Patch Changes

- f69f1ae: Fix `roleOf` against the parsed cell. The Origin reader strips emphasis, so a
  `**Contrast.**` lead arrives as `Contrast.` and the asterisk-bearing prefixes
  never matched — the declared roles shipped inert. The token is now matched on
  the parsed form, must lead, and must be closed by a period or colon, so a cell
  that merely opens with the word stays a spine.

## 0.2.9

### Patch Changes

- f40141d: Open the production layer: validate a package that ships one khai play.
  
  `validateProductionPackage` is the third package validator, beside the engine
  and the composite. A production carries no WIRES card, no generated README, no
  members tree and no `compose()`, so it gets none of those checks; it declares
  `khai.class: "house"` -- the canon's own class for the types that make a play,
  not a new word -- and is routed on that, the same way the spine engine is routed
  on `meta`. It checks the manifest (class, id, no `khai.engine`, one anchoring
  play), the publish invariant (no `../` in any shipped markdown), and then hands
  the content to the ordinary consumer validator.
  
  The publish invariant is not redundant with the broken-link check, which is why
  it exists: a culture sitting beside its siblings in a working tree resolves
  `../france/position_language_fr_fr.md` perfectly, so the link check passes and
  the published tarball is broken. Only the invariant can see that the neighbour
  is not in the package.
  
  `installedEngineManifests` now also resolves the engines the root's own
  package.json declares, walking up through node_modules, instead of only scanning
  the directory beside the root. A workspace hoists installs to the workspace root,
  so a package validated on its own directory had no local node_modules, its
  engines' wiring laws were invisible, and every wiring link read as broken -- while
  package-specifier links, which already walked up, resolved. The two notions of
  "installed" disagreed and neither root gave a true reading. The declared walk is
  unioned with the flat scan rather than replacing it, so engines arriving
  transitively through a composite are still seen.

## 0.2.8

### Patch Changes

- Updated dependencies [93aa178]
- Updated dependencies [c6d9ab9]
  - @chbrain/khai-stage@0.0.24

## 0.2.7

### Patch Changes

- f682e87: Add an Atoms column to the science index's By engine table: which engines each composite wires, read from its own dependencies. Resolves a composite that wires composites, not only engines.
- Updated dependencies [c6633b8]
- Updated dependencies [5749ffd]
  - @chbrain/khai-stage@0.0.23

## 0.2.6

### Patch Changes

- 5f21d97: Science keying owned by the kit, computed at the root. The build now strips generational suffixes (Jr., III) before reading a surname -- the live index carried a `Jr` key merging five different people -- and resolves declared homonym forms longest-first, so the declaration order in `scholarPolicy.homonyms` can no longer decide who somebody is. New `src/overlap.mjs` carries the cross-unit warrant instruments every science-based root shares, engine monorepo and collection house alike, off the same collector as the build: `science overlap` (the shared-work wall, with `workPolicy` canon/contrast/alias exits and, in an engine root, the composition itself as a computed exit -- a composite citing its member atom's science composes, it does not duplicate), `science check` (the loose pre-authoring advisory), `science surname` (the scan `check` could never answer: is this surname anywhere in the index, bare or resolved), and `science namesakes` (a declared surname may not appear unresolved).

## 0.2.5

### Patch Changes

- 941c4d5: registry build: heal the CHANGELOG heading only during a release, discriminating on pending changesets, so a build in a working branch no longer rewrites a published heading to a version that never shipped.
- Updated dependencies [bbb1699]
  - @chbrain/khai-rules@0.1.13

## 0.2.4

### Patch Changes

- 679b66c: The registry build heals the top CHANGELOG heading with the manifest (the single-writer rule covers all three files), and validate fails a heading above the registry version: a version that never shipped. Fixes the count-moving release drift (khai issue 1040).
- Updated dependencies [b55e2b1]
- Updated dependencies [924cb2f]
  - @chbrain/khai-arch@0.1.25

## 0.2.3

### Patch Changes

- 6675f22: Registry entries ship a members[] catalog with casting facets; the validator gains the matching optional check.
- Updated dependencies [2559760]
- Updated dependencies [948125f]
  - @chbrain/khai-arch@0.1.24
  - @chbrain/khai-stage@0.0.22

## 0.2.2

### Patch Changes

- 787f31f: Wall (order 1, collision): add the `titleCollisions` atom to khai-rules and gate it in the conformance kit. Within one scope (an engine's members, a play's cast) no two elements of different kinds may share a display title (the H1 name), and a whole-phenomenon piece may not reuse the play title; a bare title must name one element. Same-kind repetition is not flagged (two personas is the norm). The Playwright wiring guide is exempt (dev-steering named after the phenomenon, not a cast element) and a meta engine (the spine, not a cast) is exempt, mirroring how both are already exempt from the loose, orphan, card, and README checks. Verified green across all current engines, composites, and fixtures; no whitelist needed. Set at patch as the free level; a new gate may warrant a minor at the maintainer's `bump:minor` label.
- 760329e: Wall (order 1, warrant-shape): gate Origin-row well-formedness. `parseOriginTable` silently skipped a table row that is not exactly three cells, so a mistyped warrant row (a missing pipe, a merged column) was dropped from the science index without a trace, losing its citation. `collectScience` and `collectCollectionScience` now throw on a malformed Origin row (a `| ... |` line that is neither the separator nor the header yet does not hold exactly three cells), naming the engine and the offending line, mirroring the existing zero-rows throw. Scoped to science-bearing engines by construction: the callers already skip an engine with no `khai.type` before parsing its Origin, so the meta spine's deliberately two-column warrant is never flagged. Verified green: the real repo collects 114 science engines with no throw. Set at patch as the free level; a new gate may warrant a minor at the maintainer's `bump:minor` label.
- f4571c5: The carry check: a play casting one pitch has named its default and owes no more; a play whose Company carries more than one must explain the carry there, in prose. The kit cannot judge what the prose says, only that it exists, so `pitchCarryErrors` fails any line of a multi-pitch Company that casts a pitch as a bare link. Wired into collection conformance as an error, per the canon's must.
- 772cd2b: Casting coverage learns the two tunings. A pitch keys the run and is never fielded in a scene, so a pitch no plot casts is the normal shape of a keyed production: `castingCoverageErrors` no longer warns it as a dead Company entry. And because a voice is per-file so the cast does not speak in one tone, the new `voiceEchoWarnings` compares every play's declared voice pairwise (word-bigram Dice, default threshold 0.6, calibrated where honest voices top out at 0.40) and warns on a register stamped twice; wired into collection conformance as a warning, not an error.
- 856287d: Wall (order 1, completeness): gate the play-level orphan. A content instance that sits in a play directory but the play never lists (in its Company or Triggers) is a present-but-unlisted element, the reverse of `castingCoverageErrors` (which only flags a listed element no plot casts). This is the engine orphan check lifted to the play: the play file is the play's manifest, so every instance beside it must be linked from it. Conservative on a play that links nothing local (skipped, as `castingCoverageErrors` skips an empty Company); a non-instance doc (no `khai:` frontmatter) is ignored. Verified green: the real discussion play lists all eight of its local instance files. Set at patch as the free level; a new gate may warrant a minor at the maintainer's `bump:minor` label.
- da30eac: Let a house declare which surnames are shared, so the science index stops merging two scholars into one entry. The forward map keys a row on the author's surname, which is what collates a scholar written "Kahneman" in one warrant and "Daniel Kahneman" in another, and is the property that makes the index worth having. It also merges people. A sweep of one consuming house found twelve surnames carrying more than one person: Adams is Scott, Gordon and John; Hart is 't Hart, Julian Tudor Hart and Oliver Hart; Rose is Geoffrey, Michael R and Todd; and Wagner is Adolph and Richard inside a single unit's Origin table. Read as one entry each, those are twelve false claims about who wrote what. The fix cannot be computed, and the same corpus is what shows why: two different given names under one surname looks exactly like one person written two ways, since "Buchanan", "James Buchanan" and "James M Buchanan" are all the same economist and "Schelling", "Thomas Schelling" and "Thomas C Schelling" are all the same strategist, so any rule that separated the Harts would also shatter those two. Keying on full names instead would be worse still, trading a dozen false merges for hundreds of false splits and destroying the collation the index exists for. So separation is declared rather than inferred: `scholarPolicy.homonyms` in a root's khai-guard.config.json maps a shared surname to the given-name forms that distinguish its bearers, and a declared surname keys as "Surname (Form)" so the namesakes sort together under the surname rather than scattering under their given names. Everything else is untouched, an undeclared surname keys exactly as before, a part carrying no declared form keys on the bare surname so an unresolved occurrence stays visible rather than being silently attributed to one of them, and `surnames()` takes the policy as an optional second argument defaulting to empty, so the exported signature is unchanged and a caller that passes nothing gets today's behaviour byte for byte. Verified: with no policy declared this repo's own docs/SCIENCE.md rebuilds byte-identical, and the particle handling added earlier still resolves Le Grand and Van Jacobson correctly. This is the same shape as the existing `memberPolicy.homonyms`, which whitelists a member stem two engines may share for the same reason: where nothing in the data distinguishes two cases, the maintainer declares it and the build computes everything else.
- e078a3b: Carry nobiliary particles into the surname the science index keys on, so a scholar whose surname begins with one is filed under their name rather than under half of it. The forward map keys each Origin row by taking the last whitespace token of every author part, which is right for "Daniel Kahneman" and wrong for "Julian Le Grand": his surname is Le Grand, and the index filed him under **Grand**, a real and correctly spelled person sitting under the wrong half of his own name. "Gustave Le Bon" had the same fault and sat under **Bon**. Nothing in the shape of "Le" marks it as a particle, so the set is declared as data alongside the existing `NON_AUTHOR` set, but whether a given occurrence actually joins is computed from two signals the source already carries. The particle must be **capitalised**, which is how a name declares the particle to be part of the surname: "Julian Le Grand" is indexed under Le Grand, while "Marquis de Condorcet" is indexed under Condorcet and "Arnold van Gennep" under Gennep, which is also how the rest of the corpus cites them, as bare "von Neumann" and bare "Condorcet", so following the source's own casing keeps a lowercase-particle scholar collating on one key instead of fracturing into two. And the particle must **not be the part's first token**, because a capitalised particle in first position is a given name: "Van Jacobson" is Jacobson, and the Van is what his parents called him. Requiring a token ahead of it is what tells those two apart. The joined surname still opens with the capital that opened the particle, so the uppercase-initial rule that keeps common nouns out of the index reads it unchanged. Checked against every Origin Source cell in the corpus: of 1375 cells, ten are particle-shaped and exactly two change, both to the right answer, with `Van Jacobson`, `Marquis de Condorcet`, `von Neumann`, `Arnold van Gennep`, `Tom van der Poll`, `Niels van de Ven` and `Wilco W. van Dijk` all keyed exactly as before.
- Updated dependencies [f83a54c]
- Updated dependencies [787f31f]
- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
- Updated dependencies [3326114]
  - @chbrain/khai-stage@0.0.21
  - @chbrain/khai-rules@0.1.12
  - @chbrain/khai-arch@0.1.23

## 0.2.1

### Patch Changes

- 61023fc: Make the science index's `surnames()` a deterministic scholar filter. Strip parenthetical qualifiers (so `Brooks (communication)` keys to `Brooks`, not the tag), keep only tokens that begin with an uppercase letter (a scholar surname is a proper noun), and drop the one declared placeholder (`Practitioner`). This removes pseudo-scholars the old last-token rule manufactured from non-author Origin rows — honest-note phrases (`Boundary of the effect`), mechanism labels (`The individual calculus`), field markers and bare years — without a hand-maintained blocklist, and recovers real authors previously lost behind qualifier tags. Dropped rows still render verbatim in the by-unit section, so nothing is lost from the index.

## 0.2.0

### Minor Changes

- 9afd486: Generalise `khai-tests science` from engine monorepos to collection houses. A
  production house that indexes content subdirs (e.g. khai-misfits, `misfits/<id>/`
  each a `REFERENCE.md` warrant and no per-item package.json) can now compute its
  own `docs/SCIENCE.md` — the forward map science → item — from the same Origin
  tables its per-item warrants carry, with the same build-drift gate the engine
  index uses. Dispatch is on the `khai.collection` knob the registry build already
  reads: a house that declares it is rendered from its units; anything else is the
  engine monorepo, rendered by the untouched pre-existing path (the engine index
  is byte-identical). Adds `collectCollectionScience` and `renderCollectionIndex`
  to the public surface; `buildScienceIndex`/`verifyScienceIndex` now dispatch by
  house shape. Additive and back-compat — the minor bump is the maintainer's label
  to confirm.

## 0.1.30

### Patch Changes

- 6a268a9: The science index now scans `packages/composites/*` alongside `packages/engines/*`: a composite's REFERENCES.md Origin table carries the integrative warrant of the layer read, so its sources index like any engine's and collate with the atoms that share them. Composites render italicised so the layer stays visible at a glance.

## 0.1.29

### Patch Changes

- 5324965: instance discovery now tolerates a leading UTF-8 BOM. Both instance probes (`instanceFiles`, `findInstanceFiles`) keyed on a `---` at byte 0, so a BOM-prefixed content file was not recognised as an instance and was skipped by the validator entirely -- shipping unvalidated while CI stayed green. The probes now allow an optional leading BOM, so such a file is discovered and then flagged by checkEncoding ("BOM present") instead of vanishing.
- 4e96058: Hard links and the ambiguity rule (the composite-layer link contract). checkLinks resolves package-specifier links (`@scope/engine/member.md`) through a caller-supplied resolver and fails closed on an undeclared or missing dependency; khai-tests supplies the resolver from the consumer's own package.json (project mode, engine mode) so a hard link without a declared dependency is a build error. checkWiring learns qualified links: a bare wiring link satisfies a requirement only while its basename is unambiguous among installed engines -- where two engines ship the same file the link must qualify its package, and a link qualified to a different engine never satisfies. Additive: without the new options both checks keep their original behavior.
- Updated dependencies [c068b0b]
- Updated dependencies [4e96058]
  - @chbrain/khai-arch@0.1.22
  - @chbrain/khai-rules@0.1.11

## 0.1.28

### Patch Changes

- a485c1a: Add the science index: `khai-tests science build|verify` inverts every engine's REFERENCES.md Origin table into a generated `docs/SCIENCE.md` (science → engine), collating each scholar across engines by surname. A build-drift gate holds the committed index to source, mirroring the registry gate.
- Updated dependencies [14b6fd7]
- Updated dependencies [f0657c2]
  - @chbrain/khai-arch@0.1.21
  - @chbrain/khai-rules@0.1.10

## 0.1.27

### Patch Changes

- bac6af9: Conformance: gate `registry.json` against build drift. The validator now rebuilds
  the registry from source in memory (a new pure `computeRegistry`, factored out of
  `buildRegistry`) and asserts the committed `registry.json` equals it — catching a
  hand-edited or stale registry (a description that no longer matches its play's
  frontmatter, a missing or reordered entry, a drifted version) at the content PR
  instead of at release, where the `version` script's rebuild would otherwise expose
  it. `buildRegistry` is unchanged in behaviour (it now calls `computeRegistry`, then
  writes). The build stays the single writer of `registry.json`; a hand edit is a finding.

## 0.1.26

### Patch Changes

- 86520e7: registry: discriminated entries, optional geo iso, and referencing collections

  `buildRegistry` now stamps a `kind` discriminator on every entry, merges an
  optional per-item `geo.json` `iso` (absent ⇒ non-mappable), and supports
  referencing collections declared in `khai.collections` (e.g. `groups`) whose
  entries derive their `references` from the casts in their anchor file. The
  numbering invariant counts the primary collection only, so referencing
  collections never move the minor. `verifyRegistry` validates the richer shape:
  `kind` (when present) must match its collection, `iso` must be a non-empty
  string when present, and each `references` id must name an existing member of
  the referenced collection. New exports: `resolveCollections`, `collectionKind`.
  Single-collection plays and cultures houses are unaffected.

- Updated dependencies [046d1a9]
- Updated dependencies [323b66b]
- Updated dependencies [2f1c8be]
  - @chbrain/khai-arch@0.1.19
  - @chbrain/khai-language@0.1.4
  - @chbrain/khai-rules@0.1.6

## 0.1.25

### Patch Changes

- bbca1ce: Generalize the registry/numbering machinery from `plays`-only to a named
  collection. A house declares `khai.collection` in package.json (a string
  shorthand, or a `{ dir, key, anchor }` object); it defaults to plays, so every
  existing play house is byte-identical. `buildRegistry`, `verifyRegistry`,
  `validateCollectionRegistry` (new; `validatePlayhouseRegistry` kept as an
  alias), `countItems` (new; `countPlays` kept as an alias), and the project
  validator all key off the resolved collection. This lets a non-plays content
  house (e.g. `khai-cultures` with a `cultures/` folder) build a
  `registry.cultures` bill and ride the same computed-minor numbering.

## 0.1.24

### Patch Changes

- Updated dependencies [8fb2701]
- Updated dependencies [a222634]
  - @chbrain/khai-stage@0.0.20
  - @chbrain/khai-arch@0.1.17

## 0.1.23

### Patch Changes

- cb627d0: The management convergence gate reads the blueprint live from @chbrain/khai-stage
  instead of a committed snapshot. Removes src/management-core/, the `management
build` command, and the snapshot/blueprint in-sync test; checkManagement now
  compares a house directly against the installed khai-stage blueprint. This drops
  the snapshot-vs-blueprint coupling that made a blueprint-core change unmergeable
  when split across the stage and governance lanes. Adds @chbrain/khai-stage as a
  dependency.
- Updated dependencies [906c053]
  - @chbrain/khai-stage@0.0.19

## 0.1.22

### Patch Changes

- 6c1e006: Add the management convergence gate (Order 0b). `khai-tests management build`
  snapshots the shared management core from the khai-stage blueprint into the
  package (the single writer); `khai-tests management check [dir]` holds a house's
  management to that snapshot, allowing only overlay differences (cast personas,
  house plans, orders/). The Roadie/touring module is deferred (not in the core
  yet). No new runtime dependency; the snapshot ships in the package.
- 2ea7969: Resync the management core snapshot with the blueprint (it had lost the
  `language: english` fields after the blueprint fix), and add the management gate
  tests: a snapshot/blueprint in-sync guard (catches a stale snapshot in CI) plus
  checkManagement behaviour (converged passes; drift, missing core, and missing
  home are flagged; touring stays out of the core).

## 0.1.21

### Patch Changes

- bcc68e2: registry build: source a play's `description` from its frontmatter (the
  English-facing logline the canon already permits) instead of the first `## Arc`
  paragraph. The Arc (the declared-language synopsis the book reads) stays the
  fallback when no frontmatter description is authored, so a house keeps building
  while its plays adopt the field. This lets `registry.json` be English while the
  play files stay in their declared language.

## 0.1.20

### Patch Changes

- 05a336c: reviewer-assist: add `titleLeakAudit`, an audit-only check that flags source-language text leaking into an element's English `title:` (the source name belongs in `declared:`). It never warns, fails, or edits — a blanket `title === declared` rewrite would corrupt proper nouns, so it surfaces candidates for human triage in two buckets (a source-language marker in the title; or `title` equal to `declared`). Wired into `validateInstanceFile`/`validateProject` and exported for direct use.

## 0.1.19

### Patch Changes

- 4a1d6b1: `buildRegistry` now derives the version from the play count (the minor IS the
  count) and reconciles it into both `package.json` and `registry.json`, making
  the build the single writer of the minor. A manual edit or a stray minor
  changeset that drifted the version is healed on the next build (e.g. `0.77.x`
  with 76 plays becomes `0.76.0`); the major is preserved (the numbering guard
  still flags a non-zero major) and the patch is preserved unless the count moves
  the minor, which starts a fresh `.0`. New helpers `deriveVersionFrom`,
  `deriveHouseVersion`, and `countPlays` are exported. The numbering guard remains
  as the verification that the committed registry matches the play count on disk.

## 0.1.18

### Patch Changes

- 71209a2: Add casting-coverage validation to `validateProject`. A plot must cast at least
  one element of its play's Company (links it inline); a plot that names the
  company only in plain prose is now an error, the dual of the position→persona
  cast check at the play level. A Company element no plot casts is reported as a
  warning, since the Company is the closed cast a play may field, not a mandate
  that every member appear.
- 61c021e: Enforce the playhouse numbering invariant in `validatePlayhouseRegistry`: a
  house's version minor must equal its play count (adding a play is a minor bump,
  so the minor tracks the count). A drifted minor, a non-semver version, or a
  non-zero major (which would reset the minor while the count keeps climbing) is
  now an error rather than silent drift found downstream. Existing registry test
  fixtures are aligned to the invariant (version 0.<count>.0).

## 0.1.17

### Patch Changes

- 4f64f65: Recognize `playwright_instructions.md` as a special engine file. Every engine may
  ship a Playwright wiring guide (a `khai: instructions` HACKS file explaining the
  engine's model). The kit exempts it from the manifest-member and loose-file
  checks, and validates it as an instructions instance when present. It is
  dev-steering, not engine content. (Making it _required_ is gated separately, once
  every engine carries it.)
- 993fc49: Require the Playwright wiring guide on every engine. `validateEnginePackage` now
  reports a finding when `playwright_instructions.md` is missing, the meta engine
  included - the spine carries a short guide that points at the Roadie, so there is
  no carve-out. The recognition (validate-when-present, exempt from manifest-member
  and loose-file checks) was added earlier; this flips it from optional to
  required, now that every engine carries one.

## 0.1.16

### Patch Changes

- ace7e20: Add the orphan-position gate: a needed position without a persona is a failure.
  `castErrors` groups position*\*.md and persona*\*.md per directory and flags any
  position no persona links to (via its Taxonomy); wired into validateProject so
  `khai-tests --project` enforces it. Makes the rule computed, not judged. The
  reverse (a persona pointing at a missing position) stays covered by the link
  check.

## 0.1.15

### Patch Changes

- 4605ef4: The kit learns the canon's licence. `validateProject` now checks every content
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
- Updated dependencies [65dd38d]
- Updated dependencies [db6e497]
  - @chbrain/khai-arch@0.1.14

## 0.1.14

### Patch Changes

- 5c4ad95: Teach the conformance kit the `class: meta` engine (the spine). An engine that declares `class: meta` carries the flavored instructions and the architecture (the extension point) a world runs on, not a content engine wired into a house/element chapter. `validateEnginePackage` now skips the two content-only ceremonies for such an engine -- the WIRES card and the card-rendered README -- and reads its members as a flat list of meta-type instances (instructions, architecture), each validated against the canon exactly like any other instance. Content engines are unaffected.

## 0.1.13

### Patch Changes

- 6181719: tests: cover the closed-plan verdict vocabulary. Assert a `status: closed` plan
  accepts `[x]`/`[F]`/`[?]` and rejects `[W]`/`[-]` as unresolved verdicts, while a
  draft or active plan is not held to it. Update the plan/order fixtures to spell
  the canon set (`[?]` flagged in place of the retired `[W]` waived).
- 10455e9: validate/tests: derive the closed-plan verdict gate and its test from the canon
  `planVerdicts` rather than restating a glyph set. The validator builds the mark
  class with each verdict escaped (so `-` is a literal, never a range) and its
  fallback tracks the canon. The conformance suite now asserts every canon verdict
  is accepted on a closed plan and a non-verdict mark is rejected, so it stays
  correct across a vocabulary change.
- 8b0bb06: validate: the plan target verdict vocabulary now holds for every plan, in a play
  or anywhere, whatever its status, not only a `closed` one. A resolved (non-open)
  target must carry a valid verdict; `[ ]` open is allowed until the plan is
  `closed` (a plan is closed only when every target carries a valid marker, no open
  `[ ]` left). Orders are held the same way (no status, so they must complete).
- Updated dependencies [ea7ae45]
- Updated dependencies [9c8c56a]
  - @chbrain/khai-arch@0.1.13

## 0.1.12

### Patch Changes

- d0cd960: validate: gate a closed plan's targets against the canon verdict vocabulary.
  Pull `planVerdicts` from @chbrain/khai-arch (guarded fallback `[x]`/`[F]`/`[?]`)
  and, for a `status: closed` plan, flag any target mark outside that set (`[-]`,
  `[W]`, ...) as an unresolved verdict. `[ ]` stays pending; draft/active plans are
  not held to it; orders keep their existing completion check.
- Updated dependencies [0ad27c2]
  - @chbrain/khai-arch@0.1.12

## 0.1.11

### Patch Changes

- f0720f0: Plan completion is now gated by `status`. Only a `closed` plan must resolve every
  target (no pending `[ ]`); a `draft` or `active` plan is in progress, so an
  in-world plan staged inside a play holds its targets as forward intent rather
  than being failed as incomplete. The `order` type has no status lifecycle, so
  its completion stays mandatory. Mirrors the scope-agnostic plan coda: completion
  is a state a plan reaches, not a precondition every plan must meet.

## 0.1.10

### Patch Changes

- b470ca2: The playhouse registry blurb gate no longer false-fails a valid one-sentence
  description. It counted every "." and rejected anything with more than one, so a
  blurb carrying a decimal ("v1.5"), a file name ("Node.js"), or a lowercase
  abbreviation ("e.g.") was wrongly flagged as multiple sentences. It now detects
  a real sentence boundary (a terminator followed by whitespace and a new
  capitalized word) instead. A lone underscore is also no longer treated as
  markdown, since an underscore in prose is usually an identifier (snake_case);
  bold/italic markers and link brackets still are.
- 549c09b: The CLI now fails loudly on two operator mistakes instead of silently
  proceeding: `--project <path>` errors (exit 2) when the path does not exist,
  rather than walking an empty tree and reporting "all instance files conform";
  and `pack ... --out` with no following value errors instead of silently
  falling back to `<dir>/dist`.
- 113d2d6: Add support for declared titles in playbooks, allowing a localized staging H1 title to match a `declared` frontmatter key while keeping `title` in English for the registry.
- 5f3941d: The plan/order "pending target" check now matches only an actual unchecked
  task-list item. It tested `line.includes("[ ]")`, so any Targets line that
  merely mentioned `[ ]` in prose or a code span (e.g. "use an empty array
  `[ ]`") was miscounted as a pending target and failed a complete plan/order.
  It now anchors to a list marker: `^\s*[-*+]\s+\[ \]`.
- a0c0327: The registry gate's "missing registry.json" error now points at the generator
  (`run khai-tests registry build`), so the (intended) hard requirement is
  actionable rather than just stated. Behavior is unchanged: a playhouse without
  a registry.json still fails.
- 3ab5fdc: The validator no longer crashes on a malformed package.json. readManifest,
  findEnginePackageFor, installedEngineManifests, the CLI's engine banner, and
  engineDocChecks all parsed package.json with an unguarded JSON.parse, so a
  single unreadable or malformed manifest (an installed dependency, or a file
  mid-walk) threw an uncaught exception and aborted the pre-commit gate / project
  validator with a raw stack trace. A shared readJsonOr helper now degrades
  gracefully: a bad installed manifest is skipped, a bad file mid-walk is treated
  as "no manifest here", and a bad package on the engine surface yields a clean
  "cannot read or parse package.json" finding.
- Updated dependencies [ae0c95e]
- Updated dependencies [9965037]
- Updated dependencies [bba3d28]
- Updated dependencies [a837c37]
- Updated dependencies [113d2d6]
- Updated dependencies [37f5dbe]
- Updated dependencies [de6ab9b]
- Updated dependencies [8984450]
- Updated dependencies [272d1dc]
- Updated dependencies [5c0d150]
- Updated dependencies [f50e14f]
- Updated dependencies [11425ea]
  - @chbrain/khai-arch@0.1.8
  - @chbrain/khai-language@0.1.3
  - @chbrain/khai-rules@0.1.5

## 0.1.9

### Patch Changes

- 9baea61: Make playhouse registry build and verify consistent: verify now resolves the
  playbook file with the same `play_*.md` discovery buildRegistry uses and applies
  the same id title fallback, so a freshly built registry.json passes verification
  even when a play's frontmatter omits `title`. buildRegistry now warns (without
  failing) when an extracted blurb won't pass the verify gate, and normalizes
  registry validation results to the standard errors/warnings/audit shape.

## 0.1.8

### Patch Changes

- 5f12684: Implement playhouse registry (registry.json) and play blurb E2E validation gates.

## 0.1.7

### Patch Changes

- cdfbf09: Add auto-scanning of management orders and plans in validateProject, and restore legacy order type validation to validateContentFile.
- Updated dependencies [7cd2eda]
  - @chbrain/khai-arch@0.1.6

## 0.1.6

### Patch Changes

- a38bcf6: governance: integrate order (DOIT) validation and conformance tests
- Updated dependencies [8435643]
  - @chbrain/khai-arch@0.1.5

## 0.1.5

### Patch Changes

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

- Updated dependencies [c5cb182]
- Updated dependencies [7dc7952]
- Updated dependencies [8ab94b7]
- Updated dependencies [b5ab771]
- Updated dependencies [6bffe4e]
  - @chbrain/khai-arch@0.1.3
  - @chbrain/khai-rules@0.1.2

## 0.1.4

### Patch Changes

- 1306d37: validateEnginePackage now reads an engine's composition tree through the canon
  (engineMembers / compositionOrder), so an explicit-members ladder engine
  validates the same way as the anchor+expressions shorthand. Each content file is
  checked against its own member type, the orphan check runs against the member
  set, and the compose smoke runs over the tree leaves. No change for shorthand
  engines (gender normalizes through the identical path).
- 571d736: requirementsFromEngine now reads an engine's normalized member tree, so the
  wiring `link` is shape-agnostic: "anchor" resolves to the root member,
  "expression" to the leaves, "any" to the whole tree. A members ladder (a process
  root with channels and widths) now enforces its persona and Instructions wiring
  the same way the anchor+expressions shorthand does.

## 0.1.3

### Patch Changes

- Updated dependencies [c9eff7b]
  - @chbrain/khai-pack@0.0.3
  - @chbrain/khai-rules@0.1.1

## 0.1.2

### Patch Changes

- a18aabe: Add the **engine kind** of the serve engine: `packEngine(dir)` and a
  `khai-tests pack <engine-dir>` command package a khai content engine as a
  portable zip via `@chbrain/khai-pack`, in the cultures layout (generated README,
  authored REFERENCES, rendered WIRES card, and a license note at the root; the
  member files flat under `engine/`; no package.json, index.mjs, or tests). The
  engine is packaged **through its validator** — a non-conforming engine is never
  shipped.
- Updated dependencies [0d822cd]
  - @chbrain/khai-pack@0.0.2

## 0.1.1

### Patch Changes

- Updated dependencies [2ccfbc2]
  - @chbrain/khai-rules@0.1.0

## 0.1.0

### Minor Changes

- 01e4e73: Introduce the **LORE** reference standard. Every component's `REFERENCES.md`
  now carries four fixed canon chapters, in order, the warrant for the component
  to exist:
  - **L — Line of Work** — what it models, and what it isn't
  - **O — Origin** — the sources it rests on
  - **R — Restrictions** — what it refuses to claim, and to whom it delegates
  - **E — Encoding** — source to constraint, per file

  khai-arch gains `referenceChapters` and `referenceCard(text)` (sibling to
  `engineCard`): it validates the four chapters are present and in order,
  collects any author `### ` subchapters under each (the renderer paginates one
  (sub)chapter per snap), and returns `{ mnemonic, chapters, sections, coda }`.
  gender's `REFERENCES.md` is restructured as the first conformer.

  khai-tests gains the teeth: `validateEnginePackage` runs `referenceCard` over
  every engine's `REFERENCES.md`, so a missing or non-conforming warrant fails the
  suite. The standard is documented as a canon companion in
  `architecture/reference.md`.

### Patch Changes

- 185dc90: Section contract: derive the TO-prefix from the canon instead of hardcoding it.
  The full H2 list spells the type's mnemonic, so a "TO \_\_\_" type carries a two
  section prefix ahead of its chapters (the "T", the group above, and the "O",
  Owner, the origin), while a type whose mnemonic does not begin with "TO "
  (instructions=HACKS, play=ENACTS, engines=WIRE) carries neither -- its chapters
  spell the whole word.

  The kit now pulls the prefix vocabulary from khai-arch (`toPrefix`, guarded with
  a fallback), drops the dead `checkTitle` echo (the T slot is the group above,
  never a re-name of the H1, so its only contract is presence in the H2 set), and
  keeps the Owner value check for engine content. A migration tolerance accepts
  the legacy "Title" spelling of the T slot until the Title -> Taxonomy rename
  lands end to end. Also drops the stray Title/Owner from the instructions wiring
  fixture and adds a regression test for the contract.

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
- 7443622: Retire the Title -> Taxonomy migration tolerance: the kit goes strict. The
  rename has landed end to end (canon, this kit's fixtures, the gender engine
  content), so `validateContentFile` no longer accepts the legacy `Title`
  spelling of a "TO \_\_\_" type's first slot -- the T slot is `Taxonomy`, the group
  above, and `Title` is now drift. Drops the tolerance branch and flips the
  guarded `toPrefix` fallback to `["Taxonomy", "Owner"]`. The kit's own fixtures
  move to `## Taxonomy`, and a regression test pins the strictness (a persona
  spelling the slot `Title` is rejected; `Taxonomy` passes). Stale "Title (T)"
  comments are corrected. The orphaned `checkTitle` echo in khai-rules is left for
  a separate follow-up.
- 88be37f: Add the template conformance test: assert every authoring template shipped by
  `@chbrain/khai-arch` is a valid content instance (`validateContentFile`, no
  `owner` so the check is structural). The loop closes — the kit proves the
  canon's templates, and the templates feed the kit's notion of a valid `<type>`.
- Updated dependencies [ab4667c]
- Updated dependencies [95f4264]
- Updated dependencies [c2f86b5]
- Updated dependencies [34c6d7b]
- Updated dependencies [01e4e73]
- Updated dependencies [2d29311]
- Updated dependencies [ad5cd0c]
- Updated dependencies [67e7925]
- Updated dependencies [73f5f9d]
- Updated dependencies [f17e74e]
- Updated dependencies [7ebebf0]
- Updated dependencies [1996d77]
  - @chbrain/khai-rules@0.0.2
  - @chbrain/khai-arch@0.1.0

## 0.0.11

### Patch Changes

- 77f514f: Close two engine-self gaps. `validateEnginePackage` now regenerates each engine's
  README from its manifest (via the canon's `renderEngineReadme`) and gates on
  drift: a missing or hand-edited README is an error, so the pointer can never
  disagree with the source of truth (deterministic, the answer is in the bytes).
  The advisory docs lane also now flags an en/em-dash in a README or REFERENCES
  doc, holding those files to the house voice ( , ; : () ) the way checkEncoding
  already holds content instances.
- 8803e6c: Add a severity model to wiring enforcement. Each requirement now resolves to a
  level: `audit` (note), `warn` (nudge), or `fail` (gate, the only level that
  exits non-zero). The engine declares its default per requirement
  (`requires[].level`, defaulting to `fail` for back-compat); a world overrides it
  per requirement id via `levels`. `validateInstanceFile` returns leveled findings
  and `validateProject` buckets them into errors / warnings / audit. The CLI prints
  `✖` for failures, `⚠` for warnings, and `·` for audit notes, exiting only on
  failures. This is the same kit invoked three ways: audit, self-audit, or CI.

## 0.0.10

### Patch Changes

- c78f4cd: `engineDocChecks` now voice-checks the WIRES card prose too. The card lives in
  `package.json` (JSON), outside the `.md` doc-checks, yet it is what the website
  renders, so a dirty card (clause dash or em/en-dash) previously slipped through
  and had to be caught by hand. It is now an advisory warning per chapter
  (`package.json#card.<chapter>`), so "cards stay clean" is self-enforcing for
  every engine instead of manual. Gender (already clean) stays at zero warnings.
- cebda9f: `checkClauseDash` no longer flags a spaced hyphen between two numbers
  (`400 - 500`, `2006 - 2012`): the CVI sanctions it for numeric ranges. A
  spaced hyphen anywhere else (including number-to-word) is still flagged as a
  clause dash.
- Updated dependencies [e4d7aef]
- Updated dependencies [cebda9f]
  - @chbrain/khai-arch@0.0.10

## 0.0.9

### Patch Changes

- 363ba52: Add structural rule atoms for the engine docs standard (not yet wired into
  `validateEnginePackage` - they land with the severity dimension so they can ramp
  from advisory to fail without breaking installed engines):
  - `rules.checkLinkText(text)` - a link's text is read literally by an LLM, so it
    must be a natural name, never a filename. Flags empty link text and any label
    that ends in a file extension or equals the target's basename
    (`[position_gender.md](...)` fails; `[gender](position_gender.md)` passes).
  - `rules.looseFiles(files)` - the "no file hangs loose" check (the Obsidian
    graph): given `[{ name, text }]`, returns the files with no markdown-link edge
    to any other file in the set. Backtick mentions are not edges, which is why
    REFERENCES must _link_ the member files, not name them in backticks.
  - `rules.checkClauseDash(text)` - the spaced hyphen " - " is the LLM's em-dash in
    disguise, not the house voice ( , ; : () ). Flags the inline clause dash while
    exempting line-start list markers (`*` and `-`) and `---` fences. (em/en-dash
    stay in `checkEncoding`.)
  - `rules.checkNoFooter(text)` - flags a trailing `_..._` version/attribution
    stamp; metadata belongs in YAML frontmatter, not a footer.
  - `rules.checkHasFrontmatter(text)` - a doc whose metadata must be machine-
    readable needs a leading `---` YAML block, not a `**Bold:**` header.

- 51cfc02: Wire the engine docs standard into `validateEnginePackage` as an advisory lane.
  `engineDocChecks(pkgDir)` runs the five doc-check atoms (clause-dash, link-text,
  no-footer, frontmatter, loose-file) over a package's own `.md` files and
  surfaces them as `warnings`, never `errors`: a downstream consumer is informed,
  not failed, while the world migrates (the audit/warn level of the enforcement
  model). `FileResult` gains an optional `warnings` field; the CLI prints them
  with a `⚠` marker and never exits non-zero on them. Our own conformance suite
  holds engines to zero warnings, so gender (already compliant) proves the wiring.
- 295d0c3: Document the enforcement model in the README: the kit as a "linter for worlds"
  (engines are plugins, the dependency graph is the law set), the audit/warn/fail
  level axis (ESLint / `npm audit` vocabulary, engine default + world override),
  and the two lanes - a structural linter lane (checks the declaration) and an
  NLP-review lane (checks the embodiment, caps at warn). Doc only; clearly marks
  what the kit does today (linter lane, single implicit `fail` level) vs the
  target it describes.
- Updated dependencies [9f0dc51]
- Updated dependencies [abf5cdb]
  - @chbrain/khai-arch@0.0.9

## 0.0.8

### Patch Changes

- 5466259: Enforce the WIRES card. `validateEnginePackage` now calls khai-arch's
  `engineCard(manifest)`, so every engine package must declare a valid card (the
  five WIRES chapters) or fail conformance - the canon owns the shape, the kit
  enforces it. Adds a test proving a cardless engine is rejected; the real gender
  engine passes.

## 0.0.7

### Patch Changes

- 5be8d08: Encoding rule: the sanctioned dash is the spaced hyphen `-`, never `--`.
  `checkEncoding` already rejected en/em-dashes but pointed authors at `--`,
  which markdown renders back into an en-dash (the disguised dash). The guidance
  now reads `use ' - '`, matching the canon's own encoding rule. (khai-arch's
  encoding test is tightened in the same change to forbid the en-dash character
  too, not only the em-dash.)

## 0.0.6

### Patch Changes

- Updated dependencies [1fd1552]
  - @chbrain/khai-arch@0.0.8

## 0.0.5

### Patch Changes

- Updated dependencies [f34d674]
  - @chbrain/khai-arch@0.0.7

## 0.0.4

### Patch Changes

- Updated dependencies [e3fc4d4]
  - @chbrain/khai-arch@0.0.6

## 0.0.3

### Patch Changes

- Updated dependencies [dbb3892]
  - @chbrain/khai-arch@0.0.5

## 0.0.2

### Patch Changes

- Updated dependencies [b8549f6]
  - @chbrain/khai-arch@0.0.4

## 0.0.1

### Patch Changes

- Initial release: the khai conformance kit — rule atoms and
  `validateContentFile` / `validateEnginePackage` / `discoverEnginePackages`,
  plus a `khai-tests` CLI, validating content packages against the
  architecture canon. Depends on `@chbrain/khai-arch`.

- Add the consumer surface for projects that _use_ engines:
  `validateProject` / `validateInstanceFile` / `wiringRequirements`, plus the
  `checkWiring` rule atom. Engines declare wiring requirements in their manifest
  (`requires: [{ on, section, link }]`); the kit discovers a project's instance
  files by their `khai:` frontmatter and enforces that each instance links the
  required engine target in the required section — e.g. every persona must link
  a gender expression under Projection. Engine declares, kit enforces, mirroring
  arch-declares-types / kit-enforces-them. `validateContentFile` now treats
  `owner` as optional so a consumer's own instances validate structurally
  without asserting khai ownership.

- Add a `--project [dir]` mode to the `khai-tests` CLI for downstream repos:
  it reads the installed engines' manifests from `node_modules/@chbrain/*`,
  discovers the repo's instance files by their `khai:` frontmatter, and enforces
  the canon plus every engine wiring requirement, exiting non-zero on failure
  (drops straight into CI or a pre-commit hook). The existing file-path mode
  (engine-package validation) is unchanged. Wiring links into installed engine
  content are exempt from the local broken-link check, since they resolve via
  npm rather than being co-located. Adds a README documenting both modes.
