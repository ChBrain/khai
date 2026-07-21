---
id: khai-review
name: "khai Review"
type: review
invented_by:
  - name: "KAI HACKS AI"
year: 2026
source:
  title: "Order: Computed, Harnessed, Instructed"
prompts:
  - key: lenses
    label: Lenses
    question: "Which lenses read this passage? Resolve them from the house's team: each position is an accountability, one lens, voiced by the persona(s) that hold it, in tension when more than one does. The house sets how many; a different house rightfully reads through different lenses."
  - key: judge
    label: Judge
    question: "Read the passage through each lens against its accountability. Defer to the gates below: do not re-judge what the deterministic walls already settle, only the ambiguity they cannot reach."
  - key: consensus
    label: Consensus
    question: "Does the finding survive? Confirm it only on a declared consensus of independent readings, or when a skeptic told to refute it by default cannot; a claim of fact must anchor to a retrieved source, never the reader's memory. A lone flaky flag is not a finding."
  - key: escalate
    label: Escalate
    question: "Raise each confirmed finding to its next rung, and no further: the review advises, it never gates. What this rung cannot settle rises to the one above it, and in the end to a person."
---

The review method: a multi-lens adversarial pass, one lens per accountability, synthesised on consensus. Resolve the lenses from the house's own team (each position an accountability, voiced by its personas in tension), read the passage through each against the ambiguity the walls cannot reach, confirm a finding only when it survives independent consensus or an unrefuted skeptic and, for a claim of fact, an anchored source, then escalate each confirmed finding to its next rung. The pass advises and never gates.

This is khai's own craft, the ai rung of the ladder written down (see `docs/BOUNDARY.md`), and it is embodied in the `khai-review` harness: `resolvePositionRubrics` reads the team, `reviewRobust` runs the consensus and the skeptic and the source anchor, and `reviewHouse` composes them and escalates through the ledger to a person. The method is how a reader runs the same pass by hand when there is no harness in the loop; the mechanism is global, what each house checks for is local.
