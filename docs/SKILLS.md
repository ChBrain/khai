# khai skills — the contract

_How khai exposes its capability as portable, vendor-neutral Agent Skills, and
how that conformance is guarded._

## The problem we are solving

khai is used across a **mixed fleet of LLMs**. Code-aware models (with a shell)
run the packages directly: `khai-tests`, `khai-review`, `@chbrain/khai-arch`.
Cheaper or non-code-aware consumer models cannot — they have no tools. What they
_can_ load is a **skill**.

So a skill is how khai work is pushed **down the cost curve**: the structure
lives in the skill, and a weaker model carries real load because the skill holds
its hand. The same canon feeds both paths — packages for the strong models,
skills for the rest.

## We learn from KAIHACKS; we do not lift

The retiring `kaihacks` repo carried ~14 fat skills, each re-bundling schema +
checks + flow, because it had no engine. khai already solved that at the
**package** level (`khai-arch` is the canon; `khai-tests`/`khai-review` are the
engines). So we do not port those skills. We learn the durable lesson — the
interactive authoring flow is the only part a package cannot express — and
**redesign natively**: a skill is a thin conversational membrane whose schema is
pulled from canon at build time.

## Build from canon, ship self-contained

```
khai-arch (templates)  ──pull──▶  build  ──▶  dist/<skill>/  +  dist/<skill>.zip
                                    │
                                  guard (must pass to ship)
```

A consumer model with no tools needs the template **physically present** in the
bundle. But a hand-maintained copy would drift from canon. The resolution:
`npm run build:skills` composes each skill by pulling templates from
`@chbrain/khai-arch` into the bundle. The duplication is a **build output**, not
a maintained file. Single source of truth _and_ a self-contained, portable zip
that loads into any [agentskills.io](https://agentskills.io)-compatible engine.

Each built `SKILL.md` is stamped (in the spec-blessed `metadata` map) with the
standard pin, the validator version, and the canon hashes it was built against.

## We sit on top of the standard — two guard tiers

The skills conform to the open Agent Skills standard, with khai policy layered
above it. Both tiers are **pure Node** (no Python, no `skills-ref` install, no
network), in `packages/khai-skills/lib/guard.mjs`.

- **Tier 1 — standard conformance.** A faithful mirror of the agentskills.io
  `SKILL.md` rules: `name` (≤64, lowercase alnum + single hyphens, no
  leading/trailing/double hyphen, **matches the directory name**), `description`
  (≤1024, non-empty), the permitted optional fields (`license`,
  `compatibility`, `metadata`, `allowed-tools`), reference depth (one level),
  and the body budget (<500 lines, advisory). Note: the open standard does **not**
  ban "claude"/"anthropic" in names, and `compatibility` is a valid field — those
  were a vendor's house rules, not the standard.

- **Tier 2 — khai policy (stricter, on purpose).**
  - **Vendor neutrality.** The standard _permits_ naming a product (e.g. in
    `compatibility`); khai forbids it in its own skills. A neutral skill ports to
    any model, which is the whole point. Name a role ("the author", "the
    executor"), never a runtime. The denylist is scoped to products
    (`claude.ai`, `copilot`, `chatgpt`, …) and deliberately does **not** catch
    khai's own vocabulary (e.g. "Drives", "drive").
  - **Provenance.** Canon material embedded in a bundle must equal its khai-arch
    source, or the build fails (no silent drift, no hand-edit).

The build refuses to ship a skill that fails either tier.

## The pin, and the move order

Upstream publishes **no semver tags or releases** — the spec is a rolling
`main`. So `standards/agentskills.pin.json` pins two real, fetchable things:

1. the official validator's published version — `skills-ref` on **PyPI**
   (Apache-2.0, Anthropic). The npm package of that name is an **unrelated third
   party**; do not use it.
2. the spec file's content hash (`specification.mdx`).

We do **not** run `skills-ref` (it is Python and stamped "demonstration only").
We mirror its small ruleset in `lib/guard.mjs` and use its version purely as the
anchor the drift check watches.

**The move order is lazy, by design.** `npm run drift:skills` compares the pin
to the real upstream (PyPI version + spec hash) and prints a one-line advisory
**on the next touch of any skill** (wired into `.husky/pre-commit`). No
scheduler, no auto-issue. It never blocks and is silent when offline or current.
Re-pinning is a deliberate human act: reconcile the mirrored rules, then bump
`agentskills.pin.json`.

## Where it lives, and the branch lane

The kit is the `@chbrain/khai-skills` workspace package. Its branch lane is
`skills/*` (see `khai-guard.config.json` → `branchScope`), per
[BRANCHING.md](BRANCHING.md). Adding the lane itself is a `governance/*` change;
skill work then rides the `skills/*` lane.

## Status

- **Built:** `creating-a-play` — the first skill, centred on the `play` house
  type (ENACTS: Estate, Name, Arc, Company, Triggers, Stakes).
- **Next:** the redesigned authoring/audit surface, settled skill by skill as
  each lands — not lifted wholesale.
