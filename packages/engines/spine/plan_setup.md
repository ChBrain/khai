---
khai: plan
title: "Setup"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-06-10"
status: active
---

# Plan: Setup

## Taxonomy

A **production** directive: the project's own scheme for standing a khai world
up in a host environment. The class, not its owner (the project) or its focus.

## Owner

- Project: khai
- Engine: spine

## Direction

One navigable route to run a khai world in any supported host. Each host takes
the same two foundations -- the neutral collaboration contract and the
extension point -- and differs only in what gets uploaded where and how the
human installs it. The plan keeps the foundations in one place and the per-host
specifics in their own folders, so a consumer (the website configurator,
khai-tour) can compute a working world by combining the foundation with one
host's setup.

## Orders

- To whoever stands the world up (a human, or a configurator built on
  khai-tour): pick the host, open its folder, follow its `README.md`, and
  upload the files it lists.
- The contract is fixed: take [raw](instructions_raw.md) as the basis and never
  fork it per host.
- A host extends only through the seam the [architecture](architecture.md)
  leaves open -- never by editing the canon or the contract.

## Implementation

- The basis: [raw](instructions_raw.md), the provider-neutral collaboration
  contract every host starts from.
- The seam: the [architecture](architecture.md) extension point, where a host
  attaches its specifics without moving the canon.
- Per host, a folder `<host>/` carries both faces of the setup: a `README.md`
  with the user-facing installation instructions, and the files to upload to
  that host. The folder name is the host's short slug (`claude/`,
  `perplexity/`, ...), so the layout is navigable straight from GitHub.

## Targets

One target per host; each opens when its folder ships.

- [ ] Claude.ai (Projects): `claude/`
- [ ] Perplexity (Space): `perplexity/`
- [ ] Gemini (Gems): `gemini/`
- [ ] NotebookLM: `notebooklm/`
- [ ] further hosts as they are named
