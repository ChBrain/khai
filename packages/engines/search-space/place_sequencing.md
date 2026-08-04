---
khai: place
title: "Sequencing"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-08-04"
---

# Place: Sequencing

## Taxonomy

[NP-complete](place_np_complete.md). The Sequencing chamber, where targets must be visited in order.

## Owner

- Project: khai
- Engine: search-space

## Shown

A room containing a map of scattered nodes with paths of varying lengths connecting them. A traveler stands at the edge, holding a map with distances and a strict budget of steps, looking for a way to visit every node without repeating a path.

## Holds

Sequencing and routing problems, including the search for [the tour](piece_the_tour.md).

## Offers

The search for sequential orders. The room offers a persona the task of scheduling visits or transactions to cover all targets within a set budget.

## Withheld

The optimal sequence. The room withholds the shortest route (the TSP tour) or the Hamiltonian path, forcing the traveler to double back or spend more than they planned.
