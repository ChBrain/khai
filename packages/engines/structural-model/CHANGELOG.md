# @chbrain/khai-engine-structural-model

## 0.1.1

### Patch Changes

- 89f6397: Add the structural-model engine (position: anchor + expressions) -- Freud's second topography of the psyche: three agencies in standing dynamic conflict over a drive, a prohibition, and the demands of reality. First engine of the Freud effort (the spine of the metapsychology), toward a future `Freud` composite.

  - **Anchor (position):** `structural-model` -- the tripartite psyche as a whole; the persona is not of one mind but a negotiation among three agencies, its acts compromise-formations (Freud, _The Ego and the Id_, 1923).
  - **Faces (position)** -- the three agencies:
    - `id` -- the reservoir of the drives (libidinal + aggressive, the dual-drive theory folded in), ruled by the pleasure principle: unconscious, timeless, heedless of logic/reality/morality, pressing for immediate discharge.
    - `ego` -- the executive ruled by the reality principle: the mediator that touches all three (id, superego, world), deferring, redirecting, defending; anxious in proportion to the conflict.
    - `superego` -- the internalized moral authority: a conscience that punishes transgression (and the wish of it) with guilt, and an ego-ideal that sets the standard and lashes with shame.

  **Scope note -- the metapsychological structure, not its conscious faces or single functions.** The conscious self-story stays with `identity`; the ego's in-the-moment impulse-override with `self-control`; the ego's unconscious defensive manoeuvres with the existing `defense` engine (Anna Freud/Vaillant hierarchy); the superego's conscious moral trait with `moral-identity` and its act-verdicts with `moral-judgment`; the felt guilt/shame with `guilt`/`shame`; the id's reward value with `reward` and its affect with `emotion`. This engine owns the three-agency structure and its standing conflict.

  Warranted (LORE) on Freud -- _The Ego and the Id_ (1923, the founding), _New Introductory Lectures_ (1933, "The Dissection of the Psychical Personality"), _Beyond the Pleasure Principle_ (1920, the dual drives), and _Civilization and Its Discontents_ (1930, the superego's severity). A foundational metapsychological model (theory, not a single empirical finding) and among the most influential frameworks in psychology's history. Set at patch as the free level. No whitelist required -- the `structural_model` / `id` / `ego` / `superego` stems are unique (exact-stem checked; the many substring hits like `identity`/`egocentric` are distinct stems).

- 86af70e: Backfill the structural-model engine's REFERENCES lineage -- credit the tradition that built on Freud, not Freud alone. The engine merged before the "warrant is a lineage, not solo work" principle was applied to the rest of the Freud effort; this brings its Origin table into line with `transference`, `the-unconscious`, `ambivalence`, and the `freud` composite.

  - **Line of Work:** adds the ego-psychology and neuropsychoanalysis development -- Freud founded the structural model, and the tradition after him grew the ego (A. Freud; Hartmann) and grounded the agencies in the brain (Solms).
  - **Origin table:** adds three rows -- **Anna Freud** (_The Ego and the Mechanisms of Defence_, 1936; the turn to the ego as an agency in its own right), **Heinz Hartmann** (_Ego Psychology and the Problem of Adaptation_, 1939; the ego's autonomous conflict-free functions and adaptation), and **Mark Solms** (_The Brain and the Inner World_, 2002; _The Hidden Spring_, 2021; neuropsychoanalysis, mapping the id's instinctual pressure onto subcortical affective systems).
  - **Encoding:** the anchor and id lines now note Solms's neuroscientific grounding; the ego line notes ego psychology (A. Freud; Hartmann).

  Content-only, no manifest or interface change. The defense catalogue itself stays delegated to the `defense` engine -- A. Freud is credited here for the ego-as-agency turn, not the defense taxonomy. Set at patch.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
