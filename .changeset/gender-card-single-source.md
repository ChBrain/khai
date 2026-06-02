---
"@chbrain/khai-engine-gender": patch
---

Gender: make the WIRES card the single source of teaching and end the blended
reality between `package.json` and the README.

- Remove the legacy free-text `khai.wiring` and `khai.requirement` fields; they
  duplicated `card.setup` and `card.require`. The card is now the one place the
  engine teaches, and the canon renders it.
- Reduce `README.md` to a thin pointer at the manifest/card instead of a
  hand-maintained second copy (also drops the stale version footer).
- Correct the persona wiring doctrine: drop "exactly one expression / two and
  the room contradicts itself." The read the room receives lives under
  Projection; a persona may also hold a different, even contradicting, read
  under Shadow - the gap between shown and hidden is the character, not an error.
- Reframe `card.enforce` along the checked-structure vs judged-coherence line:
  the kit verifies the floor (law declared, a read under Projection); whether a
  Projection and a Shadow read cohere is semantic, taught and reviewed, never
  failed by the suite.

Structure (`anchor`, `expressions`, `requires`) and `compose()` are unchanged.
