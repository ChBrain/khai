---
khai: order
title: "Raise the Writing Archive"
language: english
license: CC-BY-NC-SA-4.0
stamp:
  owner: Choregos (Nicias and Pericles)
  version: v0.1.0
  date: "2026-06-17"
status: active
---

# Order 2: Raise the Writing Archive

> **Repo: `khai-writing` (new).** Order 2 of 4 — see [00-program.md](00-program.md).
> The repo does not exist yet; on creating it, move this file to
> `khai-writing/management/orders/` and execute there. May **scaffold** in
> parallel with Order 1, but cannot **ship** until Order 1 lands the Grimoire
> Venue profile.

## Direction

Raise `khai-writing`: the chain's **third store** — the writing the plays produced
and the provenance of where each has been published. Chain infrastructure, one
repo for all houses (like `website`). On the tin it is `khai-writing`; in the
voice its Estate is the **Metroon**, the archive that kept the authoritative
play-texts. A house's responsibility ends at **deposit**: houses deposit here;
this engine keeps, catalogues, and (through its own Roadie) ships and tracks.

## Orders

1. **Identity.** `README.md` is the Estate — the **Metroon**: the production of
   record for what the chain has written and where it went.
2. **Cast** (`management/`): **Callimachus**, the Archivist (single — keeps
   results, holds the ledger, never ships); **the Archive's own Roadie**
   (transport only); the **Choregos** (Pericles and Nicias, shared). The Director
   is _not_ cast here — it is a house position; this engine receives what Directors
   deposit.
3. **Store the writing.** `writing/<house>/<play>/<result>.md`, each a
   **venue-neutral performance** (the Standard): story body, front-of-house, the
   licence block, routing intent. Git history _is_ the revision record.
4. **Keep the ledger.** `ledger.json`:
   `house → play → result → placement(venue, space, agent, post-id, url, state,
lastShipped)` — the single source of truth for what exists and where it is
   published.
5. **Ship and track** (the Archive's Roadie): source a result, adapt to a Venue
   profile, drive **POST / PATCH / DELETE**, write the placement back. Sourcing
   from the archive — never authoring.
6. **Hold the boundary.** `publish`/`patch`/`delete` only; `tip`/`comment`/
   `vote`/`follow` gated behind explicit per-act human authorization and a cap.
   **No auto-repost** — an edit is staged and shipped only on confirmation.
   Secrets (per-house Venue keys) come from the environment, never committed.
7. **Gate it.** Conformance checks: the ledger resolves; every result links a real
   house+play in the chain registry; every result carries its licence block; no
   secret is committed.

## Implementation

- **Consumes `khai`**: the Roadie machinery (`khai-tour`) and the **Grimoire Venue
  profile** from Order 1 — built in khai, run here. The Director **skill** is a
  house tool; this engine may use it for in-repo revises.
- **Ledger schema** (`ledger.json`):
  ```json
  {
    "<house>": {
      "<play-id>": {
        "<result-id>": {
          "source": "<house-repo>/plays/<play>",
          "created": "<date>",
          "placements": [
            {
              "venue": "grimoire",
              "space": "<space>",
              "agent": "<house-director-agent>",
              "postId": "<id>",
              "url": "<url>",
              "state": "live|patched|retired",
              "lastShipped": "<date>"
            }
          ]
        }
      }
    }
  }
  ```
- **Secrets** — per-house Venue keys from `process.env` (e.g.
  `GRIMOIRE_API_KEY_<HOUSE>`), held by the Archive's Roadie; only variable names
  in the repo; on CI, repository secrets.
- **Licensing** — `LICENSE` (CC-BY-NC-SA-4.0) + `LICENSE-CODE` (MIT); every result
  credits its public-domain source, claims only the staging.

## Targets

- [ ] `README.md` Estate = the Metroon
- [ ] `management/` casts Callimachus, the Archive's Roadie, the Choregos
- [ ] `writing/<house>/<play>/<result>.md` layout holds venue-neutral performances
- [ ] `ledger.json` records `house → play → result → placement`
- [ ] the Archive's Roadie ships POST/PATCH/DELETE from the archive, writes
      placements back; publish-only, no auto-repost, keys from env
- [ ] conformance gates pass: ledger resolves, results link real house+play,
      licence block present, no secret committed
- [ ] `LICENSE` + `LICENSE-CODE` present

## Depends on

Order 1 (the Grimoire Venue profile and `khai-tour`) to ship. Scaffolding
(identity, cast, store, ledger, gates) may proceed first.
