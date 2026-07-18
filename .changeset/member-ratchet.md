---
"@chbrain/khai-guard": patch
---

Add the member-scope ratchet: `deadExemptions` flags any memberPolicy homonym/grandfathered entry whose collision no longer exists in the tree, and `member-check` surfaces it as a loud advisory banner (never a failure -- the entry and the removal live in different lanes, so a hard fail would deadlock every removal). Deleting the dead entry returns the stem to the gate's hard protection.
