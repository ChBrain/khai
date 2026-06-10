---
updated: "2026-06-09"
---

# Spine: Reference

## Line of Work

The **spine**: the meta layer a world runs on. The domain does not model a
character or a force inside the scene; it models the two surfaces above the
scene. The instructions are the HACKS collaboration contract (who sets the
scene, who speaks through whom, how a move triggers the next, what the narrator
will and will not do). The architecture is the TO GROW extension point (where
anything that is not the canon attaches to a world).

## Origin

The KAI HACKS AI architecture. The spine is two of its `class: meta` types:
**instructions** (HACKS: Human, Agent, Collaboration, Knowledge, System) and
**architecture** (TO GROW: Ground, Root, Open, Weave). They are lifted here
from the per-world `engine/` folder into a reusable engine.

| Source                         | Scope                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| **KAI HACKS AI ARCHITECTURE**  | The spine: the instructions guard the collaboration, the architecture is the extension point. |
| **Agent Implemented (stance)** | Built by agents under a human guard rail; the instructions are that rail, written down.       |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **Scene content** (personas, pieces, places): owned by the five khai content
  types, not the spine. The instructions govern collaboration; they never carry
  a character.
- **Per-world specifics** (a named place, a cast): owned by the world's own
  `engine/`. This package ships the base contract, not a world.
- **Host behavior**: the contract is provider-neutral. Host-specific setup is
  not folded into it; it lives in the per-host folders the setup plan routes to,
  and is assembled by khai-tour into a target deployment.

## Encoding

Source to file.

- **[setup](plan_setup.md)** (plan): the master setup plan; the route that
  stands a world up in a host, one open target per host folder, built on the
  raw contract and extended through the architecture.
- **[raw](instructions.md)** (instructions): the base collaboration
  contract; Human sets the scene, Agent speaks through a persona, Collaboration
  moves one beat at a time, Knowledge reads behavior as evidence, System holds
  the narrator back.
- **[spine](architecture.md)** (architecture): the extension point; Ground
  stays fixed, Root attaches at the instructions Knowledge chapter, Open is the
  seam a world extends through, Weave is the canon and the world as one.
