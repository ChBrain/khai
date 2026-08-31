---
"@chbrain/khai-plays": patch
---

The voice layer named the tool files as the home of the coding rules. It is read
before the contract, so it was the first hop and it misdirected: since #1460 the
contract is `AGENTS.md` and `CLAUDE.md` is a twenty-line Claude quirk file.

Repointed, and reworded rather than renamed: it now says the per-tool files carry
only that tool's own quirks and point back at the contract, so none of them is
where a coding rule lives. Naming the right file while keeping the old sentence
would have left the inverted architecture standing.
