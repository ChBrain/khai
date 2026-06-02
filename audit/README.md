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
- Reduce: a claim that the content was fixed. This is the only treatment the
  re-run can verify: if the content still flags, the finding reopens. You cannot
  close a finding by asserting a fix that did not land.
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

The review never gates a build: the CI job is advisory and always exits 0. The
gate is GitHub's "require conversation resolution before merging" on the base
branch: the audit PR cannot close while a finding comment is unresolved. The
model proposes; the human disposes; the unresolved conversation, not a red X, is
what holds the PR.

## Running it

```
khai-review --manifest audit/<audit-id>/audit.json
```

The judge is model-backed (`createModelJudge`), configured from the environment
(`KHAI_REVIEW_TOKEN` or the Actions `GITHUB_TOKEN`, with `models: read`). For a
local dry run without a token, `KHAI_REVIEW_MOCK=1` uses a deterministic stand-in
that proves the wiring but does not judge meaning.
