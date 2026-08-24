---
---

Revert the `titlePolicy.homonyms` escape (1097712). Its motivating case was a
category error rather than a homonym: a plot is an event, so a plot named after
the person it concerns names nothing determinate, and the cultures migration had
already settled that one by giving the plot the event's own name. Before those
renames the house held exactly five person-named plots and all five collided --
none survived on its own merits -- so the wall had no legitimate exceptions to
make room for.

It also ran against a ruling landing in the same batch: a distinct stem beats a
`memberPolicy.homonyms` whitelist (`plain-stems-decide`), with #1345 settling
stem collisions by name and #1346 chasing the 49 whitelisted stems that do not
need one. A new whitelist for settling name collisions is the wrong direction.

Nothing was published: Version Packages had not merged, so khai-rules and
khai-tests stay at 0.1.13 and 0.2.8 and no CHANGELOG carries the claim. Empty
changeset, since the revert cancels an unreleased change rather than making one.
