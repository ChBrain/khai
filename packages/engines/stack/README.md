# Stack

The HACKS spine a world runs on: the collaboration instructions, by flavor, alongside the stack extension point.

Unlike the domain engines (gender, language, stress), this engine does not ship khai-type content, so it is not certified through the shared conformance kit. It carries the spine instead, and ships its own structural tests. The [manifest](package.json) is the single source of truth for how it wires.

## Flavors

The collaboration instructions, one file per flavor. `raw` is the base; vendor-specific adaptations and other flavors slot in as sibling `instructions_<flavor>.md` files over time.

- [raw](instructions_raw.md): the base collaboration contract: Human, Agent, Collaboration, Knowledge, System.

## Stack

- [stack.md](stack.md): the runtime a world composes onto the five khai types. Six chapters in fixed order spell **TO MECH**: Title, Owner, Machine (the base layer it runs on), Extends (secondary worlds and borrowed non-khai surfaces), Communication (channel, languages, register), Heap (the personas, pieces, and places this world allocates).

See [sources and attribution](REFERENCES.md).

License: SEE LICENSE IN LICENSE and LICENSE-CODE
