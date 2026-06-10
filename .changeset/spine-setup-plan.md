---
"@chbrain/khai-engine-spine": patch
---

Add the spine setup plan as the engine's anchor, and retire the instructions
flavor model. `plan_setup.md` is the master plan that routes a world into a host
environment: it rests on the collaboration contract (the basis) and the
architecture (the extension point), and carries one open target per host
(Claude.ai, Perplexity, Gemini, NotebookLM, more to come), each to ship as its
own `<host>/` folder with installation instructions and upload assets.

Wire the two foundations together: the instructions' System chapter now points
to the architecture seam, and the architecture's Root points back to the
instructions. Rename `instructions_raw.md` to a single `instructions.md` (the
basis) and drop the flavor machinery from `index.mjs` (`compose()` returns the
one contract; `flavors`/`flavorFiles` are gone): host-specific setup is not an
instructions flavor but a per-host folder that khai-tour assembles into a target
deployment. Structure only, the per-host folders land in later increments.
