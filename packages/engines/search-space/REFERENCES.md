---
date: 2026-08-04
---

# Search Space: Reference

## Line of Work

Computational complexity as **place** and **piece**: cataloging the structural limits of tractability and intractability in search and optimization. The domain does not model how a persona chooses to search (which is the decision engine's) or the motivation to search (which is the motivation engine's); it models the physical and mathematical properties of the search environment itself: what it Shown, Holds, Offers, and Withholds under pressure.

The spine is theoretical computer science: problems are not hard because of lack of effort or tools, but because they belong to complexity classes that structurally refuse efficient resolution under standard assumptions (such as P != NP).

## Origin

Theoretical computer science and algorithm analysis, applied directly as environmental and object constraints.

| Source                                       | Key Work                                                                                       | Scope                                                                                                             |
| :------------------------------------------- | :--------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Garey &amp; Johnson**                      | _Computers and Intractability: A Guide to the Theory of NP-Completeness_ (1979)                | The taxonomy of NP-completeness and the five classic families of hard problems.                                   |
| **Stephen Cook / Leonid Levin**              | _"The Complexity of Theorem-Proving Procedures"_ (1971) / _"Universal Search Problems"_ (1973) | The definition of NP-completeness and the first reductions.                                                       |
| **Richard Karp**                             | _"Reducibility among Combinatorial Problems"_ (1972)                                           | Karp's 21 problems, proving NP-completeness spans diverse combinatorial structures.                               |
| **Daskalakis, Goldberg &amp; Papadimitriou** | _"The Complexity of Computing a Nash Equilibrium"_ (SIAM J. Comput. 2009)                      | Proving that finding a Nash equilibrium is PPAD-complete, establishing the limits of market and game equilibrium. |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **Search Strategy**: The engine models the difficulty of the space, not the technique of the searcher. How a persona resolves between options or handles search paths is **delegated to the decision engine**.
- **Motivation**: The engine models the pressure of the environment, not the reason the persona searches. The drive to complete the search is **delegated to the motivation engine**.
- **Beliefs**: The engine models the mathematical reality of the space, not the persona's map of it. What the persona believes to be true about the space is **delegated to the belief engine**.
- **Outcomes**: The engine models the limits of computation, not whether a specific attempt succeeds. The consequences of failure or success are owned by the play's arc.

## Encoding

Source to constraint, per file.

- **[place_the_search_space](place_the_search_space.md)** (the root): The overall space of computational complexity, where limits act as a structural refusal.
- **[place_p](place_p.md)** (Place): The region of tractability, where solutions are cheap to produce and verify.
- **[piece_the_path](piece_the_path.md)** (Piece): The shortest path problem, the baseline of polynomial-time search (Dijkstra, Bellman-Ford, Moore).
- **[place_np](place_np.md)** (Place): The region of easy verification but difficult search.
- **[place_np_complete](place_np_complete.md)** (Place): The core gallery of NP-completeness, where reductions connect all rooms.
- **[place_packing](place_packing.md)** (Place): Packing sub-region, searching for compatible subsets.
- **[piece_independent_set](piece_independent_set.md)** (Piece): Independent set problem, finding mutually isolated choices (Karp).
- **[piece_the_clique](piece_the_clique.md)** (Piece): Clique problem, representing mutually compatible choices (Karp).
- **[place_covering_family](place_covering_family.md)** (Place): Covering sub-region, minimizing resources to satisfy constraints.
- **[piece_vertex_cover](piece_vertex_cover.md)** (Piece): Vertex cover problem, covering structural edges (Karp).
- **[piece_set_cover](piece_set_cover.md)** (Piece): Set cover problem, covering a universe of elements with subsets (Karp).
- **[place_sequencing](place_sequencing.md)** (Place): Sequencing sub-region, visiting all targets in order.
- **[piece_hamiltonian_cycle](piece_hamiltonian_cycle.md)** (Piece): Hamiltonian cycle problem, visiting every vertex exactly once (Karp).
- **[piece_the_tour](piece_the_tour.md)** (Piece): The Traveling Salesman Problem (TSP), finding the optimal sequence.
- **[place_partitioning](place_partitioning.md)** (Place): Partitioning sub-region, dividing resources to avoid conflicts.
- **[piece_graph_coloring](piece_graph_coloring.md)** (Piece): Graph coloring problem, preventing adjacent conflicts (Stockmeyer).
- **[piece_3d_matching](piece_3d_matching.md)** (Piece): 3D matching problem, tripartite compatibility (Karp).
- **[place_numerical](place_numerical.md)** (Place): Numerical sub-region, balancing values and weights.
- **[piece_knapsack](piece_knapsack.md)** (Piece): Knapsack problem, optimizing value under capacity bounds (Dantzig, Karp).
- **[piece_subset_sum](piece_subset_sum.md)** (Piece): Subset sum problem, finding subset matching target value (Karp).
- **[place_np_hard](place_np_hard.md)** (Place): NP-hard region, where verification is not guaranteed.
- **[place_pspace](place_pspace.md)** (Place): PSPACE region, memory-bounded computation.
- **[place_ppad](place_ppad.md)** (Place): PPAD region, where solutions exist but are hard to reach.
- **[piece_the_equilibrium](piece_the_equilibrium.md)** (Piece): The Nash equilibrium vector, the limits of market balance (Daskalakis et al.).
