---
"@chbrain/khai-tests": patch
---

`science verify` names the line that drifted. The out-of-date error carried no
detail, so a stale index and a builder that changed under you looked identical.
It now reports the first differing line and column with an excerpt of both
sides, windowed on the difference rather than the start of the line.
