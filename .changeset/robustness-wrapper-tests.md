---
---

Tests for the order-2 robustness wrapper: `reviewRobust` consensus (confirms on K of N, rejects below the threshold, counts a split vote), the skeptic veto (drops a refuted finding, keeps one the skeptic cannot refute, and never runs the skeptic when consensus already fails), source anchoring (a factual rubric cannot confirm without a source, confirms with one, and the source rides in front of the passage), the input guards, and `skepticRubric`'s derived shape. Tests only; ships nothing.
