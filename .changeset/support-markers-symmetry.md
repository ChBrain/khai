---
"@chbrain/khai-tests": patch
---

`roleOf` reads `workPolicy.supportingMarkers`, symmetric with `contrastMarkers`.

A house could declare its **contrast** vocabulary and had no way to declare its
**support** vocabulary. `roleOf` knew the `support` role but reached it only
through the `**Support.**` prefix, which must LEAD the Scope cell -- right for a
cell an author is writing now, wrong for the hundreds already written where the
phrase sits mid-sentence.

khai-misfits hit that gap and filled it locally: a `supportingMarkers` list its
own `--compound` instrument read and this wall did not, shipped with the
divergence documented as an accepted limit. **Two checks reading the same policy
and disagreeing is worse than either answer**, and the mitigation ("it costs
nothing today, the wall holds at zero") is exactly what makes it expensive later:
the first real collision, an author declares the row background, watches one
instrument clear it, and gets a red build with no explanation.

So the vocabulary comes home. `supportingMarkers` is now read by the wall, with
the same defaults the house had already chosen (`cited as background`,
`background, not the spine`, `(background)`), and `loadWorkPolicy` returns it.
Both forms mean one thing and both reach the same wall: the prefix declares a
role at the head of a cell, the marker declares it anywhere in one.

Nothing migrates. Unmarked rows are still spines, the contrast path is untouched,
and khai-misfits holds at zero findings against this kit with the config it
already merged.

The analogous change (adding the `support` role at all) took `bump:minor` in
0.3.0. This is the same kind of loosening -- fewer findings, never more -- so the
maintainer may want the label; not self-escalating.
