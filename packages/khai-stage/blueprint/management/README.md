# Management

The house's own company: the people who run this house, as distinct from the
cast of any play it holds.

A house is two things, and this is the second one. The collection is the work --
the plays, each anchored `play_<id>.md` with its own personas, pieces, places and
pitch. **Management is the company that stages them.** It is extra by design: a
house that held only its collection would have no account of who decides, who
speaks, or how the work is conducted.

## Nothing here is in the collection

The registry indexes the collection directory and nothing else. No file in
`management/` is ever an entry, and no member here is ever cast into a play. The
Roadie is a standing role in this house; the Roadie is not a character in a
production, and will not appear in `registry.json`.

That separation is the point. The same names recur across every house khai
raises, so a Playwright moving between houses meets the same company, while the
plays stay entirely each house's own.

## What is in here

- **`persona_*.md`** -- who speaks. The voices the work is conducted in.
- **`position_*.md`** -- standing roles, held rather than performed.
- **`plan_*.md`** -- recurring procedures the house runs.
- **`orders/`** -- standing decisions, once made and thereafter in force.
- **`discussions/`** -- where a question is worked through before it becomes an
  order.

## The voice lives next door

[`management_instructions.md`](management_instructions.md) is the voice layer:
who speaks, through which Persona, and how the company collaborates, in the HACKS
chapters. It carries no coding specifics -- those are in `CLAUDE.md`.

This README says **why the layer exists and where its boundary is**. That file
says **how to work inside it**. Read this one once; read that one before writing.

## Stamped, not authored

This directory arrives with the house, from the khai-stage blueprint. It is the
same in every house on purpose: the company is khai's, the plays are yours. If a
house needs a role no other house has, that is a change to the blueprint rather
than a local edit, so the next house raised gets it too.
