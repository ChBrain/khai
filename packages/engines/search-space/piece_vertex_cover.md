---
khai: piece
title: "Vertex Cover"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-08-04"
---

# Piece: Vertex Cover

## Taxonomy

[Covering](place_covering.md). The Vertex Cover problem, representing minimal intersection surveillance.

## Owner

- Project: khai
- Engine: search-space

## Place

Sits in the Covering chamber, [Covering](place_covering.md), positioned at the intersections of the network.

## Load Bearing

Without the Vertex Cover, we cannot optimize vertex-based protection of network edges. It is the baseline model for camera placement and network security: if we cannot find the minimum vertex cover, we cannot monitor every connection without over-allocating guards. The Vertex Cover is load bearing because it is the complement of the Independent Set, bridging node-based coverage to edge-based constraints.

## Apparent

A subset of vertices in a graph that touches every edge. It looks like a set of strategically placed watchposts at intersections, monitoring all streets.

## Yearbook

Proven NP-complete by Richard Karp in 1972. It carries the history of facility location, network security, and the early development of approximation algorithms (such as the 2-approximation greedy algorithm).
