---
khai: piece
title: "Hamiltonian Cycle"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-08-04"
---

# Piece: Hamiltonian Cycle

## Taxonomy

[Sequencing](place_sequencing.md). The Hamiltonian Cycle problem, representing unweighted sequential coverage.

## Owner

- Project: khai
- Engine: search-space

## Place

Located in the Sequencing chamber, [Sequencing](place_sequencing.md), trace-routing the nodes of the graph.

## Load Bearing

Without the Hamiltonian Cycle, we cannot represent the unweighted sequence that visits all states. It is the core of scheduling and sequence validation: if we cannot find a Hamiltonian cycle, we cannot guarantee that a process can visit all checkpoints without repeating a state. The Hamiltonian Cycle is load bearing because it is the baseline sequencing reduction, directly anchoring the TSP tour.

## Apparent

A closed loop in a graph that visits every vertex exactly once. It looks like a single thread woven through all vertices, forming a perfect circle with no crossings.

## Yearbook

Formulated by William Rowan Hamilton in 1857 as the Icosian game. It was proven NP-complete by Richard Karp in 1972, representing the bridge between simple Eulerian paths (in P) and hard sequential routing.
