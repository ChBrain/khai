# Audit

The audit folder declares what the NLP-review lane reviews, and holds the record
of what it found. Each audit is a folder under `audit/`, named by its id (the
differentiator, so ten audits do not collide):

```
audit/
  <audit-id>/
    audit.json    the manifest: what to review (input, hand-authored)
    ledger.json   the collector's memory: findings + treatments (generated)
    log.md        the human view of the ledger (generated)
```

## The manifest

`audit.json` declares the id and the review scope: which engines to review, with
which rubrics.

```json
{
  "id": "gender-conciseness",
  "review": { "rubrics": ["conciseness"], "targets": ["packages/engines/gender"] }
}
```

## The loop

```
audit.json  ──►  audit PR
      the PR carries each new finding as an inline comment
      a comment is answered with a treatment (Accept, Reduce, Transfer)
      the audit re-runs and verifies; the ledger and log update
      all comments resolved  ──►  the audit PR can close
```

A finding is a risk. Its treatment is the human's decision, in the classic
vocabulary:

- Accept: acknowledged, left as is. The content may still flag; that is the
  accepted risk.
- Reduce: a commitment to fix the content. Only the collector marks it solved,
  and only when the content actually stops flagging, so a fix cannot be faked.
  Until then the finding is reduce-pending: a promise that satisfies the table
  and releases the audit, carrying a resolution (the fixing PR, which may not be
  raised yet). The next run re-checks it: clean becomes reduced; a once-reduced
  finding that flags again reopens as a regression. The promise is auditable
  because it is re-verified, not because the PR exists.
- Transfer: the risk is owned elsewhere (a sibling PR, another engine, a
  downstream world); the resolution records where.

## The collector

The collector reconciles a fresh review against the ledger, so a finding already
known is never raised twice. It does three jobs: dedup (only genuinely new
findings get a comment), carry (a known finding keeps its treatment, its text
refreshed), and verify (a Reduce that no longer flags becomes `reduced`, solved
for real; a Reduce that still flags reopens to `open`). It is pure, so it tests
deterministically; the CLI reads and writes the ledger around it.

## The gate

Two gates hold the audit PR, and neither is the model.

The review itself never gates: the model is advisory, so the review job always
exits 0. What holds the PR is, first, GitHub's "require conversation resolution
before merging": the audit PR cannot close while a finding comment is open.

Second, the consistency gate (`reconcile`), a deterministic required check: the
committed ledger must agree with the treatment each finding's comment records. If
a comment treats a finding "accept" while the table still shows it open, or the
table says "reduced" while no comment records the decision, the check fails and
the PR is blocked. This keeps the record and the conversation from drifting
apart, and it composes with the anti-cheat: a Reduce the collector reopened shows
`open` in the table, so a comment claiming it done will mismatch and block.

The same required check first runs a freshness gate: every audit the PR touches
must have actually run against the current content. The review job stamps
meta.json with the git tree of each reviewed target; the check fails if that
stamp is missing (the audit never ran, a seed-only PR) or no longer matches (the
content changed since the review, so the findings are stale). Either way the fix
is to comment /audit <id> and re-run. This is what stops an un-run or stale audit
from merging.

Every treatment must carry a resolution detail, so no finding closes without a
written reason: the fixing PR for a Reduce, where it is owned for a Transfer, the
rationale for an Accept. The detail is free text and may name a PR not yet
raised; the gate checks only that a detail is present, never that the PR exists.
A Reduce whose fix has not landed is still `open` (the content still flags), so a
promised-but-unraised PR cannot release the audit: only a fix the re-run verifies
flips it to `reduced`.

The model proposes; the human disposes by treating each finding in its comment;
the conversation-resolution rule and the consistency check, not a red X from the
review, are what hold the PR.

## Branch protection

The protection lives on `main` (the base of every audit PR), keyed by branch
name, not tied to any branch's lifespan, so the ephemeral audit branch is fully
compatible. Two rules carry the gate:

- require conversation resolution before merging;
- require the audit consistency check to pass.

Both are evaluated per PR at merge time, so they govern an audit branch cut
minutes ago and deleted after merge exactly as they would a standing one.

## Running it

```
khai-review --manifest audit/<audit-id>/audit.json
```

The judge is model-backed (`createModelJudge`), configured from the environment
(`KHAI_REVIEW_TOKEN` or the Actions `GITHUB_TOKEN`, with `models: read`). For a
local dry run without a token, `KHAI_REVIEW_MOCK=1` uses a deterministic stand-in
that proves the wiring but does not judge meaning.

## In CI

`.github/workflows/audit.yml` runs the loop. The review job (the model calls)
runs on PR open, or on a `/audit <id>` comment that runs that named audit on
demand (regardless of the diff); it reviews each audit, commits the ledger and
log, and posts new findings as inline comments. The consistency job runs on every PR event with no model calls: it
reads the comment threads and the ledger and fails when they disagree
(`.github/scripts/audit-consistency.mjs`). That job is the required check.
