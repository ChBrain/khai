# @chbrain/khai-engine-implicature

## 0.1.1

### Patch Changes

- 9fd3e9d: Add the implicature engine: how a hearer works out what a speaker means beyond what they literally say, by assuming cooperative talk -- Grice's theory of conversational implicature. The root (`process_implicature.md`) declares the said/implicated distinction: what a speaker means is not exhausted by what they say, and the surplus is recovered by the hearer on the assumption that the speaker observes the Cooperative Principle -- being appropriately informative, truthful, relevant, and clear -- so meaning is inferred, not just decoded, and is calculable and cancelable. Three forms carry it: `maxims` (the cooperative-baseline route -- the Cooperative Principle and its maxims of quantity, quality, relation, and manner, the standing expectation the hearer reasons from), `flouting` (the maxim-breach route -- the overt, deliberate violation that generates a particularized implicature, the hearer keeping cooperation fixed and reading the breach as the message: irony, damning faint praise, the pointed non-answer), and `scalar` (the default-inference route -- the generalized, cancelable inference from a weaker scalar term to the negation of the stronger, "some" implying "not all," keyed to the word rather than the occasion).

  A foundational pragmatics gap. Bounded against `speech-act` (the illocutionary force that makes an utterance an act vs the meaning inferred beyond the literal), `language` (the lived said/understood gap as a persona moves meaning across it vs the specific cooperative-reasoning machinery that closes part of it), `framing` (the persuasive tilt of presenting content one way vs the recovery of intended meaning), and `register` (the specialized code a persona commands vs the inference that works within whatever register is in play). No homonym gate: `implicature` and the form stems `maxims`/`flouting`/`scalar` are all free. Warranted (LORE) on Grice ("Logic and Conversation", 1975; _Studies in the Way of Words_, 1989), Horn (Q-/R-based implicature and scales, 1984), Levinson (_Presumptive Meanings_, generalized conversational implicature, 2000), and Sperber & Wilson (_Relevance_, 1986/1995). Set at patch as the free level; a new engine may warrant a minor at the maintainer's `bump:minor` label.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
