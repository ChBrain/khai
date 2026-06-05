---
"@chbrain/khai-plays": patch
---

Add khai-plays: the play registry, the bill. khai holds the index of houses, not
the productions. Each house (a khai-plays-<source> collection) registers one
entry under registry/<source>.json; loadRegistry reads and validates them sorted
by id, and a malformed card fails the build. The website reads the bill and
renders one card per house with its productions underneath. Pure node, no canon
dependency: a card is metadata, not khai content.
