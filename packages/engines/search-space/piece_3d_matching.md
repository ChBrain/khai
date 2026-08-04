---
khai: piece
title: "3D Matching"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-08-04"
---

# Piece: 3D Matching

## Taxonomy

[Partitioning](place_partitioning.md). The 3D Matching problem, representing tripartite compatibility.

## Owner

- Project: khai
- Engine: search-space

## Place

Located in the Partitioning chamber, [Partitioning](place_partitioning.md), linking three disjoint sets of elements.

## Load Bearing

Without the 3D Matching, we cannot model multi-way resource grouping. It is the key to scheduling tripartite agreements (e.g., matching tasks, processors, and time slots): if we cannot find a perfect matching, resources will lie idle or conflicts will stall the schedule. The 3D Matching is load bearing because it shows how adding a third dimension of compatibility turns a tractable 2D problem (bipartite matching in P) into an intractable one.

## Apparent

A set of disjoint triples, each containing one element from three separate sets. It looks like a set of perfect pairings, a clean arrangement of compatible trios.

## Yearbook

Proven NP-complete by Richard Karp in 1972. It represents the canonical example of how dimensionality increases computational complexity, carrying the history of database query optimization and advanced matching theory.
