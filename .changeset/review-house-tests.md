---
---

Tests for `reviewHouse`, the end-to-end harness composition: it runs every position's rubric and escalates a confirmed finding into the ledger as open (with `where` tagging the id), escalates nothing for a clean passage, reconciles against a prior ledger so a finding that stops flagging clears, passes the skeptic through so a refuted finding does not escalate, and is graceful when the house casts no positions. Driven by deterministic stub judges, no model. Tests only; ships nothing.
