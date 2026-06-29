---
updated: "2026-06-29"
---

# Reward: Reference

## Line of Work

Reward as **process**: how the organism values outcomes across time, and how the steepness of the temporal discount shapes which outcomes pull and how hard the persona works toward them. The domain does not model motivation in the sense of the source or direction of drive -- that is the motivation engine's territory -- but the _valuation mechanism_ beneath the drive: how much an outcome is worth at a given distance, why immediate rewards pull harder than rational discounting predicts, and what happens when the wait itself becomes aversive rather than merely suboptimal.

The spine is the delay-discounting and dual-pathway model: reward sensitivity and delay aversion are separable pathways, each with its own deficit profile. Immediate reward is not just the deferred with less waiting; delay aversion is not just a steep discount. The distinction matters because the behavior looks the same from outside and requires different understanding from inside.

## Origin

Behavioural economics, reinforcement learning theory, and the neuroscience of reward processing, applied directly as process constraints.

| Source                              | Key Work                                                                                                                    | Scope                                                                                                                                                                                            |
| :---------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Edmund J.S. Sonuga-Barke**        | _"Psychological Heterogeneity in AD/HD: A Dual Pathway Model of Behaviour and Cognition"_ (2002)                            | The dual-pathway model: executive dysfunction and delay aversion as separable deficits; delay aversion as an active aversive response to the interval, not merely a steep discount rate.         |
| **Gail Tripp & Jeffrey R. Wickens** | _"Research Review: Dopamine Transfer Deficit: A Neurobiological Theory of Altered Reinforcement Mechanisms in ADHD"_ (2008) | Dopamine as the learning signal for reward prediction; how an attenuated dopamine transfer signal produces altered reinforcement and a preference for immediate, frequent feedback.              |
| **George Ainslie**                  | _Picoeconomics_ (1992)                                                                                                      | Hyperbolic discounting: why near rewards pull disproportionately harder than rational exponential discounting predicts; the mechanism of preference reversal as the near option comes into view. |
| **Wolfram Schultz**                 | _"Predictive Reward Signal of Dopamine Neurons"_ (1998)                                                                     | The dopamine prediction error model: reward signals encode the gap between expected and actual outcome, not the reward itself; the learning mechanism that builds and updates reward valuation.  |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **Motivation**: The engine models the _valuation_ of outcomes across time, not the source or direction of the drive that pursues them. Why the persona wants something -- intrinsic interest, external pressure, or absence of reason -- is governed by the motivation engine; this engine governs how much the outcome is worth at its current distance.
- **Decision**: The engine models reward valuation as input to choice, not the choice process itself. How the persona selects between options -- quickly, slowly, by heuristic, or by paralysis -- is owned by the decision engine; this engine governs the weight each option carries before the selection is made.
- **Emotion**: The engine models the rewarding or aversive quality of anticipated outcomes, not the emotional response to those outcomes. Joy at receiving, disappointment at missing, and frustration at waiting are owned by the emotion engine; this engine governs the pull of the anticipated outcome before it arrives.
- **Stress**: The engine models stimulation-seeking as arousal regulation, not as a stress response. Where the stress engine models the organism under demand building toward discharge, this engine models the organism correcting an arousal deficit through behavior.

## Encoding

Source to constraint, per file.

- **[reward](process_reward.md)** (the root): The outcome is read and the discount is applied; the persona moves toward it in proportion to its discounted weight. Anchored by Schultz (dopamine prediction error) and Ainslie (hyperbolic discounting).
- **[immediate](process_immediate.md)** (mode): The outcome is near and carries near-full weight; what competes is concurrent pulls, not time. Anchored by Ainslie (the near end of the hyperbolic curve) and Tripp & Wickens (preference for frequent, immediate feedback).
- **[deferred](process_deferred.md)** (mode): The outcome is distant; the discount has run and the value has contracted; the persona persists or abandons. Anchored by Ainslie (hyperbolic discounting and preference reversal) and Sonuga-Barke (delay as a distinct pathway from executive deficit).
- **[delay-averse](process_delay_averse.md)** (mode): The interval itself is aversive; the persona acts to end the wait rather than to maximise the outcome. Anchored by Sonuga-Barke (delay aversion as a separable pathway from simple steep discounting).
- **[stimulation-seeking](process_stimulation_seeking.md)** (mode): Arousal is below threshold; the persona seeks input to correct the deficit, not to pursue a specific outcome. Anchored by Tripp & Wickens (dopamine and the optimal stimulation model) and Sonuga-Barke (the motivational pathway in ADHD).
