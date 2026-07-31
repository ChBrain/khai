# @chbrain/khai-engine-speech-act

## 0.1.1

### Patch Changes

- 59e4f4a: Add the speech-act engine: how a persona does something by saying it -- the illocutionary force that makes an utterance an act rather than a description, and the meaning it carries past the literal. The root (`process_speech_act.md`) declares that to speak is often to act, not to report: an utterance carries a force (the force, not the words, fixes which act it is), it can mean past what it states (the hearer recovering the implicature by presuming the speaker cooperates), and it comes off only when its felicity conditions hold. Five acts are the illocutionary points the force can take -- Searle's taxonomy: `assertive` (commit to the truth of a claim), `directive` (get the hearer to act -- force scaled by standing), `commissive` (bind the speaker to a future act -- promise, threaten), `expressive` (perform a feeling as a social move -- thank, apologise), and `declaration` (change the world by saying it, given the standing -- pronounce, dismiss, resign).

  Pairs with `language` the way `register` does -- language moves the meaning across the channel, this does the deed with it. Bounded against `deception` (a lie is an insincere assertive, but the misleading intent is deception's), `persuasion` (a directive is one move, not the campaign), `power`/`role` (a directive's weight and a declaration's very success draw on the standing they own, and misfire without it), `ritual` (a declaration may sit in a rite, but the ceremony is ritual's), and `emotion`/`repair`/`forgiveness` (an expressive's feeling and the repair it serves). Warranted (LORE) on Austin (the performative and felicity), Searle (illocutionary force and the five points), Grice (the cooperative principle and implicature), Sperber & Wilson (relevance), and Levinson (the synthesis). Set at patch as the free level; a new engine may warrant a minor at the maintainer's `bump:minor` label.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
