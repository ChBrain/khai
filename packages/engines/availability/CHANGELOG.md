# @chbrain/khai-engine-availability

## 0.1.1

### Patch Changes

- a588291: Add the availability engine: the estimation process through which a persona judges how frequent or likely a class of events is by how easily instances of it come to mind. The root (`process_availability.md`) declares Tversky & Kahneman's availability heuristic -- the second of the three original heuristics of judgment under uncertainty, sister to `anchoring` -- the felt ease of bringing instances up taken for the true rate, so the vivid, recent, and easily pictured are judged more frequent than they are. Three forms carry it, taken directly from Tversky & Kahneman's own enumeration of availability biases: `retrievability` (the recall route -- the recent, vivid, and charged surface first, and it is the felt ease, not the count, that is read -- with Schwarz's ease-of-retrieval refinement), `searchability` (the search-set route -- the estimate depends on how memory is searched, a class easy to search along one dimension judged more frequent than one hard to search), and `imaginability` (the construction route -- for events not stored, the ease of picturing an instance stands in for its probability).

  No homonym gate: `bias` catalogues availability only under the suffixed stems `availability_heuristic`, `availability_cascade`, and `ease_availability`, so the engine's bare root stem `availability` does not collide -- unlike `anchoring`, which needed the whitelist because `bias` held a bare `position_anchoring.md`. Bounded against `memory` (the storage and retrieval machinery the ease rides on vs the inference from ease to frequency), `anchoring` (the reference-pull sister heuristic vs the ease-of-recall one), `decision` (the mode of choosing vs the frequency estimate), and `bias` (the static catalogued tilt vs the live estimation). Warranted (LORE) on Tversky & Kahneman (_Availability_, 1973; _Judgment under Uncertainty_, 1974), Schwarz et al. (ease of retrieval as information, 1991), Lichtenstein & Slovic et al. (judged frequency of lethal events, 1978), and Carroll (imagining an event raising its judged likelihood, 1978). Set at patch as the free level; a new engine may warrant a minor at the maintainer's `bump:minor` label.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
