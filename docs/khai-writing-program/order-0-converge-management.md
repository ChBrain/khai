---
khai: order
title: "Converge the Houses onto the Shared Management Structure"
language: english
license: CC-BY-NC-SA-4.0
stamp:
  owner: Choregos (Nicias and Pericles)
  version: v0.1.0
  date: "2026-06-17"
status: active
---

# Order 0: Converge the Houses onto the Shared Management Structure

> **Governance order, chain-scope.** Order 0 of the program — see
> [00-program.md](00-program.md). The structural substrate beneath the feature; it
> **lands as its own governance PRs**, reviewed apart from the writing work.
> Repeatable per house; run before a house is onboarded to produce.

## Direction

Today the `khai-plays-*` houses have **drifted**: HCAndersen carries the Roadie,
touring, and the voice/discussion layer; Grimm, Kleist, and Büchner carry almost
none of it; the Playwright and Theatre-Manager **positions are duplicated in
houses** rather than owned once; no house carries the Director. Bring every
`khai-plays-*` house to **one shared management structure** — and make it
**unable to drift again** by gating it.

Management is **just another play**: a Company of cast elements chained by plots.
Convergence makes every house's _management play_ the **same production with a
locally-adapted cast** — identical core, local personas and local plans the only
differences.

## The model: shared core + local overlay

A house's `management/` = **blueprint core (synced, identical)** + **local overlay
(the only differences)**. The diff between any two houses is _only_ the overlay.

| Element                                                                                              | Layer                                      |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `position_*` (the **role** definitions)                                                              | **shared** — blueprint, synced identically |
| standing plans (`plan_go_on_tour`, `plan_keep_clean`, `plan_set_up_a_house`, `plan_stage_the_score`) | **shared**                                 |
| `management_instructions`, `discussion_instructions`, the PDCA `discussions/` template               | **shared**                                 |
| Choregos personas (`persona_pericles`, `persona_nicias`)                                             | **shared**                                 |
| management conformance/gate                                                                          | **shared**                                 |
| `persona_<playwright/theatre_manager/roadie/director>` — the house's **cast**                        | **local**                                  |
| **house-specific plans** (e.g. Grimm's `plan-candidacy`, `plan-sagen`; a house's own Director plan)  | **local**                                  |
| `orders/` — the house's management orders                                                            | **local**                                  |

Positions are the _role_; personas are the _casting_; standing plans ride the
role; house plans are the house's own. House Director plans **may differ by
house** (expected, not exceptional).

## Scope

- **Applies to every `khai-plays-*` house, uniformly.** One core for all houses.
- **`website` and `khai-writing` are out of scope** — they are special
  productions with their own management shapes (`website`: Lessing; `khai-writing`:
  Callimachus + the Archive Roadie + Choregos). They conform to their **own**
  reference, not the houses' core; this gate does not run on them. (Each may later
  get its own profile.)

## The gate

- **Grammar** conforms for free: management is a play, so the existing
  play-conformance test validates its structure like any play.
- **Shared-core sameness** is the new check, built as a **single writer** in the
  existing tool: **`khai-tests management build`** materializes the blueprint core
  into the house (preserving the overlay), exactly as `khai-tests registry build`
  is the single writer of the version. **`khai-tests management check`** (its
  `--check` mode) runs **inside the existing `npm test` gate** — not a new
  required status check.
- **Switch point:** to surface it in branch protection, promote
  `management check` to a named **`khai-management`** required check — same code,
  just made visible. Default: folded into `test`.
- The reference is the installed blueprint (`@chbrain/khai-plays` / khai-stage), so
  each house checks itself against the version of the core it has pulled.

## Orders

1. **Canonicalize the blueprint reference.** Lift the shared positions
   (`position_playwright`, `position_theatre_manager`) from the houses into the
   blueprint; add `position_director` (draft:
   [drafts/position_director.md](drafts/position_director.md)) +
   `plan_stage_the_score`; ensure the
   instructions, the discussion template, the standing plans, and the management
   conformance all live there. One source of truth.
2. **Critically review every `position_*` for cast leakage.** A position must be
   the **generic role**, never a house's persona. Reconcile any house-flavoured
   position body back to the role before lifting. Where two houses' "same"
   position read differently, the review decides the one shared text.
3. **Declare the overlay contract** — local = the house's cast personas +
   house-specific plans + `orders/`; everything else is synced and must match.
4. **Build the single writer + gate** — `khai-tests management build` /
   `--check`, wired into `npm test`.
5. **Sync each house** (idempotent, via Set Up a House / `management build`),
   preserving the overlay:
   - Grimm/Kleist/Büchner gain the core (Roadie + touring + voice/discussion +
     the lifted positions); reconcile Grimm's `update_registry.js` and hyphenated
     `plan-*` names into the canonical shape.
   - HCAndersen gains the Director position + `plan_set_up_a_house` and aligns.
6. **Cast the missing local personas** — Director in all four; Roadie in the bare
   three (distinct, not the blueprint's Agatharchus).
7. **Make the gate required** — from here, drift is a gate failure, not a
   discovery.

## Targets

- [ ] blueprint owns all shared positions + standing plans + instructions +
      discussion template + management conformance (one source of truth)
- [ ] every `position_*` reviewed for cast leakage and reconciled to the generic
      role
- [ ] overlay contract declared (personas + house plans + orders = the only local
      set)
- [ ] `khai-tests management build` (single writer) and `management check` exist,
      `check` runs in `npm test`
- [ ] all four `khai-plays-*` houses sync clean against the blueprint; overlays
      preserved; drift reconciled
- [ ] Director cast in all four; Roadie cast in Grimm/Kleist/Büchner
- [ ] the management check is required; a drifted house fails the gate

## Feeds

This is **Phase 0** of the Writing Archive program. Once a house converges, that
program's Order 3 step 1 ("ensure chain positions from the blueprint") is already
satisfied — onboarding shrinks to casting the Director persona, registering the
Venue agent, producing, and depositing.

## Held

- **Branch block** — `claude/awaiting-instructions-7mwlnd` is rejected by the
  guards; all staged work is local and uncommitted until squared.
- **Gate decision** — folded into `test` (recommended) vs a named `khai-management`
  required check (switch point above).
