---
"@chbrain/khai-engine-stack": patch
---

Add the stack engine (@chbrain/khai-engine-stack): the HACKS spine a world runs
on. Ships the `raw` instructions flavor (the collaboration contract: Human,
Agent, Collaboration, Knowledge, System) and the stack file with the TO MECH
chapters (Title, Owner, Machine, Extensions, Communication, Heap). Unlike the
domain engines it carries no khai-type content, so it ships its own structural
tests rather than the shared conformance kit. `compose({ flavor })` returns the
instructions for a flavor, defaulting to `raw`; vendor adaptations slot in as
sibling `instructions_<flavor>.md` files selected by the stack's Machine chapter.
