# Stack

The HACKS spine a world runs on: the collaboration instructions, by flavor, alongside the stack extension point.

Unlike the domain engines (gender, language, stress), this engine does not ship khai-type content, so it is not certified through the shared conformance kit. It carries the spine instead, and ships its own structural tests. The [manifest](package.json) is the single source of truth for how it wires.

## Flavors

The collaboration instructions, one file per flavor. `raw` is the base; vendor-specific adaptations and other flavors slot in as sibling `instructions_<flavor>.md` files over time.

- [raw](instructions_raw.md): the base collaboration contract: Human, Agent, Collaboration, Knowledge, System.

## Stack

- [stack.md](stack.md): the extension point, where anything that is not khai attaches to a world. Usually empty.

See [sources and attribution](REFERENCES.md).

License: SEE LICENSE IN LICENSE and LICENSE-CODE
