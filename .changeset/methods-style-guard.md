---
"@chbrain/khai-methods": patch
---

Method prose now follows the repo-wide house voice (no em/en-dashes): the
Starfish retrospective's prompt questions used em-dashes as clause separators;
they are recast with parentheses. A test guards the rule across every method
(name, prompts, body), mirroring the STYLE_DENYLIST the skills side enforces, so
a dash can no longer slip into a surface that renders method prose verbatim.
