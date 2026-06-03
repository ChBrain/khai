---
"@chbrain/khai-rules": patch
---

Remove the dead `checkTitle` rule. It enforced the old `## Title` == H1 echo,
which the section contract retired when the T slot became `Taxonomy` (the group
above, never a re-name of the H1). The kit stopped calling it then; it had no
remaining callers, no test, and no re-export -- pure orphaned machinery. With
the Title -> Taxonomy migration complete, the house is clean.
