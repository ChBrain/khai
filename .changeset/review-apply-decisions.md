---
"@chbrain/khai-review": patch
---

Add the comment-to-table sync for the audit lane. `decisionsFromThreads` reads a
PR's review threads into treatment decisions (finding id from the marker, the
treatment from the latest reply, the resolved state from the thread), and
`applyDecisions` records each decision into the ledger: the finding carries its
treatment and resolution, and the status follows (accept, transfer, and reduce
becomes reduce-pending while the content still flags, else reduced). The model
still owns the reduce verification, so a fix cannot be faked. The redundant
resolved-thread check is dropped from `reconcile`; GitHub's conversation
resolution owns that gate.
