---
"@chbrain/khai-engine-worth-logic": patch
---

Add the worth-logic engine (position: anchor + expressions) -- the cultural logic by which a persona's personal worth is assigned and defended: where its worth comes from, and how it must be protected. The gap analysis (Tier-3 #31) targeted the honor/dignity/face typology of self-worth cultures.

- **Anchor (position):** `worth-logic` -- the standing cultural rule beneath a persona's sense of its own worth (Leung & Cohen), and how that rule tells it to meet an affront.
- **Faces (position)** -- the three cultural logics of self-worth:
  - `dignity` -- worth is **inherent, equal, inalienable**; internally anchored, insults deflected as powerless, disputes to conscience and impartial law (Western/dignity culture).
  - `honor` -- worth is both **self-claimed and socially-conferred**, and therefore **precarious**; it must be actively defended, an insult or challenge answered, often by retaliation or violence, or it is forfeit (Nisbett & Cohen's culture of honor).
  - `face` -- worth is **conferred by position** in a stable hierarchy and held by fulfilling one's role; maintained by humility, propriety, and harmony, lost by disrupting the order (East-Asian face culture).

The same insult lands differently in each: nothing to a dignity-holder, a wound to be avenged for an honor-holder, a tear in the harmony to be repaired for a face-holder.

**Scope note -- a distinct stem for "face."** Per the chase row, `face` is already the Brown & Levinson **interactional politeness** engine (the softening of a face-threatening act), not this culture typology. The face-culture worth-logic uses a distinct stem: the file is `position_face_worth.md` (stem `face_worth`), and the engine delegates moment-to-moment face-work to the `face` engine. Also bounded against the worth **emotions** (`pride`/`shame`/`anger` register worth's gain and loss; this owns the rule), honor as personal **virtue** (`virtue` owns integrity-honor; this owns reputational-honor), and `hierarchy` (owns the ladder; this owns whether standing on it is what worth is made of).

Warranted (LORE) on Nisbett & Cohen (1996, _Culture of Honor_), Leung & Cohen (2011, "Within- and Between-Culture Variation... the Cultural Logics of Honor, Face, and Dignity Cultures" -- the three-way typology), Cohen, Nisbett, Bowdle & Schwarz (1996, the insult experiments), and Ho (1976, "On the Concept of Face"). Set at patch as the free level. No whitelist required -- the `worth_logic` / `dignity` / `honor` / `face_worth` stems are unique (distinct from the `face` engine's `face`).
