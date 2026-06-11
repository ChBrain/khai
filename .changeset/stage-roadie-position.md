---
"@chbrain/khai-stage": patch
---

Add the Roadie to the house blueprint as a management position, symmetric with the
Theatre Manager and the Playwright. Every stamped house now carries
`management/position_roadie.md` (the role: wire the stage inbound and the tour
outbound) and a named `persona_roadie.md` (filled per house). `stageHouse` threads
a `roadie` slug and `{{ROADIE_*}}` tokens, and the bin takes an optional `[roadie]`
argument. The named persona is fleshed out in khai-roadie mode, as the Playwright's
is in khai-playwright mode.
