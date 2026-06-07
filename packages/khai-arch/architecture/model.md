# KAI HACKS AI

A self-describing acronym. The name is the specification.

Three movements:

| Movement  | Reads as                                       | Layer                      |
| --------- | ---------------------------------------------- | -------------------------- |
| **KAI**   | Kais, Architecture, Instructions               | the noun: who + what       |
| **HACKS** | Human, Agent, Collaboration, Knowledge, System | the verbs: how it operates |
| **AI**    | Agent, Implemented                             | the verb: how it runs      |

Read forward (KAI → HACKS → AI) it is how you build one. Read backward, it is how you explain one.

## Model

A Play is the production. A Plot is one scene inside it. The elements (Process, Position, Piece, Place, Persona) are the cargo each Plot carries. Infrastructure is the runtime. Architecture and Instructions prime it before the session begins; Engines enrich it.

```
1 Play has
  0..n Plots, each having
    0..n Processes
    0..n Positions
    0..n Pieces
    0..n Places
    0..n Personas

Primed by:
  0..1 Architecture
  0..1 Instructions

Enriched by:
  0..n Engines
```

## Playbook

The playbook spine: the ordered groups consumers render. The model owns it; nothing downstream re-declares the order or the grouping.

```yaml
groups:
  - id: production
    label: production
    members: [play, plot]
  - id: cast
    label: cast
    members: [process, position, piece, place, persona, plan]
  - id: rests-on
    label: rests on
    members: [architecture, instructions]
  - id: enriched-by
    label: enriched by
    members: [engines]
```

## Types

- **Play**: the production. Holds the plots and binds them into one telling.
- **Plot**: the scene. Loads and places the elements.
- **Process**: what moves inside the scene.
- **Position**: what the world demands of whoever holds it.
- **Piece**: what carries more weight than it shows.
- **Place**: the pressure environment. The source of the ambient conditions the Plot's Cue draws from.
- **Persona**: the specific human the scene runs through.
- **Plan**: the forward-looking blueprint. The mapping of intent.
- **Architecture**: the extension seam (GROW). Where builders attach without touching the canon.
- **Instructions**: the HACKS method. The fight won in advance.
- **Engines**: what comes through the seam (WIRE). The extensions builders wire in.
