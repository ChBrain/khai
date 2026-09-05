---
model: google-gemini-3-8-flash
reader: google-gemini-3-8-flash
temperature: default
date: 2026-09-05
fixture: village-bakery
ask_sha: 4629e03d52a24620801e4ae3e7d1e6d64b0efe2b7748383c5f639d86571146ea
expect_sha: 35710c02085caa053b1de35f06628fb6d8990554d9f80b6300fe18164f875e14
skill_sha: 9d61a1b854b4aed1e9ebd8ca61b73c3d57d02aed969c1c6a9e9853c431bb001d
verdict: flag
---

# Output

---

khai: play
title: "The Hearth at Cold Dawn"
description: "Two days before the harvest fair, a village bakery's central hearth collapses, forcing four people to decide who bears the cost of feeding the parish."
license: CC-BY-NC-SA-4.0
stamp:
owner: The Author
version: v0.0.1
date: "2026-09-05"

---

# Play: The Hearth at Cold Dawn

## Estate

The Author holds the whole run and answers for the production.

## Name

The Hearth at Cold Dawn

## Arc

A quiet crisis turns desperate and then political. The play begins in the cold dark with a physical failure: the master oven cracks before daybreak, ruining the first firing. It bends when private panic meets commercial leverage: the miller refuses credit for spoiled grain, turning a craft breakdown into an economic standoff. The bend tightens when civic power intervenes: the mayor arrives not to assist, but to demand the fair's ceremonial feast proceed regardless of cost or safety. The run resolves not with an easy restoration, but with a forced compromise that permanently shifts authority inside the shop. Reordering the scenes would break the progression from stone failure, to debt, to civic coercion, to the final fracture between master and apprentice.

## Company

The closed cast fields four personas, their offices, the ground of the collision, its instruments, and the key in which the collision sounds:

- Personas:
  - `persona_marta_baker.md` (Marta, master baker: stubborn, protective of the shop's name, carrying twenty years of salt and heat)
  - `persona_tomas_apprentice.md` (Tomas, apprentice: observant, technically sharp, torn between craft loyalty and the need to survive)
  - `persona_elias_miller.md` (Elias, the valley miller: pragmatic, strictly contractual, wary of rural debt)
  - `persona_aldous_mayor.md` (Mayor Aldous: patron of the harvest fair, preoccupied with parish prestige and public order)
- Positions:
  - `position_master_baker.md` (held by Marta)
  - `position_apprentice.md` (held by Tomas)
  - `position_mill_master.md` (held by Elias)
  - `position_parish_reeve.md` (held by Aldous)
- Places:
  - `place_bakehouse.md` (the low-timbered bakery floor, dominated by the stone deck oven)
  - `place_parish_green.md` (the grounds outside, where fair pavilions are already rising)
- Pieces:
  - `piece_the_grand_hearth.md` (the masonry bread oven, fractured across its crown)
  - `piece_spelt_flour_consignment.md` (twelve sacks of high-grade milled spelt sitting vulnerable to damp)
  - `piece_fair_charter.md` (the municipal seal binding the shop to supply the harvest loaf)
- Processes:
  - `process_emergency_clay_packing.md` (a hazardous method to seal cracked firebrick under heat)
  - `process_contract_settlement.md` (the formal exchange of grain tallies for municipal coin)
- Plans:
  - `plan_tomas_provisional_firing.md` (an unproven sequence to run the auxiliary pastry flue instead of the main deck)
  - `plan_aldous_commandeered_bake.md` (an executive mandate to seize external brick and labor)
- Pitch:
  - `pitch_strained_realism.md` (default key: taut, low, unadorned dialogue marked by practical pressure, physical labor, and the dread of daylight)

## Triggers

The run moves through three chained plots:

1. `plot_the_dropped_crown.md`
   - Entry: Marta lights the pre-dawn kindling and discovers the crown brick has dropped inward, choking the draught.
   - Exit: Tomas proposes jury-rigging the pastry flue, but the repair requires new binder and dry timber that the shop does not own.
2. `plot_the_miller_at_the_sill.md`
   - Entry: The close of the dropped crown: Tomas runs to fetch binding loam and meets Elias delivering the harvest flour consignment.
   - Exit: Elias refuses to drop the sacks off the wagon without upfront coin, citing rumor of the oven's ruin, leaving the flour exposed on the wet threshold.
3. `plot_the_mayor_demands_bread.md`
   - Entry: The close of the mill dispute: Mayor Aldous enters the bakehouse to inspect the ceremonial grain and finds the mill sacks stalled at the door.
   - Exit: Aldous invokes the fair charter to force a dangerous provisional firing, compelling Tomas to execute his untested plan over Marta's explicit prohibition.

## Stakes

The parish harvest loaf and the independence of the bakery shop. If the oven remains dead, Marta defaults on the fair charter, forfeits her trade seat, and the village marks the season with rationing. If the oven is patched carelessly and explodes or chars the grain, the shop burns and the flour debt remains due to Elias. Every plot directly shifts the probability of whether the hearth stays independent, falls under municipal confiscation, or ruins the baker outright.

# Reading

flag

- The mode is decided first and said: not met; the output does not state "Mode A, one play file, no plot files, no pitch file" before the play file.

- The output is one play file in the template's shape: met; it contains the required frontmatter keys, the H1 `Play: <title>`, and exactly the six specified H2 headers in exact order with no others.

- The Arc names a bend: met; it details the bend, unifies the plots into one telling, and explains why reordering causes loss.

- The Company is closed: met; all four characters are listed with what they carry, the oven and bakery are placed, and all elements in Triggers and Stakes originate from Company.

- Triggers chain: met; each plot links its cue to the exit of the preceding plot and concludes with a definitive close.

- The Stakes move: met; the shifting consequences and escalating risks across the run are explicitly stated.

- The Estate names who answers for the run, and the Name is distinct from the H1: not met; Name ("The Hearth at Cold Dawn") repeats the H1 title ("The Hearth at Cold Dawn") instead of being distinct from it.

- No em-dash or en-dash anywhere in the output: met; neither an em-dash nor an en-dash appears in the text.

- Nothing beyond the ask: not met; it introduces a second location (`place_parish_green.md`) that the ask did not name.

- Where the ask is silent, the playwright asks the author, in at most two questions after the file: not met; the output ends without asking questions to the author.
