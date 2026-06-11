---
updated: "2026-06-09"
---

# Hierarchy: Reference

## Line of Work

Hierarchy as **position**: where a persona stands right now -- what the room reads on them when they enter the field they are currently in. The domain does not model how that standing arrived (that formation is heritage's), nor the processes that change rank over time; it models the current read. Held, not run: the engine names the position, the scene names the field.

The read is field-relative. The same persona's capital configuration produces a different position in different fields -- ascending at work, declining at the Sunday family table, dominant in their friend group -- and the room of the current scene reads the position that fits its field. Two families of position cover the space: what the room reads from the persona's capital (six capital positions) and what a structure assigns by title (three title positions).

## Origin

Structural sociology, applied directly as position constraints: Bourdieu's capital theory for the capital positions, and structural role theory for the title positions.

| Source              | Key Work                                                          | Scope                                                                                                                                                               |
| :------------------ | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pierre Bourdieu** | _Distinction_ (1984) / _"Social Space and Symbolic Power"_ (1989) | Capital configurations and their position in social space; the field-relativity that makes the same persona dominant in one room and excluded in another.           |
| **Ralph Linton**    | _The Study of Man_ (1936)                                         | The ascribed/achieved distinction and the formal grammar of role relationships within a structure.                                                                  |
| **Robert Merton**   | _Social Theory and Social Structure_ (1957)                       | The role-set: a position is defined by its relations to others; the superior/peer/subordinate grammar is the irreducible minimum.                                   |
| **Henry Mintzberg** | _The Structuring of Organizations_ (1979)                         | Superior / peer / subordinate as the building blocks any organisational structure assembles.                                                                        |
| **Max Weber**       | _Economy and Society_ (1922)                                      | The threefold legitimation of authority varies, but the superior/peer/subordinate relation does not -- keeping title positions field-agnostic at the grammar level. |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **How the standing arrived**: The engine models current standing, not its formation. The transmission of capital across generations, and the slow making of a habitus, are **delegated to the heritage engine**; hierarchy reads what the room reads now, not the history behind it.
- **Rank change as process**: Promotion, demotion, and the loss of rank are processes; this engine is position-only -- rank is held, nothing runs in here. The pressure of losing a position routes through the stress engine; the long arc of rising or falling belongs to the play's design.
- **The field**: The engine ships the universal position shapes, not the specific field. Which field the persona is read in -- this boardroom, that family table -- is provided by the scene context, never by the engine. Per-(capital, field) position files would be a combinatorial explosion and are out of scope by design.
- **The metric**: The engine models the qualitative read the room performs, not a numeric ranking. Network-centrality and status-generalization metrics are adjacent, not foundational; hierarchy wants the read, not the measure.

## Encoding

Source to constraint, per file. Two families: six capital positions (what the room reads), three title positions (what the structure assigns).

- **[hierarchy](position_hierarchy.md)** (the anchor): The read itself -- a rank assigned by the field, produced by the persona's capital configuration and by the title, if any, the structure assigns. Anchored by Bourdieu (field position read before utterance).
- **[dominant](position_dominant.md)** (expression): High across multiple capitals; the room orients without asking the persona to make the case. Anchored by Bourdieu (the most-recognised configuration).
- **[established](position_established.md)** (expression): High symbolic and social, moderate economic; standing already acknowledged, held without performing. Anchored by Bourdieu (_The State Nobility_, inherited-rank that no longer demonstrates).
- **[ascending](position_ascending.md)** (expression): High economic or cultural, low symbolic yet; competence allowed but required to be displayed. Anchored by Bourdieu (high-capital, low-recognition).
- **[declining](position_declining.md)** (expression): High symbolic no longer matched by current economic or social standing; the conversion rate thins. Anchored by Bourdieu (the position with thinning supports).
- **[excluded](position_excluded.md)** (expression): Low across all capitals in this field; being correct is not the relevant variable. Anchored by Bourdieu (field non-recognition).
- **[misplaced](position_misplaced.md)** (expression): High capital of the wrong type for this field; convert, suppress, or carry the friction. Anchored by Bourdieu (_"Social Space and Symbolic Power"_, field-relative mismatch).
- **[superior](position_superior.md)** (expression): Holds authority over others by the structure's rule; decide where decision is required, defer where it is not. Anchored by Linton, Merton, and Mintzberg (assigned title).
- **[peer](position_peer.md)** (expression): Equal rank, no structural authority either way; coordinate without commanding. Anchored by Merton (the role-set of equals).
- **[subordinate](position_subordinate.md)** (expression): Subject to another's authority by title; carry the assignment without making it the superior's again. Anchored by Linton and Mintzberg (the line of accountability).
