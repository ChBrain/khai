---
khai: order
title: "Onboard a Producing House"
language: english
license: CC-BY-NC-SA-4.0
stamp:
  owner: Choregos (Nicias and Pericles)
  version: v0.1.0
  date: "2026-06-17"
status: active
---

# Order 3: Onboard a Producing House

> **Repo: each play-house** (run once per house). Order 3 of 4 — see
> [00-program.md](00-program.md). On execution, move a copy to the house's
> `management/orders/`. **Repeatable and house-agnostic:** it is defined against
> the blueprint, not a named house, so the four known houses and every future
> house run the _same_ order. **Grimm is the first instance (pilot).** This
> **supersedes** `khai-plays-grimm/management/orders/order_260617_grimoire.md`.

## Direction

The machinery (Orders 1, 2, 4) is built once, chain-wide. This order brings **one
house** to producing state and is run once per house. A house produces when it can
render a score into writing and deposit it: that needs the **Director** (every
house lacks it) and the **Roadie + touring kit** (some houses lack it). Both are
**blueprint-owned**, so onboarding is the same act everywhere — close the gap from
the blueprint, cast the house's own personas, register, produce, deposit.

## Readiness (known houses, 2026-06-17)

| House               | Playwright          | Roadie + touring     | Director | Gap to close                |
| ------------------- | ------------------- | -------------------- | -------- | --------------------------- |
| **HCAndersen**      | ✓                   | ✓ (Vilhelm Pedersen) | ✗        | Director only               |
| **Grimm** _(pilot)_ | ✓ (Jacob & Wilhelm) | ✗                    | ✗        | Roadie + touring + Director |
| **Kleist**          | ✓ (Kleist)          | ✗                    | ✗        | Roadie + touring + Director |
| **Büchner**         | ✓ (Büchner)         | ✗                    | ✗        | Roadie + touring + Director |

**Future houses** are not listed and need not be. A house raised by **khai-stage**
after Order 1 is born with Director + Roadie + touring from the blueprint; it runs
steps 2–4 only. The matrix is a snapshot, not the contract — the contract is "sync
from the blueprint, then cast."

## Orders (parameterised by `<house>`)

1. **Ensure the chain positions** (close the gap from the blueprint
   `khai/packages/khai-plays/management/`). The house must carry: the **Director**
   (position + `plan_stage_the_score`) and the **Roadie** (position +
   `plan_go_on_tour`, `plan_keep_clean`, `plan_set_up_a_house`).
   - _Future house:_ khai-stage delivered these at raising — nothing to do.
   - _Existing house:_ the Roadie's **Set Up a House** (inbound sync) backfills
     whatever the readiness matrix shows missing (Director for all four;
     Roadie + touring for Grimm/Kleist/Büchner).
2. **Cast the house's own personas** (per-house rule; Choregos stays shared):
   - its **Director** persona — distinct to the house's source, the Choregos' call;
   - its **Roadie** persona, if not already cast — distinct, not the blueprint's
     Agatharchus (HCAndersen already has Vilhelm Pedersen).
3. **Register the house's Director as a Venue agent** (Grimoire: name,
   description, home space); capture the once-shown key as
   `GRIMOIRE_API_KEY_<HOUSE>` into the Archive Roadie's secret store (env, never
   committed). Post under the Director identity; credit the public-domain source;
   no impersonation.
4. **Produce and deposit.** With the Director **skill**, render one ready,
   dark-enough play → a **venue-neutral performance** (the Standard: story +
   front-of-house + licence block + routing intent), and **deposit** it as a PR
   into `khai-writing` at `writing/<house>/<play>/<result>.md`. Stop at deposit.

## Implementation

- Branch lanes: a house's `management/**` is `governance/`; personas and
  position/plan files land there. Never `--no-verify`; open the PR, stop.
- The **deposit** is a cross-repo PR into `khai-writing` — not a change in the
  house repo. The house produces the file; the PR is opened on `khai-writing`.
- The performance is **venue-neutral** — one result the Archive Roadie can adapt
  to any Venue. Do not bake a Grimoire-specific post here.
- Licence block, from the play `stamp` and the Estate:
  ```
  — after <public-domain source>, in the public domain
    this staging © KAI HACKS AI, licensed CC-BY-NC-SA-4.0
  ```

## Targets (per house)

- [ ] gap closed from the blueprint: Director (+ Roadie/touring if missing)
- [ ] house's own **Director** persona cast (+ **Roadie** persona if missing)
- [ ] Director registered as a Venue agent; `GRIMOIRE_API_KEY_<HOUSE>` captured to
      env (not committed)
- [ ] one play rendered → venue-neutral performance → **deposited** as a PR into
      `khai-writing`

## Application order

**Grimm first** (pilot). Then any house, in any order — HCAndersen is the shortest
(Director only); Kleist and Büchner mirror Grimm. Each future house runs this same
order the day it is raised.

## Depends on

Order 1 (Director in the blueprint + the skill) and Order 2 (`khai-writing` exists
to deposit into). Run once per house; each deposit feeds Order 4.
