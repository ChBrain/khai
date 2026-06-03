---
@chbrain/khai-rules: patch
---

security: fix polynomial ReDoS vulnerabilities in khai-rules

Fix two CodeQL alerts (js/polynomial-redos) with security severity high:
- Alert #11 (line 215): Changed markdown link regex from /\[([^\]]*)/ to /\[([^\[\]\n]*)/ to prevent ambiguous backtracking on malicious input
- Alert #12 (line 271): Replaced regex /\s+$/ with trimEnd() to eliminate polynomial time complexity

Both changes maintain functionality while eliminating denial-of-service risk from crafted input strings.
