# Oversight — The Writing Archive Program

The live surface that keeps oversight in the loop while another session executes.
The **order Targets are the contract**; this board is the **loop**. The executing
session keeps it current (a row per PR it opens); oversight watches those PRs,
verifies each against its order's Targets and the rubric below, ticks or pushes
back, and escalates the open decisions.

## The loop

1. **Execute.** Editing session makes the change, computes the lane
   (`npx khai-guard branch <topic>` — never `claude/*`), opens the PR (**draft**
   until whole), and **adds a row** to the board with the order, repo, branch, PR
   link, and what it claims to satisfy.
2. **Watch.** Oversight `subscribe_pr_activity` on that PR; each event (CI,
   review, push) wakes oversight to verify it.
3. **Verify.** Against the order's **Targets** + the **rubric**:
   - green & on-brief → tick the row, one-line note;
   - drift from the brief → comment on the PR, or escalate if architectural;
   - CI red → diagnose; tractable → the editing session fixes; ambiguous or
     out-of-scope → escalate to the human.
4. **Close.** A row closes when its PR is **merged by the human** and its Targets
   are met. Oversight never merges.

## Control board

State: `todo` · `draft` · `ci-red` · `review` · `ready` · `merged`. Oversight:
`—` · `ok` · `drift` · `blocked`.

| Order | Repo | PR (lane) | Branch | PR link | State | Oversight |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | khai | blueprint canonicalize: lift positions + `position_director` + `plan_stage_the_score` (governance) | | | todo | — |
| 0 | khai | `khai-tests management build`/`check` — source (package) | | | todo | — |
| 0 | khai | `khai-tests management` — tests | | | todo | — |
| 0 | each `khai-plays-*` | sync core + cast personas (governance, per house ×4) | | | todo | — |
| 1 | khai | Director skill — source (`skills/`) | | | todo | — |
| 1 | khai | Director skill — tests | | | todo | — |
| 1 | khai | Grimoire Venue profile in `khai-tour` — source | | | todo | — |
| 1 | khai | `khai-tour` — tests | | | todo | — |
| 1 | khai | `go_on_tour` sources from archive (governance/blueprint) | | | todo | — |
| 2 | khai-writing | raise repo: Estate(Metroon) + cast + store + ledger + gates + licence | | | todo | — |
| 3 | each house | onboard: sync + cast Director(+Roadie) (governance) | | | todo | — |
| 3 | khai-writing | deposit: `writing/<house>/<play>/<result>.md` | | | todo | — |
| 4 | khai-writing | first tour: dry-run → live POST + ledger write-back | | | todo | — |

(Split rows as the lanes actually fall; add one row per real PR.)

## Per-PR rubric (every PR)

- **Lane** computed by `khai-guard`; branch is **not** `claude/*`.
- **Source and tests are separate PRs** (khai rule 3).
- **Changeset** present — real for a package change, empty for docs/tooling.
- **Draft** while incomplete; marked ready only when whole; **never merged** by the
  session.
- **No secret committed** — only variable names (`GRIMOIRE_API_KEY_<HOUSE>`).
- **Licence** correct: package = `SEE LICENSE IN LICENSE and LICENSE-CODE`; skill =
  `CC-BY-NC-4.0`; content = `CC-BY-NC-SA-4.0`; public-domain source credited.
- **Order Targets** for this PR are met.
- **Management PRs (Order 0):** `khai-tests management check` clean — the diff is
  overlay-only (personas + house plans + orders); positions reviewed for cast
  leakage.
- **Tour/poster code (Orders 1, 4):** spend boundary held — `publish`/`patch`/
  `delete` only; `tip`/`comment`/`vote`/`follow` gated.

## Escalate to the human (`AskUserQuestion`) when

- a review comment is ambiguous or architecturally significant;
- a change contradicts the brief or a settled decision;
- an **open decision** blocks progress — Grimoire identity model, Archivist name,
  auto-repost default, management-gate visibility;
- CI fails for a real, out-of-scope reason, or after several re-kicks with no
  progress.

## PR-watching setup

- Oversight subscribes per PR as each is opened; there are **no PRs yet** at
  hand-off, so nothing is subscribed now.
- **Scope:** `khai`, the four `khai-plays-*` houses, and `website` are in
  oversight's repo scope. **`khai-writing` is not** — when you create it, add it
  (`add_repo`) so oversight can watch Orders 2–4. Until then, oversight watches
  Orders 0–1 (khai + houses) only.
- Oversight reviews, comments, and escalates; it does **not** push fixes from the
  blocked `claude/*` branch — pushes are the executing session's.
