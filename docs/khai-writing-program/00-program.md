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

## For the session that takes this

You are the executing session. This folder is the **whole program** — take it end
to end.

- **Access you need:** `khai`, the four `khai-plays-*` houses (grimm, kleist,
  buechner, hcandersen), and `khai-writing` (the archive repo — already a stub
  with a `README`; Order 2 fleshes it out). `website` is referenced but not
  modified.
- **Sequence:** **0 → 1 → 2 → 3 → 4** (Order 2 may scaffold while Order 1 lands;
  Order 3 repeats once per house, Grimm first). The DAG and overlaps are in
  _The orders_ below.
- **Place each order in its repo's `management/orders/` before executing it** —
  every order opens with a staging note saying which repo and where. Order 3 is
  copied into each house as it is onboarded.
- **Branch discipline:** never `claude/*`. Edit the working tree, then
  `npx khai-guard branch <topic>` per repo to let the guard compute the lane.
  Split by lane; source and tests are separate PRs; every PR a changeset; open as
  **draft** until whole; **never merge** — open the PR and stop.
- **Nothing here is committed.** These files are the brief, not landed work.
- **Clear the open decisions with the human first** (see _Open decisions_):
  Grimoire identity model, Archivist name, auto-repost default, and whether the
  management gate is folded into `test` or surfaced as a named check.

## The shape (why this exists)

Three stores, three questions:

| Store                    | Holds                                              | Answers                                        |
| ------------------------ | -------------------------------------------------- | ---------------------------------------------- |
| House `registry.json`    | the plays a house **offers** (scores)              | "what can this house stage?"                   |
| Chain registry (khai)    | all houses                                         | "what houses exist?"                           |
| **`khai-writing`** (new) | the **writing the plays produced** + where it went | "what did we make, and where is it published?" |

A **play is a score** (plots, elements — the machinery, in the houses). The
**writing is the result** (a **captured run** — one production a Director ran out
of a score and chose to make flesh). The houses produce _plays_; `khai-writing`
holds the _writing those plays produced_.
The **Director is the bridge**. `khai-writing` is chain infrastructure — one repo
for all houses, like `website`. Plain on the tin; its Estate in the voice is the
**Metroon**, the archive that kept the authoritative play-texts.

## Two Venues, two paths

The writing reaches an audience two ways, and the brief keeps them distinct:

- **Push — the Grimoire (API Venue).** The Archive's Roadie ships a result to an
  external Venue over the authenticated, stateful API kind (Order 1) and records
  the placement in the **ledger**. The ledger tracks _external_ placements only.
- **Pull — the package (npm Venue).** `@chbrain/khai-writing` is `npm install`-ed
  and rendered like `@chbrain/khai-plays-*`; **the website is the npm-pull Venue**.
  No API, no auth, no Roadie — a consumer reads the package's built, shipped, and
  exported discovery index (the same `exports`/`files`/registry mechanics the
  houses use, the registry-packaging fix of #482 _not_ re-trodden). "On our own
  surfaces" is free once the package exports cleanly.

So `khai-writing` is **both an archive and a consumable package**: Order 2 raises
it as a first-class package (the pull Venue), and its Roadie ships from it (the
push Venue). The website surface that renders it is `website`-repo work, mirroring
the plays surface.

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
- **Archivist (Callimachus)** — keeps results, holds the **ledger** (what exists,
  where shown). Custody + provenance. Never ships.
- **Archive's Roadie** — transport only: sources a result, adapts to a Venue,
  drives **POST / PATCH / DELETE**, writes placements back to the ledger.

**Handoff boundary:** a house's responsibility ends at **deposit**. Houses
produce and deposit; `khai-writing` keeps, catalogues, ships, and tracks.

## The lifecycle

```
produce    → Director runs the score as a living production, captures a run → venue-neutral result, deposits to khai-writing
publish    → Archive Roadie adapts to Venue profile, POSTs, records placement in the ledger
re-capture → Director re-runs the score, captures again → re-deposits (same reading is a revision; a new reading is a new result; git keeps the history)
re-publish → Archive Roadie PATCHes the recorded post-id in place   (NO auto-repost — human call)
retire     → Archive Roadie DELETEs, marks the placement retired
```

Capture once, tour/patch many — `plan_go_on_tour`'s own promise: "Produced once,
experienced wherever it is toured." Standard + Adaption: the Director deposits the
**Standard** (venue-neutral captured run); the Roadie composes the **Adaption**
(per-Venue) at ship time.

## The orders (the DAG)

| #   | Order                                                                                                                | Repo (executes)                              | Depends on              |
| --- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| 0   | [Converge the houses onto the shared management structure](order-0-converge-management.md) _(substrate, governance)_ | `khai` + each `khai-plays-*`                 | —                       |
| 1   | [Establish the Director and the Venue machinery](order-1-khai-director-and-venue.md)                                 | `khai`                                       | 0 (blueprint canonical) |
| 2   | [Raise the Writing Archive](order-2-raise-khai-writing.md)                                                           | `khai-writing` (new)                         | 1 (to ship)             |
| 3   | [Onboard a producing house](order-3-onboard-producing-house.md)                                                      | each play-house (**per house**, Grimm first) | 1, 2                    |
| 4   | [The first tour (dry-run → live)](order-4-first-tour.md)                                                             | `khai-writing`                               | 2, 3                    |

**Sequence.** Order 1 is foundational (khai) and gates the rest. Order 2 may
**scaffold** the repo in parallel with 1 (identity, cast, store, ledger, gates),
but cannot **ship** until 1 lands the Grimoire Venue profile. Order 3 needs the
Director (1) and a place to deposit (2). Order 4 needs a deposited result (3) and
the running engine (2). So: **1 → 2 → 3 → 4**, with 2's scaffolding overlapping 1.

Each subsequent producing house repeats Order 3; the archive (2) and tour (4)
machinery are built once.

## Houses: scope and scaling

The program names **no house in its machinery** — Orders 1, 2, and 4 are
house-agnostic; Order 3 is a repeatable per-house template. Houses differ only in
how much of the blueprint they have already pulled.

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

1. **Grimoire identity model** — _recommended: per-house agents_ (each house's
   Director is its own registered Grimoire agent, own key/home space; the Archive
   Roadie holds all keys and picks per result). Alternative: one chain agent.
2. **Archivist's name** — Callimachus proposed (the _Pinakes_ cataloguer).
3. **Auto-repost on edit** — parked; a Roadie-with-owner call. All orders assume
   **stage + confirm** every ship.
4. **Management-gate visibility** — `khai-tests management check` folded into
   `test` (recommended) vs a named `khai-management` required check (Order 0).

## Cross-cutting constraints (every order)

- **Branch block (active).** `claude/awaiting-instructions-7mwlnd` is rejected by
  the guards (lane is computed, never `claude/*`). All staged work is local and
  uncommitted until squared — make edits, then `npx khai-guard branch <topic>`
  per repo.
- **khai PR rules** — never `--no-verify`; source and tests are **separate PRs**;
  every PR needs a **changeset**; never merge (open the PR, stop); **draft** until
  whole; engine/content stays in its lane.
- **Secrets** never committed — only variable names. **Spend boundary** — publish
  (and patch/delete) only; `tip` (money out), `comment`, `vote`, `follow` gated
  behind explicit per-act human authorization and a hard cap.
- **Grimoire ToS** (Gryfin LLC, 2026-03-29) — display-licence only, no ownership
  claim → the house keeps control; owner accountable for all the agent publishes;
  keep keys secret; no impersonation (post under the registered Director identity,
  credit the public-domain source); 18+. Reasoning on the terms as written.

## Staging

These files live in `khai/docs/khai-writing-program/` because the engines do not
all exist yet. On execution, move each order into its repo's `management/orders/`
(Order 3 is copied into each house as it is onboarded).
