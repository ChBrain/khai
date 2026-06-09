---
updated: "2026-06-09"
---

# Stack: Reference

## Line of Work

The **HACKS spine**: the human-agent collaboration a world runs on. The domain
does not model a character or a force inside the scene; it models the contract
above the scene: who sets it, who speaks through whom, how a move triggers the
next, and what the narrator will and will not do. The stack is the extension
point beside it: where anything that is not khai attaches to a world.

## Origin

KAI HACKS AI: **H**uman **A**gent **C**ollaboration **K**nowledge **S**ystem.
The instructions are the entry point of the architecture's three-part spine
(instructions, stack, the five khai types), lifted here from the per-world
`engine/` folder into a reusable, flavored engine.

| Source                         | Scope                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| **KAI HACKS AI ARCHITECTURE**  | The spine: `instructions.md` guards the collaboration, `stack.md` is the extension point. |
| **Agent Implemented (stance)** | Built by agents under a human guard rail; the instructions are that rail, written down. |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **Scene content** (personas, pieces, places): owned by the five khai types,
  not the spine. The instructions govern collaboration; they never carry a
  character.
- **Per-world specifics** (a named place, a cast): owned by the world's own
  `engine/`. This package ships the base contract, flavored, not a world.
- **Vendor behavior**: the `raw` flavor is provider-neutral. Vendor-specific
  adaptations land as sibling flavors, never folded into `raw`.

## Encoding

Source to file.

- **[raw](instructions_raw.md)** (flavor): the base collaboration contract,
  five sections: Human (sets the scene), Agent (speaks through a persona),
  Collaboration (one move triggers the next; silence is a move), Knowledge
  (behavior is evidence), System (the narrator does not explain).
- **[stack.md](stack.md)**: the extension point, usually empty, where non-khai,
  non-project content attaches to a world.

---

_Authored by KAI HACKS AI: original collaboration contract in the
Agent-Implemented tradition; it does not reproduce claims or quote directly._
