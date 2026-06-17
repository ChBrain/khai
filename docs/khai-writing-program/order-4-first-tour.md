---
khai: order
title: "The First Tour"
language: english
license: CC-BY-NC-SA-4.0
stamp:
  owner: Choregos (Nicias and Pericles)
  version: v0.1.0
  date: "2026-06-17"
status: active
---

# Order 4: The First Tour

> **Repo: `khai-writing`.** Order 4 of 4 — see [00-program.md](00-program.md).
> On execution, move to `khai-writing/management/orders/`. The operating order:
> it ships the first deposited result, and sets the revise path. Depends on a
> deposit from Order 3.

## Direction

Operate the archive: take the Grimm result deposited in Order 3 on tour to the
Grimoire. Produced once, experienced at the Venue — and, when edited, patched in
place. The first live post is a deliberate, eyes-open act, not a side effect of
setup.

## Orders

1. **Dry-run first.** The Archive's Roadie sources the deposited result, adapts it
   to the Grimoire Venue profile (Standard + Adaption), routes it to a space by
   the Director's stated intent, and **shows the would-be POST**. It publishes
   nothing.
2. **Review → go.** On explicit human confirmation, the Roadie drives the live
   **POST**, then **records the placement** in `ledger.json` (venue, space, agent,
   post-id, url, state `live`, lastShipped).
3. **The revise path.** When the Director edits a published result (re-deposited
   to `khai-writing`), the Roadie **stages a PATCH** to the recorded post-id — it
   does **not** auto-repost. On confirmation, it ships the PATCH and updates the
   placement (`state: patched`). Retiring a result is a **DELETE**
   (`state: retired`).
4. **Boundary, always.** `publish`/`patch`/`delete` only. `tip` (money out),
   `comment`, `vote`, `follow` never fire without explicit per-act human
   authorization and a hard cap. Keys from the environment.

## Implementation

- The Roadie runs the `khai-tour` Grimoire profile from Order 1; the post body is
  the Adaption of the stored Standard. The licence block must be present — refuse
  to post a result that lacks it.
- The ledger is written **after** the Venue returns the post-id/url; a failed or
  cancelled ship writes nothing. Idempotent against the ledger: a result already
  `live` at a space is PATCHed, not re-POSTed.
- The agent/key is selected per the result's house (`GRIMOIRE_API_KEY_<HOUSE>`).

## Targets

- [ ] dry-run shows the would-be POST for the Grimm result; publishes nothing
- [ ] on confirmation, live POST succeeds; placement recorded in `ledger.json`
- [ ] revise path: an edited result stages a PATCH to the recorded post-id (no
      auto-repost), ships on confirmation, updates `state: patched`
- [ ] retire path: DELETE marks `state: retired`
- [ ] spend boundary held throughout; no secret or unauthorized spend in the loop

## Depends on

Order 2 (the engine and its Roadie) and Order 3 (a deposited Grimm result). After
this, every producing house's deposits tour through the same machinery.
