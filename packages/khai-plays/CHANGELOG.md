# @chbrain/khai-plays

## 0.0.9

### Patch Changes

- 5f9c660: List the H.C. Andersen house on the bill: register its card (repo the house, package the programme).

## 0.0.8

### Patch Changes

- efa887c: management: give the Chain Change Landing play an English `description:`. The
  canon now makes the play description a required frontmatter key (the English
  shelf logline); this management discussion play needs one like any other play.

## 0.0.7

### Patch Changes

- c254fec: Add the first discussion-as-Play fixture to the chain's management:
  `management/discussions/chain_change_landing/`. A management discussion staged as
  a khai Play, proving the existing play conformance standard validates it
  unchanged. It casts the Play (ENACTS) with four plots chained as PDCA
  (Plan/Do/Check/Act), the change as the Piece, khai and the registry as the two
  Places, chain management as the Process, and reuses the chain's Personas
  (Nicias, Pericles, Agatharchus) and Positions (Choregos, Roadie). The positions'
  standing plans collide in the Plan plot and the Act plot emits the order; the
  plans that lose stay standing for the next turn.
- 2f01576: Add the `management/orders/` home to the chain, beside `management/discussions/`.
  Parked management orders (Plan files, per DISCUSSIONS.md section 5) live here; the
  voice layer already references the path, this gives it a home.
- acf3ad6: Add the Roadie to the chain's management, beside the Choregos. The chain needs a
  roadie as well as each house: `management/position_roadie.md` (the cross-cutting
  technical crew that stocks every house and tours the chain's work) and a named
  persona, `persona_agatharchus.md` (the scene-painter who set the world up and
  wrote the method down so it could be repeated). Completes position + named persona
  for the Roadie at chain scope.
- f7aeafc: Fix conformance in the chain's management cast. The personas Nicias, Pericles,
  and Agatharchus declared `type: historical`, which is not in the canon's allowed
  set; set them to `type: real` (they are real historical figures). Replace the
  em-dashes in `persona_nicias.md`, `persona_pericles.md`, and
  `position_choregos.md` with ' - ', which the encoding check requires. All
  instance files in the package now conform (`khai-tests --project`).
- 253cb62: Move the chain management instructions inside `management/`, mirroring a house:
  `management_instructions.md` and `discussion_instructions.md` now live in
  `packages/khai-plays/management/` beside the cast, not at repo root. So the chain
  management is self-contained and the management guard (validateProject over
  `management/`) covers the instructions too, the same as a house. The internal
  `docs/BRANCHING.md` reference becomes plain text (no cross-tree link).
- 503d8de: Protect the chain management in CI: a test runs the kit (`validateProject`) over
  `management/`, so the chain cast conforms and the orphan-position gate holds
  (a needed position without a persona is a failure). Same call, same wall as a
  house uses, run by `npm test`.
- b36e8ca: Secure the green lights in the chain Roadie's plan: Drives now states that
  "current" means dependencies up to date and the security panel clean, and that
  the Roadie guards both as standing tasks. A chain with a red dependency or an
  open security finding is not current.
- 03e13bf: Slim the chain Roadie's Orders to drive his three plans (now merged) instead of
  restating their detail: Orders links Keep Clean, Set Up a House, and Go on Tour,
  each run on its cue. The checklists live in the plan files; the position names
  what he drives, the plans say what done is.
- c7ee3a7: Secure the staging / setup rules in the chain Roadie's plan: Orders now spell
  out the inbound Stage job, set up the management structure (voice layer,
  Discussion Standard, the company, the discussions and orders homes),
  re-materialize engines on change, and emit the house registry so a raised house
  is green on raise, refreshed when the blueprint changes.
- 827f9f4: Give the chain Roadie his three standing plans (mandates, each a distinct
  checklist the position drives): `plan_keep_clean` (deps, security, conformance,
  gates), `plan_set_up_a_house` (stock the stack, stamp the management structure,
  materialize engines, emit the registry), and `plan_go_on_tour` (compose, fit the
  venue, build, deliver). Standing templates (status active, open targets); a run
  instantiates one and closes its targets. Distinct from the khai-roadie skill (the
  voice): these are the checkable lists the Roadie guards.

## 0.0.6

### Patch Changes

- a7a67d1: Register the Kleist house in the bill: add `registry/kleist.json` (the house
  card for `@chbrain/khai-plays-kleist`) and rewrite the generated README from the
  registry. khai now holds a card for the Kleist productions alongside Buechner
  and Grimm.

## 0.0.5

### Patch Changes

- bec048e: A malformed registry card no longer crashes module import (and with it the CLI
  that imports the module), which previously left no way to run the tool to fix
  the card. The `houses` export is now resilient at import (a bad card yields an
  empty bill rather than a thrown import), while `loadRegistry()` stays strict and
  the CLI's render/register path catches it and blocks with a clear exit-1 message
  naming the offending card -- so a bad card still blocks until fixed, it just no
  longer throws on import. Malformed-JSON errors now name the file too.

## 0.0.4

### Patch Changes

- df131a8: Add management voices: choregos position, Nicias and Pericles personas.

## 0.0.3

### Patch Changes

- 87a4126: governance: enforce English language validation for play registry blurbs and convert Büchner blurb to English.

## 0.0.2

### Patch Changes

- 39c5111: Register khai-plays-buechner in the plays registry to make it available in the bill.
- a29f1e7: Register the Grimm production house in the play registry: add the `grimm` card (programme `@chbrain/khai-plays-grimm`) and rewrite the bill.

## 0.0.1

### Patch Changes

- 5443692: Give khai-plays a `register` and `render` CLI, and make the README a generated
  view of the bill. `npx @chbrain/khai-plays register <source> --blurb "..."`
  writes `registry/<slug>.json` and rewrites `README.md` from the whole registry;
  `render` rewrites the README alone, so a hand-added card or a drift check can
  refresh the human view without touching the data. A card names a house and its
  programme: `repo` is the house (required, since the repository is the house and
  a house with no resolvable home is not yet a production) and `package` is the
  programme the website pulls for that house's plays, with `title`/`blurb` for the
  bill. Both `repo` and `package` default from the slug, so the impresario passes
  only `--blurb`. A test asserts `README.md` matches `renderReadme(houses)`, so the
  bill and its README can never drift.
- e5a8ffd: Add khai-plays: the play registry, the bill. khai holds the index of houses, not
  the productions. Each house (a khai-plays-<source> collection) registers one
  entry under registry/<source>.json; loadRegistry reads and validates them sorted
  by id, and a malformed card fails the build. The website reads the bill and
  renders one card per house with its productions underneath. Pure node, no canon
  dependency: a card is metadata, not khai content.
