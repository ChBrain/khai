# KAI HACKS AI

A self-describing acronym. The name is the specification.

Three movements:

| Movement | Reads as | Layer |
|---|---|---|
| **KAI** | Kais, Architecture, Instructions | the noun: who + what |
| **HACKS** | Human, Agent, Collaboration, Knowledge, System | the verbs: how it operates |
| **AI** | Agent, Implemented | the verb: how it runs |

Read forward (KAI → HACKS → AI) it is how you build one. Read backward, it is how you explain one.

## Model

A Play is the production. A Plot is one scene inside it. The elements (Process, Position, Piece, Place, Persona) are the cargo each Plot carries. Infrastructure is the runtime. Architecture and Instructions prime it before the session begins.

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
```

## Types

- **Plot**: the scene. Loads and places the elements.
- **Process**: what moves inside the scene.
- **Position**: what the world demands of whoever holds it.
- **Piece**: what carries more weight than it shows.
- **Place**: the pressure environment. The source of the ambient conditions the Plot's Cue draws from.
- **Persona**: the specific human the scene runs through.
- **Architecture**: this document. The design intent before the runtime starts.
- **Instructions**: the HACKS method. The fight won in advance.
