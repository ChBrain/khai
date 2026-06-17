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

# Order 1: Establish the Director and the Venue Machinery

> **Repo: `khai` (monorepo).** Order 1 of 4 — see
> [00-program.md](00-program.md). Foundational; gates Orders 2–4. On execution,
> move to `khai/packages/khai-plays/management/orders/` (or run from here).

## Direction

A khai play is a **score**; turning it into a told story is **authorship**, which
the Roadie may not do — he _Loses_ the position the moment he authors. So the
chain needs a **Director**: a creative position, held as a **portable skill**. The
Venue and the touring machinery already exist (the Roadie, `khai-tour`,
`plan_go_on_tour`); what is missing is the **Grimoire Venue profile** and the
**Director** that feeds it. This order builds the khai-side foundation that the
Writing Archive (Order 2) and the houses (Order 3) consume.

## Orders

1. **Director position** — land `position_director.md` in the blueprint at
   `packages/khai-plays/management/`; a **draft** ships with this program at
   [drafts/position_director.md](drafts/position_director.md). The shared
   position; the persona is **cast per house** (no name bound here).
2. **Director plan (blueprint)** —
   `packages/khai-plays/management/plan_stage_the_score.md`: the Director's
   standing mandate — render a score → a **venue-neutral performance**; **revise**
   an existing result. Propagates to houses.
3. **Director skill** — `packages/khai-skills/src/khai-director/SKILL.md`
   (`license: CC-BY-NC-4.0`), self-contained and portable (runs in any LLM, no
   khai-code dependency). Two modes: **produce** (play + files → performance) and
   **revise** (open an existing result → edit). Output = the **Standard**: story
   body + front-of-house (byline, blurb, content-warnings) + licence block +
   routing intent (Venue + space).
4. **Grimoire Venue profile + assemble/publish** for `khai-tour`, built from
   `thegrimoire.art/skill.md`: `Authorization: Bearer <key>`, base
   `https://thegrimoire.art/api/agent/`, methods POST/GET/**PATCH**/DELETE, the
   ten spaces, the publish post shape, carries a licence field. **Spend
   boundary:** `publish`/`patch`/`delete` only; `tip`/`comment`/`vote`/`follow`
   never without explicit per-act human authorization and a hard cap.
5. **Update `plan_go_on_tour.md`** — source the deployment **from the archive** (a
   stored venue-neutral result), compose Standard + Adaption, and write the
   placement back to the ledger.

## Implementation

- Lanes: `skills/<topic>` for the skill; the blueprint-management lane for the
  position/plan; the `khai-tour` package lane for the profile.
- **Source and tests are separate PRs**; every PR needs a **changeset**; open as
  **draft** until whole; never merge; never `--no-verify`.
- The skill declares `CC-BY-NC-4.0`; the package declares
  `SEE LICENSE IN LICENSE and LICENSE-CODE`.

## Targets

- [ ] `position_director.md` landed in the blueprint (draft provided) — no bound
      persona
- [ ] `plan_stage_the_score.md` present in the blueprint
- [ ] Director **skill** present in `khai-skills`, portable, produce + revise,
      outputs the venue-neutral Standard
- [ ] Grimoire **Venue profile** in `khai-tour`: Bearer auth, `api/agent/*`,
      POST/PATCH/DELETE, ten spaces, publish shape, licence field, spend boundary
- [ ] `plan_go_on_tour.md` updated to source from the archive

## Feeds

Orders 2, 3, and 4 all consume this. Nothing here depends on `khai-writing`.

Because the position and plan land in the **blueprint** (beside the Roadie and
touring kit already there), they propagate to houses the chain way: **khai-stage**
gives them to every **future house** at raising, and **existing houses** backfill
them through the Roadie's `plan_set_up_a_house` (Order 3, step 1). This is why the
program never enumerates houses — the Director becomes a chain position the moment
it lands here.
