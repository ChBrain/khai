# @chbrain/khai-skills

Self-contained, vendor-neutral [Agent Skills](https://agentskills.io) built
from the khai canon, so cheaper or non-code-aware models can do khai work to
the open standard.

## Why

khai capability lives in packages (`khai-arch`, `khai-tests`, `khai-review`) a
code-aware agent can run. A consumer model with no tools cannot. A **skill** is
the portable form it _can_ load. So a skill here is how khai work is pushed onto
a mixed fleet of LLMs: the same canon feeds both the packages and the skills.

## How it works

```
khai-arch (templates)  ──pull──▶  build  ──▶  dist/<skill>/  +  dist/<skill>.zip
                                    │
                                  guard (must pass to ship)
```

- **Build (`npm run build`)** composes each `src/<skill>/` into a self-contained
  bundle by pulling the canon at build time. The skill carries no hand copy:
  duplication exists only in the build output. The zip loads into any
  agentskills.io-compatible engine.
- **Guard**, pure Node, two tiers:
  - **Tier 1 — standard conformance**: a mirror of the agentskills.io SKILL.md
    rules (frontmatter fields + limits, name rules, reference depth, body
    budget). Pinned in `standards/agentskills.pin.json`.
  - **Tier 2 — khai policy** (stricter, on purpose): **vendor neutrality** (name
    a role, not a product) and **provenance** (embedded canon must equal its
    khai-arch source).
- **Drift (`npm run drift`)** compares the pin to the real upstream (the PyPI
  `skills-ref` version and the spec file hash). On a move it prints an advisory
  notice — the "move order" — on the next touch of any skill. It never blocks
  and is silent when offline.

## Commands

```bash
npm run build   # compose -> dist/ + zips + MANIFEST (fails if not conformant)
npm run check   # compose + validate in memory, no write
npm run drift   # is the pinned standard still current? advisory
npm test        # guard + build unit tests
```

## The pin, and why it is a commit/version anchor

Upstream publishes no semver tags or releases; the spec is a rolling `main`. We
therefore pin two real, fetchable things: the official validator's published
version (`skills-ref` on **PyPI** — the npm package of that name is an unrelated
third party, do not use it) and the spec file's content hash. We do **not** run
`skills-ref` (it is Python and demo-grade); we mirror its small ruleset in
`lib/guard.mjs` and use the version only as the anchor the drift check watches.

Re-pinning is a deliberate human act: reconcile `lib/guard.mjs` to the moved
spec, then update `standards/agentskills.pin.json`.

See [docs/SKILLS.md](../../docs/SKILLS.md) for the full contract.
