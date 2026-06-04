---
"@chbrain/khai-guard": patch
---

fix(branchScope): bind `{name}` by matching the glob, not slicing a literal prefix. `laneForPath` recovered a fan-out lane's `{name}` by slicing the path at the prefix length, landing on the wrong segment whenever a `**` or a group-specific prefix preceded `{name}` -- so those paths came back UNOWNED (a repo with a `**`-prefix surface fan-out never actually owned its pages). `bindName` compiles each `{name}` glob to an anchored regex with `{name}` as a single-segment capture: correct after a literal prefix, a `**`, or across several group globs, which enables true per-unit ownership/isolation. khai engines (literal prefix) unchanged; 63 guard tests pass.
