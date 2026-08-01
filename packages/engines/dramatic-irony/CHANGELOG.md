# @chbrain/khai-engine-dramatic-irony

## 0.1.2

### Patch Changes

- 5296cc6: Fix a mis-delegation in dramatic-irony REFERENCES: the character's discovery (anagnorisis) was wrongly attributed to "the recognition engine," but recognition models the social acknowledgment of a persona (Honneth), a different sense of the word. Anagnorisis is a distinct dramatic phenomenon, not currently modelled; the Line of Work and the Restrictions entry now say so and no longer misattribute it. Content-only; no manifest or interface change.
- Updated dependencies [b55e2b1]
- Updated dependencies [924cb2f]
  - @chbrain/khai-arch@0.1.25

## 0.1.1

### Patch Changes

- 6f03c00: Add the dramatic-irony engine (process: root + forms) -- the sustained gap of discrepant awareness in which the audience holds knowledge a character lacks, and reads the character's every word and act against what it cannot see. The gap analysis (Tier-3 #25) found `secret` owns the character-to-character asymmetry (one figure concealing from another), but nothing owned the audience-to-character asymmetry.

  - **Root (process):** `dramatic-irony` -- the audience is let in on something (an outcome, an identity, a true meaning) the character is not, and the play holds the gap open while the character acts inside its narrower horizon (Pfister's discrepant awareness).
  - **Forms (process):**
    - `foreknowledge` -- the prospective gap: the room knows what is coming that the character does not, and watches it move toward the unseen (Hitchcock's revealed bomb; Oedipus hunting himself).
    - `present-meaning` -- the concurrent gap: the room knows the true sense of the character's present words and situation, which the character misreads (the doubled line; the confidence built on a false belief).

  **Scope note -- bounded against the other awareness engines.** The concealment of knowledge _between characters_ stays with `secret`; the anticipatory dread about an outcome the room cannot yet call stays with `suspense` (dramatic irony's foreknowledge form is nearly its inverse -- the room often certain); the sudden reversal for a room that _did not_ know stays with `surprise` (dramatic irony's structural opposite for the audience); and the character's own discovery of what the audience already knew stays with `recognition` (the closing of the gap). This engine owns the sustained discrepant awareness itself.

  Warranted (LORE) on Pfister (_The Theory and Analysis of Drama_, 1988 -- dramatic irony as the audience's superior knowledge and the discrepancy between the spectator's horizon and the figure's), Sternberg (_Expositional Modes and Temporal Ordering in Fiction_, 1978 -- the distribution and withholding of narrative knowledge), and Evans (_Shakespeare's Comedies_, 1960 -- discrepant awareness as an organizing principle). Set at patch as the free level. No whitelist required -- the `dramatic_irony` / `foreknowledge` / `double_meaning` stems are unique.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
