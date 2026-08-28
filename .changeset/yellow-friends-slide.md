---
---

`changesetCheck` asks whether the package a changeset names exists.

`changeset version` already answers this, by throwing -- _Found changeset <file>
for package <name> which is not in the workspace_ -- on the first offender, in
the release job, after the whole suite has gone green. Nine changesets in the
misfits house declared `khai-misfits` against a package named
`@chbrain/khai-misfits` and took its release down for two days that way, with
`npm test` green in every failed run and no symptom but a Version Packages pull
request that stopped moving.

**This check had opened all nine files.** It parses each changeset's frontmatter
into `{ package, level }` and reads `level` alone, because the level is what the
count-driven rule is about; a name outside the workspace was skipped as none of
the guard's business, on the stated reasoning that the guard does not own the
manifest and must not guess at it. That reasoning is right about the rules it was
written for, first-release and ships-nothing, which need to know things about a
package and must stay silent about one they cannot see. It is wrong about
existence, and the skip that protected them silenced the only place that could
say the name is not a package at all.

`workspaceNames` is a second list rather than a field on `packages` for the
reason the rules make plain: `packages` exists to judge publishing, so
`readPackages` drops private manifests. Existence is not a question about
publishing -- a private package is in the workspace, `changeset version`
resolves it, and judging names against the publishable list alone would reject a
legitimate changeset. Both readers now share one `workspaceDirs` walk, so there
is a single notion of what the workspace contains.

Every offender is reported rather than the first, since changesets throws and
stops; and an EDITED changeset is checked, unlike the release-intent rules, since
the pull request that repairs a wrong name edits rather than adds.

**What it does not do.** The gate reads the changesets a pull request touches, so
it prevents the next wrong name and cannot sweep a backlog already on `main`. A
house wanting that owes itself a corpus-wide wall; the misfits house has taken
one.

Verified end to end against the live defect: run in that repository, the CLI
names the file and the correct spelling. 195 guard tests pass, 5722 in the
workspace.
