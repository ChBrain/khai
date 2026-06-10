---
"@chbrain/khai-engine-spine": patch
---

Add the spine setup plan as the engine's anchor. `plan_setup.md` is the master
plan that routes a world into a host environment: it rests on the raw
collaboration contract (the basis) and the architecture (the extension point),
and carries one open target per host (Claude.ai, Perplexity, Gemini, NotebookLM,
more to come), each to ship as its own `<host>/` folder with installation
instructions and upload assets. Wires the two foundations together: the raw
instructions' System chapter now points to the architecture seam, and the
architecture's Root points back to the instructions. Structure only — the
per-host folders land in later increments.
