---
"@chbrain/khai-review": patch
---

Make the review lane runnable as an audit. Adds:

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
