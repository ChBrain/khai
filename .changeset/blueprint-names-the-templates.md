---
"@chbrain/khai-stage": patch
---

The blueprint gains a vendor-agnostic contract, and tells a house where a file
starts.

`AGENTS.md` is now the coding contract. `CLAUDE.md`, `GEMINI.md` and
`.github/copilot-instructions.md` point at it and carry only their own tool's
quirks; none points at another. Previously the contract lived in `CLAUDE.md` and
the other two pointed there, which made one vendor the owner of rules that
belong to the house -- and it showed: the Copilot file carried a rule about
`claude/*` branch names, a quirk of a different tool entirely. That rule now
lives in `CLAUDE.md`, and the Copilot file drops from 50 lines of duplicated
contract to 11 lines of pointer.

`AGENTS.md` also gains "Starting a file". Every house khai-stage raises already
devDepends on `@chbrain/khai-arch`, so the nine authoring templates are installed
on day one, complete and valid -- and nothing in the blueprint named them. It
states the trap too: a stamped template validates, which is what makes it a safe
start and what makes an unedited one shippable.

The governance lane allows `AGENTS.md`.
