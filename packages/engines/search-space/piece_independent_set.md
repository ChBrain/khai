---
khai: piece
title: "Independent Set"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-08-04"
---

# Piece: Independent Set

## Taxonomy

[Packing](place_packing.md). The Independent Set problem, representing mutually isolated choices.

## Owner

- Project: khai
- Engine: search-space

## Place

Located in the Packing chamber, [Packing](place_packing.md), distributed across the graph nodes.

## Load Bearing

Without the Independent Set, we cannot model packing constraints under complete isolation. It is the key to scheduling tasks that cannot run concurrently, selecting locations that must remain separated, and allocating conflict-free resources: if we cannot find the maximum independent set, we cannot guarantee maximum utilization without collisions. The Independent Set is load bearing because it is the exact dual of the Clique problem, forming the baseline of packing reductions.

## Apparent

A set of vertices in a graph such that no two vertices are adjacent. It looks like a scattered set of points on a map, with no connections or pathways between them.

## Yearbook

Proven NP-complete by Richard Karp in 1972 as one of his original 21 problems. It carries the history of scheduling theory, wireless channel allocation, and the analysis of social network independence.
