# @chbrain/khai-engine-altruistic-punishment

## 0.1.1

### Patch Changes

- 55da781: Add the altruistic-punishment engine (process: root + forms) -- the costly sanctioning of a norm violator, a persona paying a personal price with no material return to make a defector answer for breaking a cooperative norm. The gap analysis (Tier-3 #23) found no engine owned the _behavioral act_ of costly norm enforcement; `condemnation` owns the moral emotion and `aggression` the raw harm-delivery, but not the sanction itself.

  - **Root (process):** `altruistic-punishment` -- the persona spends its own resource (money, effort, safety, standing) to punish a defector, expecting nothing material back; the cost is the defining mark.
  - **Forms (process):**
    - `second-party` -- the persona was in the exchange and was defected on, and pays to punish even when the encounter will not repeat and recovers nothing (Fehr & Gachter's public-goods punishment in one-shot, anonymous settings).
    - `third-party` -- the persona was an uninvolved observer, and pays to punish a violation that cost it nothing, purely to enforce a norm it holds for others (Fehr & Fischbacher's third-party punishment).

  Both are driven by strong reciprocity -- the disposition to reward cooperation and punish defection at personal cost, absent any return.

  **Scope note -- bounded against the emotion, the harm, and the release.** The moral disapproval that motivates the sanction (anger + disgust + contempt) stays with the `condemnation` composite; the bare mechanics of delivering harm to another who would avoid it stay with `aggression` (this engine discounts that overlap, owning the norm-enforcing, cost-bearing purpose the force may serve); the foregoing of a deserved sanction stays with `forgiveness`; and the institutional, rule-graduated sanction of a governed commons stays with the `commons` engine's sanction place. This engine owns the individual persona's costly act.

  Warranted (LORE) on Fehr & Gachter (2002, "Altruistic Punishment in Humans," the founding; 2000, punishment sustaining cooperation) and Fehr & Fischbacher (2004, "Third-Party Punishment and Social Norms," the extension past the wronged party; 2003, "The Nature of Human Altruism," strong reciprocity as the disposition beneath both forms). Set at patch as the free level. No whitelist required -- the `altruistic_punishment`/`second_party`/`third_party` stems are unique (distinct from `commons`'s `sanction` place).

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
