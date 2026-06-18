---
khai: plan
title: "Program: The Writing Archive"
language: english
license: CC-BY-NC-SA-4.0
stamp:
  owner: Choregos (Nicias and Pericles)
  version: v0.1.0
  date: "2026-06-17"
status: active
---

# Program: The Writing Archive

The plan file that connects the orders. Each order is self-contained and homed to
the repo that executes it; this file holds the shape, the order DAG, the sequence,
the open decisions, and the constraints that run through every order. Read this
first, then the orders in sequence.

> **Parked for now: the Grimoire / push path.** The external Venue (the Grimoire)
> and everything that exists only to feed it are **deferred** — the Grimoire Venue
> kind in `khai-tour` (Order 1, step 2), the Archive Roadie's shipping
> (POST/PATCH/DELETE), the ledger as an active store, the agent registration
> (Order 3, step 3), and the whole first tour (**Order 4**). The active program is
> the **pull path**: a house's Director runs a play and **captures a run**, deposits
> it to `khai-writing`, and the archive ships it as a **consumable package** that
> own surfaces (the website) render. Produce → deposit → catalogue → pull-render.
> The push design is kept in these files (struck through as parked, not deleted) so
> it can be picked up when an external Venue returns; nothing here builds against
> the Grimoire API until then.

## For the session that takes this

You are the executing session. This folder is the **whole program** — take it end
to end.

- **Access you need:** `khai`, the four `khai-plays-*` houses (grimm, kleist,
  buechner, hcandersen), and `khai-writing` (the archive repo — already a stub
  with a `README`; Order 2 fleshes it out). `website` is referenced but not
  modified.
- **Sequence:** **0 → 1 → 2 → 3** (Order 3 repeats once per house, Grimm first);
  **Order 4 is parked** with the push path. The DAG and overlaps are in _The
  orders_ below.
- **Place each order in its repo's `management/orders/` before executing it** —
  every order opens with a staging note saying which repo and where. Order 3 is
  copied into each house as it is onboarded.
- **Branch discipline:** never `claude/*`. Edit the working tree, then
  `npx khai-guard branch <topic>` per repo to let the guard compute the lane.
  Split by lane; source and tests are separate PRs; every PR a changeset; open as
  **draft** until whole; **never merge** — open the PR and stop.
- **Nothing here is committed.** These files are the brief, not landed work.
- **Clear the open decisions with the human first** (see _Open decisions_):
  the Archivist name and whether the management gate is folded into `test` or
  surfaced as a named check. (The Grimoire identity model and auto-repost default
  are **parked** with the push path.)

## The shape (why this exists)

Three stores, three questions:

| Store                    | Holds                                                | Answers                                                     |
| ------------------------ | ---------------------------------------------------- | ----------------------------------------------------------- |
| House `registry.json`    | the plays a house **offers** (scores)                | "what can this house stage?"                                |
| Chain registry (khai)    | all houses                                           | "what houses exist?"                                        |
| **`khai-writing`** (new) | the **writing the plays produced** (+ where it went) | "what did we make?" (and, when push returns, where it went) |

A **play is a score** (plots, elements — the machinery, in the houses). The
**writing is the result** (a **captured run** — one production a Director ran out
of a score and chose to make flesh). The houses produce _plays_; `khai-writing`
holds the _writing those plays produced_.
The **Director is the bridge**. `khai-writing` is chain infrastructure — one repo
for all houses, like `website`. Plain on the tin; its Estate in the voice is the
**Metroon**, the archive that kept the authoritative play-texts.

## Two Venues, two paths

The writing reaches an audience two ways, and the brief keeps them distinct. **The
pull path is the active program; the push path is parked** (see the banner above).

- **Pull — the package (npm Venue) — ACTIVE.** `@chbrain/khai-writing` is
  `npm install`-ed and rendered like `@chbrain/khai-plays-*`; **the website is the
  npm-pull Venue**. No API, no auth, no Roadie — a consumer reads the package's
  built, shipped, and exported discovery index (the same `exports`/`files`/registry
  mechanics the houses use, the registry-packaging fix of #482 _not_ re-trodden).
  "On our own surfaces" is free once the package exports cleanly.
- ~~**Push — the Grimoire (API Venue) — PARKED.** The Archive's Roadie ships a
  result to an external Venue over the authenticated, stateful API kind (Order 1)
  and records the placement in the **ledger**. The ledger tracks _external_
  placements only.~~ Deferred until an external Venue returns; the ledger ships but
  stays dormant.

So `khai-writing` is **both an archive and a consumable package**: Order 2 raises
it as a first-class package (the pull Venue, active). Its Roadie ~~ships from it
(the push Venue)~~ is cast but idle while push is parked. The website surface that
renders it is `website`-repo work, mirroring the plays surface.

## The company

| Position             | Persona                    | Cast                                                          |
| -------------------- | -------------------------- | ------------------------------------------------------------- |
| **Director**         | the house's own            | **per house** (like the Playwright)                           |
| **Archivist**        | **Callimachus** (proposed) | **single**, for the whole archive (like Lessing in `website`) |
| **Archive's Roadie** | its own                    | a Roadie cast for `khai-writing`                              |
| **Choregos**         | Pericles / Nicias          | **shared** — the one exception; the chain inside the house    |

- **Director** — portable creative **skill**: a control loop that **runs a score
  as a living production** (observe the board, redirect per element, request cast
  adaptation) and **captures** a chosen run as a venue-neutral result; re-running
  the same score yields another reading. Authorship of the production, not of the
  play. Deposits to `khai-writing`. Runs in any LLM, no khai-code dependency.
- **Archivist (Callimachus)** — keeps results and catalogues them (the built
  discovery index); holds the **ledger** (what exists, where shown — dormant while
  push is parked). Custody + provenance. Never ships.
- **Archive's Roadie** — cast but **idle while push is parked**. Its work (sources
  a result, adapts to a Venue, drives ~~**POST / PATCH / DELETE**~~, writes
  placements back to the ledger) resumes when an external Venue returns.

**Handoff boundary:** a house's responsibility ends at **deposit**. Houses
produce and deposit; `khai-writing` keeps and catalogues (and, when push returns,
ships and tracks).

## The lifecycle

Active (pull) path:

```
produce    → Director runs the score as a living production, captures a run → venue-neutral result, deposits to khai-writing
catalogue  → archive builds the discovery index; the package ships it (exports/files)
render     → the website npm-installs the package and renders the run on its own surface (the npm-pull Venue)
re-capture → Director re-runs the score, captures again → re-deposits (same reading is a revision; a new reading is a new result; git keeps the history)
```

Parked (push) path — resumes when an external Venue returns:

```
publish    → Archive Roadie adapts to Venue profile, POSTs, records placement in the ledger
re-publish → Archive Roadie PATCHes the recorded post-id in place   (NO auto-repost — human call)
retire     → Archive Roadie DELETEs, marks the placement retired
```

Capture once, render (and, when push returns, tour/patch) many. Standard +
Adaption: the Director deposits the **Standard** (venue-neutral captured run); a
Venue composes its **Adaption** at render/ship time — the website does this for
the pull path today; the Roadie will for push when it returns.

## The orders (the DAG)

| #     | Order                                                                                                                | Repo (executes)                              | Depends on              |
| ----- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| 0     | [Converge the houses onto the shared management structure](order-0-converge-management.md) _(substrate, governance)_ | `khai` + each `khai-plays-*`                 | —                       |
| 1     | [Establish the Director and the Venue machinery](order-1-khai-director-and-venue.md)                                 | `khai`                                       | 0 (blueprint canonical) |
| 2     | [Raise the Writing Archive](order-2-raise-khai-writing.md)                                                           | `khai-writing` (new)                         | 1 (the skill)           |
| 3     | [Onboard a producing house](order-3-onboard-producing-house.md)                                                      | each play-house (**per house**, Grimm first) | 1, 2                    |
| ~~4~~ | ~~[The first tour (dry-run → live)](order-4-first-tour.md)~~ — **PARKED** (push path)                                | `khai-writing`                               | 2, 3                    |

**Sequence.** Order 1's **Director skill** is foundational and gates the rest; its
**Grimoire Venue kind** (step 2) is **parked**. Order 2 raises the repo and ships
it as a **consumable package** (the pull Venue) — it no longer waits on a Venue
profile to be useful. Order 3 needs the Director skill (1) and a place to deposit
(2). **Order 4 (the first tour) is parked** with the push path. So the active
spine is: **1 (skill) → 2 (package) → 3 (produce + deposit) → pull-render**.

Each subsequent producing house repeats Order 3; the archive (2) is built once.
The tour (4) waits for an external Venue.

## Houses: scope and scaling

The program names **no house in its machinery** — Orders 1 and 2 (and the parked 4)
are house-agnostic; Order 3 is a repeatable per-house template. Houses differ only
in how much of the blueprint they have already pulled.

| House           | Roadie + touring     | Director | Order 3 work                                           |
| --------------- | -------------------- | -------- | ------------------------------------------------------ |
| HCAndersen      | ✓ (Vilhelm Pedersen) | ✗        | cast Director, produce, deposit                        |
| Grimm _(pilot)_ | ✗                    | ✗        | backfill Roadie + touring, cast both, produce, deposit |
| Kleist          | ✗                    | ✗        | backfill Roadie + touring, cast both, produce, deposit |
| Büchner         | ✗                    | ✗        | backfill Roadie + touring, cast both, produce, deposit |

**Phase 0 (the substrate).** Before any feature work, the houses **converge onto
the shared management structure** — see
[order-0-converge-management.md](order-0-converge-management.md): one blueprint
core, local personas + local plans the only differences, held by a gate
(`khai-tests management check` inside `test`). Once a house is converged, Order 3
step 1 is already satisfied. Convergence is governance and reviews on its own,
separate from this feature.

**Why this also covers future houses.** The Director, the Roadie, and the touring
kit are **blueprint-owned** (`khai/packages/khai-plays/management/`). Order 1 adds
the Director there, beside the Roadie that already lives there. So:

- a **future house** raised by **khai-stage** is born with all of it — it runs
  Order 3 steps 2–4 only (cast personas, register, produce, deposit);
- an **existing house** backfills the blueprint additions through the Roadie's own
  **`plan_set_up_a_house`** (inbound sync) — Order 3 step 1.

The contract is "sync from the blueprint, then cast," not a list of houses. The
readiness matrix is a snapshot for today's four; it goes stale and that is fine.

## Open decisions (lock as each order reaches them)

1. **Archivist's name** — Callimachus proposed (the _Pinakes_ cataloguer).
2. **Management-gate visibility** — `khai-tests management check` folded into
   `test` (recommended) vs a named `khai-management` required check (Order 0).

_Parked with the push path:_ ~~**Grimoire identity model**~~ (per-house agents vs
one chain agent) and ~~**auto-repost on edit**~~ (stage + confirm every ship) —
decided when an external Venue returns.

## Cross-cutting constraints (every order)

- **Branch block (active).** `claude/awaiting-instructions-7mwlnd` is rejected by
  the guards (lane is computed, never `claude/*`). All staged work is local and
  uncommitted until squared — make edits, then `npx khai-guard branch <topic>`
  per repo.
- **khai PR rules** — never `--no-verify`; source and tests are **separate PRs**;
  every PR needs a **changeset**; never merge (open the PR, stop); **draft** until
  whole; engine/content stays in its lane.
- **Secrets** never committed — only variable names.
- _Parked with the push path (apply when an external Venue returns):_
  ~~**Spend boundary** — publish (and patch/delete) only; `tip` (money out),
  `comment`, `vote`, `follow` gated behind explicit per-act human authorization and
  a hard cap.~~ ~~**Grimoire ToS** (Gryfin LLC, 2026-03-29) — display-licence only,
  no ownership claim → the house keeps control; owner accountable for all the agent
  publishes; keep keys secret; no impersonation; 18+.~~

## Staging

These files live in `khai/docs/khai-writing-program/` because the engines do not
all exist yet. On execution, move each order into its repo's `management/orders/`
(Order 3 is copied into each house as it is onboarded).
