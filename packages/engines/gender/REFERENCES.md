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

| Source | Key Work | Scope | Trust Level |
|---|---|---|---|
| **Barbara Risman** | *Gender as a Social Structure* (2004) | Gender as an exogenous social structure, not an internalized identity process. | ⭐⭐⭐⭐⭐ |
| **West & Zimmerman** | *"Doing Gender"* (1987) | The "read" as accountability; the room enforcing the frame before the persona acts. | ⭐⭐⭐⭐⭐ |
| **Kate Manne** | *Down Girl: The Logic of Misogyny* (2017) | The "Human Giver" framework; the structural expectation of uncompensated accommodation. | ⭐⭐⭐⭐⭐ |
| **Raewyn Connell** | *Gender and Power* (1987) | Hegemonic masculinity; the patriarchal dividend; agency conferred automatically by position. | ⭐⭐⭐⭐⭐ |
| **Pierre Bourdieu** | *Masculine Domination* (1998) | Male agency as the unspoken, neutral default of public space (*habitus*). | ⭐⭐⭐⭐⭐ |

## Structural Mapping by File

The engine does not reproduce quotes; it translates sociological concepts into the `HOLD` constraint schema.

*   **`position_gender.md` (The Anchor)**
    *   *Constraint mapped:* Gender as a structural read that arrives with the body; held continuously rather than run as a process.
    *   *Anchored by:* West and Zimmerman (Accountability), Barbara Risman (Gender as Social Structure).
*   **`position_female.md` (The Expression)**
    *   *Constraint mapped:* The expectation of accommodation / "Hold the room together."
    *   *Anchored by:* Kate Manne (The "Human Giver" framework / structural obligation to accommodate).
*   **`position_male.md` (The Expression)**
    *   *Constraint mapped:* The assumption of agency / the space that opens without asking.
    *   *Anchored by:* Raewyn Connell (The patriarchal dividend), Pierre Bourdieu (Public space organized as default male).

## Known Engine Constraints

The engine intentionally isolates gender as a standalone structural vector. Two major realities of gender sociology are deliberately excluded from this specific package to maintain engine modularity:

1.  **Intersectionality (Crenshaw, Hill Collins):** The engine assumes a generic "room" applying a universal "read." In reality, gender is an entangled matrix read alongside race, class, and culture. The `khai` architecture explicitly delegates this tint to the `Cultures` packages. (e.g. `gender: female` + `culture: jordan` calculates the intersection organically at the persona level).
2.  **Marked vs. Unmarked Asymmetry (de Beauvoir):** Structurally, society treats Male as the default ("unmarked") human experience, while Female is the specified ("marked") experience. The engine models them as symmetric expression files for codebase stability, handling the asymmetry instead through the specific pressures defined in each file's `Has` and `Loses` blocks.

## Authorship Note

The framing draws on the sociological tradition of gender as structure, but the engine positions are original expression translated into constraint-based architecture. They do not reproduce claims or quote directly from any specific paper.

The `position_male.md` and `position_female.md` files model the structural
read (what the room assigns), not the lived inner experience. They are
intentionally symmetric in schema so that any persona may hold either, or
navigate the gap between them.

