---
khai: piece
title: "Set Cover"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-08-04"
---

# Piece: Set Cover

## Taxonomy

[Covering](place_covering_family.md). The Set Cover problem, representing general constraint satisfaction.

## Owner

- Project: khai
- Engine: search-space

## Place

Located in the Covering chamber, [Covering](place_covering_family.md), encompassing subsets of the universe.

## Load Bearing

Without the Set Cover, we cannot model general covering constraints where resources have overlapping capabilities. It is the key to scheduling shifts, selecting service providers, and satisfying multi-dimensional requirements: if we cannot find the minimum set cover, the cost of redundancy will collapse the plan. The Set Cover is load bearing because it is the generalization of Vertex Cover, representing the boundary of logarithmic approximation limits.

## Apparent

A collection of subsets whose union covers the entire universe of elements. It looks like a catalog of packages or shifts, selected to ensure that every single item or hour is handled.

## Yearbook

Proven NP-complete by Richard Karp in 1972. It has been the primary testbed for studying greedy approximation ratios, carrying the history of optimization bounds established by Vasek Chvatal and others.
