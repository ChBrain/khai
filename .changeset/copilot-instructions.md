---
"@chbrain/khai-stage": patch
---

Blueprint: add `.github/copilot-instructions.md` so the Copilot staging agent gets the house contract — most importantly that **a play takes no changeset** (the build sets `0.<count>.0`). Without it, Copilot had no house guidance and added a changeset per play, producing the `0.<count>.1` drift. Mirrors `CLAUDE.md`.
