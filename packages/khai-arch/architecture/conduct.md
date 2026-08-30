# Conduct: working in a house

Every repo using khai is a house of khai. A house keeps three layers of
instruction and they are not interchangeable. Its **voice layer** (its own
`management/` directory) is the house's own by design: who speaks, through which
Persona, how the company collaborates. This document says nothing about it and
must not be read as touching it. Its **CLAUDE.md** stays what it is, the short
executable contract a model obeys literally: the lanes, the gates, the house's
own quirks. **This document is the shared case law those contracts point at.** It
ships with `@chbrain/khai-arch`, so it reaches every house by dependency and
there is one copy of it.

**What it covers is coding conduct**: how a model reads a rule, reports a
number, trusts a check, chooses a gate, and works beside another model. **What it
does not cover** is the voice layer (the house's `management/` directory) and the
house's content standards (what makes a good culture, a good misfit, a good
engine), which are each the house's own and live in the house. That division is
the point of law 6 below, so this file obeys it rather than restating it.

Every rule here is written case first. The rule alone gets ignored; the case is
why it is there. Two source documents were merged to make it, and both are
credited under Credits: a session in the khai monorepo, and the khai-cultures
house's reading of three rounds of work with a second model, August 2026. Where
both houses reached the same law independently, that law leads, with both cases
under it. Numbers stay attached to the house that measured them.

It carries no frontmatter because it is not a khai type. Like `model.md` it is a
companion to the typed specs in this directory, not one of them.

---

## 1. Read the canon before attributing a rule to the house

`packages/khai-arch` is the binding contract and it defines every chapter. In
the khai repo a model stated three chapter rules as house convention, among them
"Echo must link an atom". The canon defines Echo as "what changed, and what the
next process inherits" and says nothing about links. All three rules were the
model's own, generalised from five files, four of which it had written itself.
**If you wrote most of the sample, it is not a sample.**

The same law has a publishing half, and the cultures house paid for it. Its
rules said "take the chapter names from the canon and never from memory", then
listed five of the nine kinds. The three omitted, plot, plan and play, are
exactly the three that came back wrong. The invented plan read Intent, Friction,
Horizon, Echo, and Echo appears in two of the five lists it **was** given. That
is not invention from nothing; it is extrapolation from an incomplete list, which
is the predictable result of publishing one. **Publish the whole list, or say
plainly that it is partial and where the complete one lives.**

And before attributing a failure to the model, check the briefing. In the
cultures house three of four root causes traced to the instructions rather than
to the agent. `GEMINI.md` was 31 lines against `CLAUDE.md`'s 308, and all 31 were
about voice; the agent that produced 138 findings of scaffolding had never been
told about changesets, chapters, coverage or plot zero. The rules said a new
package "takes a minor of its own"; the gate rejects exactly that. The rules
described `khai.production` as "the anchoring play"; it is the culture id, and
`khai.anchor` is the play file. One appositive produced eight findings.

**Three questions, in this order: does the rule exist, is it complete, and does
the gate agree with it?** The third is not rhetorical. `changesetCheck` in
`packages/khai-guard/index.mjs` rejects any releasing changeset for a package
that has never been published, whatever its level, because `changeset version`
bumps from the version already in `package.json` and the initial version would
never reach the registry. A house whose prose promises a new package "a minor of
its own" is not describing its own gate.

## 2. Measure, then write the number, never the other way

In the khai repo a model reported "one current violation". Across all 101
process-rooted composites it was 66. **Five files is an anecdote; a loop over
`packages/` is a measurement, and it costs one command.**

The same model put a suite count in a commit message before running the suite,
three times, and was wrong three times. An earlier handover reported "all
validation tests passed brilliantly" while the science index gate was failing.
That is why `npm run gates` exists: it runs every wall the repo has, under one
exit code, and prints a paste block of measured counts to copy rather than
retype. It also refuses to start. When untracked paths sit under `packages/`, or
the workspace is not linked, it names the problem and stops before running a
single wall, because member-check reads git-tracked paths and would report the
old counts on a tree it cannot see. A count that did not move when the tree moved
is the tell.

Both models in the cultures rounds over-claimed, in the same way and in both
directions. The second model wrote "All 359 tests (including the exhaustive NLP
validation checks) are completely green"; there are no NLP checks in that
repository. The house wrote "1653 tests passing" in four pull request bodies when
the real number was 365, because stale agent worktrees ran the suite three times.
**A prose claim about a run the reader cannot check is worth what it costs to
make. The fix is subtraction: do not restate what CI already proves.**

And measure the corpus, not the file, because the default failure is not
scaffolding. Scaffolding is visible. **A filled template passes every counter and
reads fine one file at a time.** Measured across the cultures corpus: 300
cultures carry 44 distinct shapes, and 213 of them (71 percent) share the three
commonest; 2 pieces appear in 95 percent of cultures, 2 places in 93 percent, 2
processes in 89 percent, 1 plan in 92 percent. A place gets as many pieces as the
template has slots, not as many as it has. You cannot see that in a diff. You see
it by comparing structure across the whole corpus, which takes a quarter of a
second and nobody thinks to do.

## 3. A check is confirmed only by its failure

A composite reached khai's `main` importing `buildCompositeLoader` from
`@chbrain/khai-arch`, an export that does not exist. Importing the package threw
at module evaluation, so nobody who installed it could use it, and it sat on
`main` fully broken with every gate green. The reason is structural rather than
careless: nothing imports a composite except its own tests, and the source and
test rule ships a build PR without tests, so at the exact moment a package is
introduced the one thing that would load it is correctly absent. Every wall
inspected the package's files; none of them ran it. That hole is now closed by
`packages/khai-tests/tests/package-loads.test.mjs`, which imports every engine
and composite and composes every unit the manifest declares.

In the same repo the review harness carried anchoring machinery no caller ever
fed, so declaring a rubric "anchored" would have shipped one that always answers
"cannot confirm". **Green on nothing is the failure mode here, not red.**

The cultures house met the class three times in one week. A skeleton tool
reported every scene as empty for its first hour, because a regex ended at the
first line break, and looked exactly like a clean result. A lockfile check passed
its first tamper because the tamper was in the wrong direction. A gate runner
printed FAIL for a check, exited 1, and said "10/10 gates pass" on the line
underneath.

**Watch a check fail before you trust it to pass.** Silence and success look
identical, and an instrument that reports nothing is indistinguishable from one
that finds nothing. khai's own code is written to keep those apart, and the
pattern is worth copying: `packedFiles` in `packages/khai-tests/src/packing.mjs`
throws rather than returning an empty map when npm cannot be run, because "the
pack could not be read" and "nothing is packed" are different facts;
`checkPacking` judges only the packages npm actually reported, because a name it
was not asked about has no verdict; and the instruction collector in
`packages/khai-tests/src/instructions.mjs` carries an unreadable entry point out
as an error rather than reporting "no law exported", which is the same sentence
as the truth.

## 4. Local green is not CI green, and a runner declares what it does not run

The cultures house's local runner reported 10 of 10 while CI failed all ten jobs
in under twenty seconds each, none of them on its own content. The runner used
the `node_modules` already on the machine; CI installs with `npm ci`, which
refuses a lockfile that does not match the manifests. No log said "lockfile".

khai carries the same shape in a different place. Its `khai-tests` CI job runs
`npm ci`, then `npm run format:check`, then `npm test`, in that order, so a
formatting fault fails the job having never reached the suite. The report reads
`khai-tests` red while `npm test` is green locally, and both statements are true
at once. Reading the job name as the suite is what makes that cost a cycle.

**A runner that claims to run everything CI runs must be audited for what it
quietly does not do, and must say so.**

## 5. Gate the decidable, instrument the fuzzy, leave taste as guidance

khai carries the ladder in `docs/BOUNDARY.md`, read both ways: upward as
escalation per case, `code -> ai -> human`, so what the deterministic gates cannot
settle is judged by the harness and what the harness cannot settle goes to a
person; downward as consolidation over time, `human -> ai -> code`, so a
judgement that recurs and crisps up becomes a rubric and then a wall. **When a
gate cannot decide it, it is not a gate.** Forcing a judgement into a wall is
worse than leaving it out, because a rule that reads as computed and is not stops
the model **and** the reviewer from looking.

The cultures house proved the other rail. Its coverage counter asks whether each
Company element is staged by some plot, and listing the entire Company under
every plot satisfies it perfectly: zero dead entries, honestly, on a play that
staged nothing. **Never turn a fuzzy signal into a hard gate.** An instrument for
a fuzzy property reports and never fails; that house's overlap instrument prints
its findings as questions and always exits 0. Sharing is often the truth, no
counter can tell the two apart, so it asks and mandates no answer.

The consequence for prose: where a rule is enforced, say by what. Where it is
not, say that it is the reviewer's. That difference is the whole value of the
sentence.

## 6. One source of truth, and a ruling lives in the repo

In the cultures rounds the voice rules had a neutral home while the coding rules
were sent to "the tool files", plural. One file got 308 lines and stayed current;
the other got a lossy paraphrase and went stale, and every gate added afterwards
was documented in one and not the other. **Two hand-maintained copies of the
truth always diverge.** A provider-specific file holds provider-specific quirks
and nothing else, and points at one neutral source.

The khai half is the same law about decisions rather than files. **Anything you
decide that the spec did not already specify goes into the repo, not only into
the pull request description.** A decision that lives in a PR body gets re-argued
by the next person. A ruling goes in the document that owns it; a lesson goes
next to the code it is about.

This document is that one source for conduct. A house's `CLAUDE.md` holds its
lanes, its gates and its own quirks, and points here for the rest.

---

## 7. Four the khai repo learned alone

These four have one house's case behind them, not two. They are here because the
case is specific enough to carry the rule.

**Test a proxy against the case it scores worst, not the case it came from.** Two
metrics for "is this chapter restating an atom" both looked right on the file
they were derived from. Checked against the worst scorer, link density inverted:
the chapter with the fewest links per word was the most compound-specific in the
set, because hard compound work cites theory, and theory is not an atom and does
not link. **A proxy run only on its origin case has not been tested.**

**Before calling something breakage, ask whether it is a shape you did not know
about.** A first load gate reported 63 failures. One was real, 61 were an older
loader contract, and one was a third thing. **Derive the expectation from what
the manifest declares, never from what a module happens to export**, or you
cannot tell "nothing to compose" from "silently came back empty". The load gate
that replaced it does exactly that: it reads three declared shapes out of each
manifest and holds the package to the one it claims.

**Allowlist what is legitimate. Do not exclude what looks bad.** The pattern
`[^)\s]+` reads as "not a paren or space" and is actually "including dot-dot and
slash", so a link in a reviewed markdown file read a path outside its package.
CodeQL caught it. The same rewrite closed a polynomial regex: a character class
that repeats and also contains the literal following it will backtrack.

**"It would be expensive to change" is not an argument.** The standing question
is: we have A, is A still correct? Keeping A needs a reason about A being right,
never a reason about the change being cheap.

## 8. Two that khai-guard computes, kept here for the reason

The next two are enforced, so a model never needs to judge them. They are
recorded because knowing why keeps a model from arguing with the gate.

**Do not choose a branch by hand.** Make the edits first, then
`npx khai-guard branch <topic>` reads the tracked diff against `HEAD` plus the
untracked files, groups every path by the lane that owns it, and runs the
checkout. When the set spans more than one lane it creates nothing and prints the
split instead. **A branch name you typed is a guess; this is not.** And never
`--no-verify`: a failing pre-push hook means the change is in the wrong lane, not
that the hook is wrong, and the required CI check will reject it anyway.

**Read the changeset rule, do not pattern-match your last pull request.** A
model added an empty changeset to a package change out of habit. Empty is for a
change that ships no package content, and for a package's first release; a
package change needs a real one. `khai-guard changeset-check` computes all three
of those, so none of them is a reading: with no `changesetPolicy.countDrivenAdd`
configured every pull request must carry some changeset; a releasing changeset
for a package whose own `files` this diff does not touch is rejected, because it
would republish identical content and drift the version (and a changeset the
diff merely edits is a repair, not release intent; only an added one makes the
pull request releasing); and a releasing changeset for a package never yet
published is rejected, because the version in the manifest is the initial
version and a bump would step over it. Houses that
version by a content count add a fourth rule on top of these, and their own
`CLAUDE.md` states it.

## 9. The collaboration protocol

**Review the skeleton, not the prose.** A culture runs to about 2,800 lines once
written, and every decision that matters fits in twenty. Reviewing the plan
caught a wrong `plot_00` in a twenty-line proposal rather than after a thousand
lines of German.

**Judgement and conformance are separate skills, so split the work.** The second
model's selection was good and its wiring was wrong: it chose the right anchors,
which is the hard call, and it also invented chapter names, put a filename in an
id field, and shipped a manifest with no `files` array. Let it propose the
skeleton, review the choices, then let it write. Do not review both at once.

**Give the reason, not just the correction.** That model took every correction
that arrived with an argument. Told that `plot_00` must be an origin and not a
conquest, in the order's own words, it produced a better plot than the one it had
proposed. Corrections landed as reasoning, never as instructions to comply with.

**The loop that worked**, in order: propose the skeleton, review the choices,
write, run every gate locally, answer what the advisory instrument asks, then
review with the gates already green.

**And the success metric is different mistakes, not fewer.** A collaboration that
repeats last round's mistakes has not improved, however few of them there are.

## 10. The rule that covers the rest

**When you are corrected, check whether the correction is true before agreeing,
and whether your own claim was true before defending it.** Almost every case
above is one where a model was confident and one command would have settled it.

---

## Credits

Merged from two documents, both August 2026. The first is a working session in
the khai monorepo, whose twelve cases are the source of laws 1 to 6 in part, all
of section 7, both of section 8, and section 10. The second is the khai-cultures
house's "Working with a second LLM", its reading of three rounds between Claude
Code and the Gemini CLI, which is the source of the rest of laws 1 to 6 and all
of section 9. Every number in this file was measured by the house it is
attributed to.

Content under CC-BY-NC-SA-4.0 (see `LICENSE`); the code this file describes is
under MIT (see `LICENSE-CODE`).
