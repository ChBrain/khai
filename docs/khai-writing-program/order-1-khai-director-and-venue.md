---
khai: order
title: "Establish the Director and the Venue Machinery"
language: english
license: CC-BY-NC-SA-4.0
stamp:
  owner: Choregos (Nicias and Pericles)
  version: v0.1.0
  date: "2026-06-17"
status: active
---

# Order 1: Establish the Director Skill and the Venue Machinery

> **Repo: `khai` (monorepo).** Order 1 of 4 — see
> [00-program.md](00-program.md). Foundational; gates Orders 2–4. On execution,
> move to `khai/packages/khai-plays/management/orders/` (or run from here).

## Direction

A khai play is a **score**; running it as a living production and capturing a run
is **authorship**, which the Roadie may not do — he _Loses_ the position the
moment he authors. So the
chain needs a **Director**: a creative position, held as a **portable skill**. The
Venue and the touring machinery already exist (the Roadie, `khai-tour`,
`plan_go_on_tour`); what is missing is the **Grimoire Venue kind** and the
**Director** that feeds it. The Director **position** and its standing plan are
landed in the blueprint by **Order 0** (canonicalization); this order builds the
two **executable** halves that consume them, and that the Writing Archive
(Order 2) and the houses (Order 3) then use.

## Orders

> The Director **position** and its standing plan `plan_stage_the_score` are
> landed in the blueprint by **Order 0**. This order builds the two **executable**
> halves.

1. **Director skill** — `packages/khai-skills/src/khai-director/SKILL.md`
   (`license: CC-BY-NC-4.0`), self-contained and portable (runs in any LLM, no
   khai-code dependency). A **control loop** over the board the play casts:
   observe behaviour (response and silence), redirect per element idiom, request
   cast adaptation as a sanctioned call, and **capture** a chosen run. The play
   (what happens) stays fixed; the production (how it runs) is the Director's. The
   captured run is the **Standard**: the run made flesh + front-of-house (byline,
   blurb, content-warnings) + licence block + routing intent (Venue + space).
   Re-running the score yields another reading.
2. **Grimoire Venue — a new Venue _kind_** for `khai-tour`. The existing venues
   are `interactive` (LLM deployment) and `publication` (rendered artifact) —
   both **stateless, pull/format, no auth**. The Grimoire needs a **third kind**:
   an **authenticated, stateful live/agent venue** — `Authorization: Bearer <key>`,
   base `https://thegrimoire.art/api/agent/`, POST/GET/**PATCH**/DELETE, the ten
   spaces, a publish post shape carrying a licence field, and a **persisted remote
   post-id lifecycle**. This is a genuine extension of the profiles model + the
   composer — and the first **stateful** behaviour in a package that is
   deterministic/stateless today — not a one-line profile add. **Spend boundary:**
   `publish`/`patch`/`delete` only; `tip`/`comment`/`vote`/`follow` never without
   explicit per-act human authorization and a cap.

The ship-from-archive + **ledger write-back** is the **Archive Roadie's**
behaviour and lives in `khai-writing` (Orders 2 and 4) — _not_ in the house's
`plan_go_on_tour`, so the deposit boundary holds (the house ends at deposit).

## Implementation

- Lanes: `skills/<topic>` for the skill; the `khai-tour` package lane
  (`tour/<topic>`) for the new Venue kind. (The position/plan are Order 0's.)
- **Source and tests are separate PRs**; every PR needs a **changeset**; open as
  **draft** until whole; never merge; never `--no-verify`.
- The skill declares `CC-BY-NC-4.0`; the package declares
  `SEE LICENSE IN LICENSE and LICENSE-CODE`.

## Targets

- [ ] Director **skill** present in `khai-skills`, portable, a control loop over
      the board (observe, redirect, adapt-the-cast, capture), outputs the
      venue-neutral Standard (a captured run)
- [ ] `khai-tour` gains a **third Venue kind** (authenticated/stateful): Bearer
      auth, `api/agent/*`, POST/PATCH/DELETE, ten spaces, publish shape, licence
      field, persisted post-id lifecycle, spend boundary
- [ ] (position/plan are Order 0's; ledger write-back is the Archive Roadie's,
      Orders 2/4 — _not_ landed here)

## Feeds

Orders 2, 3, and 4 consume the **skill** and the **Venue kind**. Nothing here
depends on `khai-writing`. (The Director **position/plan** are landed and
propagated by Order 0 — that is what gives every present and future house the
Director without this program enumerating houses.)
