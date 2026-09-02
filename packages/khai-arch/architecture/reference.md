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

## Frontmatter: what a warrant declares about itself

A warrant may open with YAML frontmatter. The chapters carry the argument; the
frontmatter carries the **declarations a house's index and walls read**, so a
unit can say where it sits in one place that rides its own lane. Every key is
optional, and a house's gates decide which it requires: a house that builds a
concordance needs the first three, a house that checks opposition needs the last
two, and a house that does neither ignores all five.

| Key       | Holds                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------- |
| `concept` | the concept's scholarly name, as an index would key it                                              |
| `field`   | the field the concept belongs to, as an index would group it                                        |
| `source`  | the leading source, one phrase                                                                      |
| `axis`    | the quantity the work acts on, a slug (`population-density`)                                        |
| `sign`    | how the outcome moves as that quantity rises: `positive` or `negative`; a trailing comment is legal |

`axis` and `sign` come together or not at all. Two warrants on one axis with
opposite signs are in **conflict**, and each must name the other's title and say
what sets the sign; that check is computed from these keys, so it sees only
warrants that declare them. A new unit that declares no axis is not caught, it is
invisible, which is why a house that runs the check ratchets its coverage.

The keys live **here** and not in a house's guard config or in the play's
frontmatter, for two reasons that decided it: the guard config is on the
governance lane, so a unit could never declare its own axis in the pull request
that adds it, and the canon validator owns the play's frontmatter and rejects
unknown keys. The warrant's frontmatter is the unit's own to write.

`referenceCard` reads the chapters and is indifferent to the frontmatter: a
warrant with none is whole. The keys are read by the index and opposition
tooling in `@chbrain/khai-tests`.

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
