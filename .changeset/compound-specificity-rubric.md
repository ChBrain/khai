---
"@chbrain/khai-review": patch
---

Add the `compound-specificity` rubric, the lane's first anchored one: does a
composite's chapter say anything the atoms it links do not?

Anchoring was machinery the harness had and no rubric used, so it is wired here
too. `resolveLinkedSource` retrieves the bodies of the atom files a passage
links, `reviewMarkdown` hands them to an anchored rubric as its source, skips a
passage that links none rather than judging it unanchored, and forces an
anchored rubric through `reviewRobust` so it can never take the single-shot path
that has no source parameter and would let the model answer from memory.
