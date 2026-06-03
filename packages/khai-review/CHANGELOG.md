# @chbrain/khai-review

## 0.1.0

### Minor Changes

- 2ccfbc2: Version floor: align every published package at 0.1.0. khai-arch, khai-tests,
  and khai-guard reached 0.1.0 with the LORE + Title -> Taxonomy release; this
  raises the remaining packages (khai-rules, khai-review, khai-engine-gender) to
  the same floor, marking the line's first coherent version. A maintainer's
  deliberate minor, not a feature delta -- declared by the maintainer, which is
  the only one who may call a minor.

## 0.0.2

### Patch Changes

- bdbe552: Show the original prose in a finding's comment. `reviewCard` now carries the
  reviewed text as `current`, and `commentBody` renders a finding as Current ->
  Suggestion -> Reasoning, so a reviewer sees the before, the after, and the why at
  a glance instead of just the rewrite.
- 757694f: Bias the conciseness rubric toward PASS. The old instruction was a ruthless
  editor that always found a cut, so it flagged even already-lean prose with
  marginal or voice-degrading rewrites, which trains a reviewer to rubber-stamp.
  The rubric now raises the bar: FLAG only clearly padded prose (about a quarter
  removable with no loss of meaning, term, or voice), PASS lean, marginal, or
  lateral-reword cases, and a tie goes to PASS. The lane surfaces real bloat
  instead of crying wolf.
- 465f314: Add the comment-to-table sync for the audit lane. `decisionsFromThreads` reads a
  PR's review threads into treatment decisions (finding id from the marker, the
  treatment from the latest reply, the resolved state from the thread), and
  `applyDecisions` records each decision into the ledger: the finding carries its
  treatment and resolution, and the status follows (accept, transfer, and reduce
  becomes reduce-pending while the content still flags, else reduced). The model
  still owns the reduce verification, so a fix cannot be faked. The redundant
  resolved-thread check is dropped from `reconcile`; GitHub's conversation
  resolution owns that gate.
- 5aa143a: Make the review lane runnable as an audit. Adds:
  - `createModelJudge` - the production, model-backed judge (the counterpart to
    `mockJudge`), behind the same Judge interface. Calls an OpenAI-compatible
    chat-completions endpoint (GitHub Models / gpt-4o-mini by default) via native
    fetch, no SDK; `fetchImpl` is injectable so the suite stays offline. A token
    and network are needed at call time (CI), never at import.
  - `collect` - the audit collector, a pure risk register. It reconciles a fresh
    review against a ledger: dedup (only new findings need a comment), carry (a
    known finding keeps its treatment), and verify (a Reduce that still flags
    reopens, the anti-cheat). Treatments are Accept, Reduce, Transfer.
  - `reconcile` - the consistency gate, also pure: the committed ledger must agree
    with the treatment each finding's PR comment records, or the audit PR is
    blocked. The findings are advisory; this is deterministic and gates.
  - a CLI (`khai-review --manifest audit/<id>/audit.json`) that drives an audit
    from its manifest, writes the ledger and the human log, and emits the new
    findings for a workflow to post as inline comments. Always exits 0; the audit
    PR's conversation-resolution rule is the gate, not CI.
  - the PR-surface helpers (`commentBody`, `anchorLine`, `findingIdOf`,
    `parseTreatment`): pure functions that build a finding's comment, anchor it to
    its log row, and read the treatment back out of a reply, so the workflow's
    GitHub glue stays thin and the parsing is unit-tested.

## 0.0.1

### Patch Changes

- e09971a: New package: the NLP-review lane, the judged, advisory counterpart to the
  deterministic conformance kit. Where a rule can decide it, `@chbrain/khai-tests`
  gates it; where only meaning can decide it (conciseness, and later coherence,
  voice), this lane reviews it and only ever suggests, never gates.
  - `review(prose, rubric, judge)` - a model-free harness; the `judge` is injected
    (a deterministic mock in tests, a model in production), so the package has zero
    model dependencies and stays reproducibly testable.
  - `rubrics.conciseness` - the first rubric: "could this be said in fewer words?"
    A word count cannot tell a tight long passage from a padded short one; only a
    reader can, which is exactly why it belongs in this lane and not the kit.
  - `reviewCard(manifest, judge)` - run the rubrics over a WIRES card's chapters,
    returning located flags for an advisory PR comment.
  - `mockJudge` - a deterministic stand-in that proves the harness wiring; a real
    model-backed judge drops in behind the same interface.
