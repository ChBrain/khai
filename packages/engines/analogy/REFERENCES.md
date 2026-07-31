---
updated: "2026-07-31"
---

# Analogy: Reference

## Line of Work

Analogy as a **process** engine: reasoning by structure-mapping -- aligning the relational structure of a known source domain with a target and carrying inferences across the alignment -- taken across the four subprocesses of the mapping. The domain does not model the rhetorical shaping of a claim, including framing by metaphor, which is the framing engine's; nor the general retrieval of memories as such, which is the memory engine's; nor the psychological-distance abstraction of construal level, which is the construal engine's. It models the reasoning and transfer mechanism itself -- how a persona aligns two structures on their relations, not their surfaces, and moves knowledge across the alignment.

The spine is Gentner's structure-mapping theory and Gick and Holyoak's work on analogical transfer. Gentner cast analogy as the mapping of relations, not attributes: an analogy sets the elements of a base domain in correspondence with a target so that the relations among them align, and its quality is governed by systematicity -- the alignment prefers deep, interconnected systems of relations, especially higher-order relations like cause, over isolated shared features. The mapping obeys structural constraints, one-to-one correspondence and parallel connectivity, and once it holds, the base's unmatched relations project across it as candidate inferences, the transfer that lets a known domain predict an unknown one. Gick and Holyoak showed the practical stakes: solvers routinely fail to retrieve a structurally matching source when it differs on the surface, and transfer improves dramatically when they compare two analogs and abstract the shared schema, which then serves as a reusable, domain-general pattern. The engine takes structure-mapping as its root and the subprocesses -- retrieval, mapping, inference, and schema abstraction -- as its forms. The altitudes are those: the structure-mapping, and its four subprocesses.

## Origin

The cognitive science of analogical reasoning, applied directly as engine constraints across process.

| Source                                                 | Key Work                                                                                   | Scope                                                                                                                                                                      |
| :----------------------------------------------------- | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dedre Gentner**                                      | _"Structure-Mapping: A Theoretical Framework for Analogy"_ (Cognitive Science, 1983)       | The founding -- analogy as relational structure-mapping, the systematicity principle, and the structural constraints on the alignment. The root and all four subprocesses. |
| **Mary Gick & Keith Holyoak**                          | _"Analogical Problem Solving"_ (1980); _"Schema Induction and Analogical Transfer"_ (1983) | The transfer findings -- surface-driven retrieval failures, and schema induction from comparing analogs as the key to transfer. The retrieval and schema subprocesses.     |
| **Keith Holyoak & Paul Thagard**                       | _"Analogical Mapping by Constraint Satisfaction"_ (Cognitive Science, 1989)                | Mapping as the satisfaction of structural, semantic, and pragmatic constraints in parallel. The mapping subprocess.                                                        |
| **Brian Falkenhainer, Kenneth Forbus & Dedre Gentner** | _"The Structure-Mapping Engine"_ (Artificial Intelligence, 1989)                           | The computational model of structure-mapping -- alignment and candidate-inference projection made explicit. The mapping and inference subprocesses.                        |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **Rhetorical framing (framing)**: The engine models the reasoning mechanism, not the persuasive shaping. How a claim is framed to move an audience -- including the metaphor used rhetorically, to colour rather than to reason -- is owned by the framing engine; analogy is the structure-mapping and transfer beneath a comparison, whether or not it is ever used to persuade. Framing bends how a thing is seen; analogy works out how one thing is built like another. A metaphor can do both, but the two engines own its two jobs.
- **General memory retrieval (memory)**: The engine models the retrieval of a source analog specifically, and its structure-versus-surface bias, not the retrieval of memories in general. How a persona stores and recovers episodes, facts, and procedures is owned by the memory engine; analogy's retrieval subprocess owns only the analog-access step and the well-documented mismatch between what cues it (surface) and what makes it useful (structure). Memory recovers the past; analogy's retrieval recovers a base to map.
- **Construal-level abstraction (construal)**: The engine models relational abstraction -- lifting a shared structural schema out of two cases -- not the abstraction of psychological distance. How near or far a thing is construed, high level versus low level, is owned by the construal engine; analogy's schema subprocess owns the distilling of a domain-general relational pattern from aligned analogs. Both abstract, but along different axes: construal by distance, analogy by shared relational structure.
- **Categorization by kind**: The engine models comparison across domains that share structure, not the sorting of instances into a category. Placing a thing among its kind, by its features or its family resemblance, is a distinct operation from mapping one structured domain onto another; analogy can seed a category and a category can supply a source, but the assignment-to-kind is not the structure-mapping this engine owns.

## Encoding

Source to constraint, per file.

- **[analogy](process_analogy.md)** (the root, process): Reasoning by structure-mapping -- aligning relational structure across domains and transferring across the alignment, systematicity favouring deep relations over surface. Anchored by Gentner (structure-mapping and systematicity).
- **[retrieval](process_retrieval.md)** (process, form): A source analog called to mind from the target, driven by surface where soundness needs structure. Anchored by Gick & Holyoak (retrieval failures).
- **[mapping](process_mapping.md)** (process, form): The structural alignment -- one-to-one correspondence and parallel connectivity under systematicity. Anchored by Gentner and Holyoak & Thagard (mapping as constraint satisfaction).
- **[inference](process_inference.md)** (process, form): Candidate inferences projected across the alignment as new predictions about the target. Anchored by Gentner and Falkenhainer, Forbus & Gentner (candidate-inference projection).
- **[schema](process_schema.md)** (process, form): The shared relational structure abstracted into a domain-general schema that eases future transfer. Anchored by Gick & Holyoak (schema induction).
