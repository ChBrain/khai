---
surface: stack
flavor: raw
license: CC-BY-NC-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-06-09"
---

# Stack

The runtime a world composes onto the five khai types. Six chapters, fixed
order, spelling **TO MECH**: Title and Owner give the `TO`, then Machine,
Extensions, Communication, Heap. The stack declares **edges**, never an
inventory: it says what is wired to what, while the khai-type files hold the
content.

## Title

The world this stack composes.

## Owner

Project.

## Machine

The LLM runtime the world executes on, from generic to specific: `any LLM`,
`Claude.ai`, a named model. The Machine selects the instructions flavor: `any
LLM` runs the `raw` flavor; a named runtime runs its vendor adaptation.

## Extensions

The points the world is extended by (UML `<<extend>>`): third-party
customizations from other builders, and the rules that integrate them. The base
world stays oblivious to them. Populated only when foreign work is composed in,
empty otherwise.

## Communication

The external services the world talks to: APIs, MCP servers, tools. The outbound
interface boundary.

## Heap

The packs from KHAI (KAI HACKS AI) loaded into the world's scope (UML
`<<include>>`), named at pack grain, not by file: `Cultures`, `Stress`,
`Gender`. The scope boundary: what is loaded together, and therefore able to
reach each other.
