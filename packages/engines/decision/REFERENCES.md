---
updated: "2026-06-29"
---

# Decision: Reference

## Line of Work

Decision as **process**: how a persona resolves between competing options when the outcome is uncertain and only one path can be taken. The domain does not model motivation (that is the motivation engine's) or belief revision (that is the belief engine's); it models the mode of resolution itself -- how the persona commits when it cannot be certain.

The spine is bounded rationality and dual-process theory: decisions are not made by an ideally informed, fully deliberating agent, but by a bounded one who uses fast pattern-matching, slow deliberation, shortcuts, and satisficing thresholds to commit under time and cognitive pressure.

## Origin

Judgement and decision-making research, applied directly as process constraints.

| Source | Key Work | Scope |
| :--- | :--- | :--- |
| **Daniel Kahneman** | *Thinking, Fast and Slow* (2011) | System 1 (fast, associative, automatic) and System 2 (slow, deliberate, effortful) as dual modes of judgement. |
| **Herbert Simon** | *"A Behavioural Model of Rational Choice"* (1955) | Satisficing: selecting the first option that clears a threshold rather than searching for the optimum. |
| **Amos Tversky &amp; Daniel Kahneman** | *"Judgment under Uncertainty: Heuristics and Biases"* (1974) | Heuristics as cognitive shortcuts that are usually efficient and systematically wrong in predictable ways. |
| **Barry Schwartz** | *The Paradox of Choice* (2004) | Decision paralysis under abundance: more options can produce worse outcomes when the cost of commitment is felt acutely. |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **Motivation**: The engine models how a persona resolves between options, not why it wants to act. What drives action and from where the drive springs is **delegated to the motivation engine**. A persona may be highly motivated and still run the paralysed mode; motivation and decision are separate.
- **Belief**: The engine models the resolution mode, not the content of what the persona holds. What the persona believes to be true about the options is owned by the belief engine; this engine models what the persona does with that belief when choosing.
- **Values**: The engine models the cognitive mode of resolution, not the value system that sets the threshold for good enough. What the persona cares about, and in what order, is owned by the persona's virtue and motivation engines and by the play's arc.
- **Outcomes**: The engine models the process of deciding, not whether the decision was right. What follows from the commitment is owned by the scene and the arc; this engine governs the moment of commitment itself.

## Encoding

Source to constraint, per file.

- **[decision](process_decision.md)** (the root): The moment where options press against uncertainty and the persona must commit; the mode is set by the stakes and the available information. Anchored by Kahneman (the general decision problem) and Simon (bounded rationality).
- **[intuitive](process_intuitive.md)** (expression): Fast, pattern-matched, pre-verbal -- the answer arrives before the question is finished. Anchored by Kahneman (System 1).
- **[deliberate](process_deliberate.md)** (expression): Slow, comparative, effortful -- the options are held open and examined before committing. Anchored by Kahneman (System 2) and Simon (deliberate analysis within bounds).
- **[heuristic](process_heuristic.md)** (expression): Rule-of-thumb, invisible to the persona, efficient in the familiar case and wrong in predictable ways. Anchored by Tversky &amp; Kahneman (availability, representativeness, anchoring).
- **[satisficing](process_satisficing.md)** (expression): First-good-enough taken; the search closes before the optimum is found. Anchored by Simon (satisficing as the rational strategy under bounded resources).
- **[paralysed](process_paralysed.md)** (expression): No commitment made; the cost of being wrong blocks movement; the non-choice becomes a choice. Anchored by Schwartz (decision paralysis under abundance and high stakes).
