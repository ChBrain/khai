# Gender - References & Source Attribution

**Authorship:** KAI HACKS AI with AI-assisted drafting
**Content Model:** Theoretical Synthesis + Original Expression
**Last Updated:** June 2, 2026

---

## Domain

The gender domain models gender as position: the social read placed on a
body before it speaks. The domain does not model anatomy or identity; it
models the structural function a persona occupies in a room.

## Source Registry: Theoretical Foundations

The gender engine's architecture applies structural sociology directly into code constraints.

| Source               | Key Work                                  | Scope                                                                                        | Trust Level |
| -------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------- | ----------- |
| **Barbara Risman**   | _Gender as a Social Structure_ (2004)     | Gender as an exogenous social structure, not an internalized identity process.               | ⭐⭐⭐⭐⭐  |
| **West & Zimmerman** | _"Doing Gender"_ (1987)                   | The "read" as accountability; the room enforcing the frame before the persona acts.          | ⭐⭐⭐⭐⭐  |
| **Kate Manne**       | _Down Girl: The Logic of Misogyny_ (2017) | The "Human Giver" framework; the structural expectation of uncompensated accommodation.      | ⭐⭐⭐⭐⭐  |
| **Raewyn Connell**   | _Gender and Power_ (1987)                 | Hegemonic masculinity; the patriarchal dividend; agency conferred automatically by position. | ⭐⭐⭐⭐⭐  |
| **Pierre Bourdieu**  | _Masculine Domination_ (1998)             | Male agency as the unspoken, neutral default of public space (_habitus_).                    | ⭐⭐⭐⭐⭐  |

## Structural Mapping by File

The engine does not reproduce quotes; it translates sociological concepts into the `HOLD` constraint schema.

- **`position_gender.md` (The Anchor)**
  - _Constraint mapped:_ Gender as a structural read that arrives with the body; held continuously rather than run as a process.
  - _Anchored by:_ West and Zimmerman (Accountability), Barbara Risman (Gender as Social Structure).
- **`position_female.md` (The Expression)**
  - _Constraint mapped:_ The expectation of accommodation / "Hold the room together."
  - _Anchored by:_ Kate Manne (The "Human Giver" framework / structural obligation to accommodate).
- **`position_male.md` (The Expression)**
  - _Constraint mapped:_ The assumption of agency / the space that opens without asking.
  - _Anchored by:_ Raewyn Connell (The patriarchal dividend), Pierre Bourdieu (Public space organized as default male).

## Known Engine Constraints

The engine intentionally isolates gender as a standalone structural vector. Three major realities of gender sociology are deliberately constrained to maintain engine modularity:

1.  **Intersectionality (Crenshaw, Hill Collins):** The engine assumes a generic "room" applying a universal "read." In reality, gender is an entangled matrix read alongside race, class, and culture. The `khai` architecture explicitly delegates this tint to the `Cultures` packages. (e.g. `gender: female` + `culture: jordan` calculates the intersection organically at the persona level).
2.  **Marked vs. Unmarked Asymmetry (de Beauvoir):** Structurally, society treats Male as the default ("unmarked") human experience, while Female is the specified ("marked") experience. The engine models them as symmetric expression files for codebase stability, handling the asymmetry instead through the specific pressures defined in each file's `Has` and `Loses` blocks.
3.  **Relational Friction (Manne, Connell):** Theory views the male and female positions as a locked structural system where the female accommodation subsidizes the male claim. However, the engine leaves the expression files perfectly symmetric and structurally unlinked to each other. This preserves the `khai` Open/Closed rule (allowing future sibling expressions without rewriting the existing ones). The theoretical friction emerges dynamically through the shared anchor (the room enforcing the read), not through direct cross-linking.

## Authorship Note

The framing draws on the sociological tradition of gender as structure, but the engine positions are original expression translated into constraint-based architecture. They do not reproduce claims or quote directly from any specific paper.

The `position_male.md` and `position_female.md` files model the structural
read (what the room assigns), not the lived inner experience. They are
intentionally symmetric in schema so that any persona may hold either, or
navigate the gap between them.
