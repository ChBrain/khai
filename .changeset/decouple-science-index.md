---
---

Decouple the science index from per-PR gating: drop the real-repo drift assertion that held docs/SCIENCE.md byte-identical to the live engines on every PR. As a single shared generated file it collides across concurrent engine PRs; it is now refreshed out of band with `khai-tests science build`. The synthetic builder drift tests remain.
