---
khai: plan
title: "Keep Clean"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-06-11"
status: active
---

# Plan: Keep Clean

## Taxonomy

A **mandate**: a standing checklist the Roadie holds, run continuously rather than
on a one-off cue.

## Owner

- Owner: [The Roadie](position_roadie.md)

## Direction

Every project the chain owns, khai itself and each house (a website is just
another house), stays clean: nothing red, nothing stale. The board is green so
the rest of the company can produce on solid ground.

## Orders

The Roadie runs this continuously and guards it. Findings are surfaced and the
deterministic tools are run; the Roadie never edits content to make a check pass,
and never authors. A finding the Roadie cannot clear by running a tool is raised
to the Choregos, not fixed by hand.

## Implementation

The gates (test, khai-guard, branch-scope), dependency updates, the security
panel (alerts, secret scanning, CodeQL), and `khai-tests`. Deterministic tools
only; the content and the rules are out of bounds.

## Targets

- [ ] dependencies up to date: no green dependency update left unmerged
- [ ] security panel clean: no open alerts, secret scanning clear, CodeQL green
- [ ] all instance files conform (`khai-tests`)
- [ ] the gates are green on every open change
