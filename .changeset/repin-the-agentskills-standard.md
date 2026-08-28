---
---

Re-pin the agentskills standard: the spec's hash moved on prose, not on contract.

The drift check has been reporting since the 2026-06-03 pin that
`specification.mdx` changed. It is advisory and never blocks, which is why it
went unread; it surfaced only because the pre-push hook printed it during an
unrelated pass.

Reconciled both halves of the pin.

**The rules.** Every constraint the current spec states is mirrored in
`lib/guard.mjs`: `name` required at 1-64 with `[a-z0-9-]` and no leading,
trailing or consecutive hyphen and matching the parent directory;
`description` required at 1-1024 and non-empty; `license`, `compatibility`
(1-500), `metadata` (string map) and `allowed-tools` (space-separated string)
optional; a non-empty body; the 500-line recommendation and the
one-level-deep reference recommendation as warnings. Nothing in the spec is
unmirrored and nothing mirrored is absent from the spec.

**The validator.** `skills-ref` is still **0.1.1**, the version this pin already
named, and pypi shows no release after it. That is the load-bearing half of the
argument: the reference validator is the authority on the ruleset, so a change to
the RULES would ship as a release. It did not.

So the hash moved on prose and the mirror is still faithful. Re-pinned; the drift
check now reports current.

**One thing worth fixing later, recorded in the pin's own notes.** This pin stores
a hash and not the text, so when it fires it can say that something moved and
never what -- the reconciliation above had to be rule-by-rule against the whole
current spec rather than a diff, and the GitHub API is out of reach for the
upstream repo's history. Carrying the extracted rule table beside the hash would
let a future drift answer "prose only" by itself, which is the difference between
an advisory anyone reads and one that sits for three months.

`khai-skills check` 7 conform, `khai-skills drift` current, `npm test` 5722
passed. Ships nothing.
