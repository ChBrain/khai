# Reference: the warrant standard (LORE)

Every component (an engine, and later every culture) ships a `REFERENCES.md`:
its **warrant**, the justification for the component to exist. Unlike a type
spec, a reference is not per-type; it is a cross-cutting standard every
component carries, so a reader can always ask the same four questions and get
the same four answers.

The chapters are fixed canon, in order. Their first letters spell **LORE**.

| Chapter             | Holds                                              |
| ------------------- | -------------------------------------------------- |
| **L: Line of Work** | what the component models, and what it isn't       |
| **O: Origin**       | the sources it rests on                            |
| **R: Restrictions** | what it refuses to claim, and to whom it delegates |
| **E: Encoding**     | source to constraint, per file                     |

**Encoding comes last** so it hands directly into the content: it names each
member file and the constraint that file carries, pointing the reader at the
anchor and expressions that follow.

## Rules

- The four chapters appear as `## ` headers, in LORE order, with nothing
  foreign between them. The canon enforces this: `referenceCard` (in
  `@chbrain/khai-arch`) reads the file and throws on a missing, misordered,
  foreign, or empty chapter, and khai-tests runs it over every installed
  engine: the same teeth that hold the WIRES card.
- **Subchapters belong to the author.** A heavy chapter may be split into
  `### ` subchapters; the renderer paginates one chapter, or one subchapter,
  per snap. "Less is more" applies per (sub)chapter, not to the set: keep each
  panel terse enough to read without scrolling, and split when it grows.
- A one-line **coda** may follow the last chapter, after a `---` rule (the
  authorship note, typically).

## Why it is load-bearing

The reference is read in three places from one source:

- the **book** renders it as the warrant, up front, before the content;
- every **deploy bundle** ships it at the root (`REFERENCES.md`), the warrant
  travelling with the engine;
- its **Restrictions** name what the component delegates (to Cultures, and so
  on), and those delegation edges are read by `compose()` when components are
  combined. Authoring the Restrictions and authoring the composition graph are
  the same act.

See `referenceCard` and `referenceChapters` in [`index.mjs`](../index.mjs);
gender's [`REFERENCES.md`](../../engines/gender/REFERENCES.md) is the first
conformer.
