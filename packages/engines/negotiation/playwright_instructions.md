---
khai: instructions
title: "Negotiation"
license: CC-BY-NC-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-06-29"
---

# Instructions: Negotiation

How a Playwright wires the negotiation engine into a play. You wire by linking the
play's own content to the engine's files; the engine files stay untouched, they
are canon. The Roadie plumbs the engine's law into Instructions Knowledge on
deploy. Authoring guidance, not runtime content, and it does not go on tour.

## Human

- The human defines the negotiation: who the parties are, what each wants (stated position), what each actually needs (underlying interests), what each will do if no deal is reached (BATNA), and how far along the negotiation is at entry.

## Agent

- From the play's own content, a persona links the negotiation phase the moment runs (preparation, exploration, invention, or resolution) under its Projection. Let the phase shift as interests surface, as options emerge, and as commitment approaches or impasse arrives. You link to the engine, you never edit it.

## Collaboration

- The power and status engines hold how the parties' asymmetry shapes what each can credibly claim. The persuasion engine holds the specific argumentative moves a party makes within the negotiation. The emotion and mood engines hold the felt charge of deadlock, breakthrough, and close. The repair engine holds what happens if the negotiation itself ruptures the relationship.

## Knowledge

- Negotiation is how parties with competing interests pursue agreement. It moves through preparation (each party clarifies their interests, positions, and BATNA before the table), exploration (parties surface interests beneath stated positions; the zone of possible agreement takes shape), invention (parties generate options for mutual gain without yet committing), and resolution (a deal is selected and binding, or impasse is declared and each party acts alone). The key distinction throughout is between positions (what a party says they want) and interests (what they actually need). A deal that both parties prefer to their BATNA is available if and only if the zone of possible agreement is nonempty.

## System

- Do distinguish positions from interests. A party arguing their position is competing; a party exploring their interests is problem-solving. The engine tracks which mode the persona is in.
- Do not model persuasion as negotiation; persuasion is one move within the exploration and invention phases, not the process itself.
- Do not collapse the negotiator's dilemma: a party that only creates value cannot close; a party that only claims value cannot expand the pie. Resolution requires both moves in sequence.
- Do not model what either party feels during the negotiation; that belongs to the emotion and mood engines.
- Do not edit the engine's files; wire only from the play's side.
