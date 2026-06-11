---
"@chbrain/khai-stage": patch
---

Lift the house's dev-steering rules into a single default contract,
`management/management_instructions.md`: a full HACKS instructions file (Human,
Agent, Collaboration, Knowledge, System) holding the operating rules every model
follows in a house. `CLAUDE.md` and `GEMINI.md` are reduced to thin, parallel
per-tool adaptions that reference it the same way, so the rules live in one place
and abstract across LLMs. Stamped into every house by the blueprint.
