---
"@chbrain/khai-tests": patch
---

Let a `scholarPolicy.nonAuthorSources` entry be a **pattern** as well as a string, so a house declares an intentional non-author class as one rule rather than as a list of every cell in it.

The wall this widens is right and stays intact. An Origin `Source` cell that yields no scholar used to VANISH from the science index, taking its citation with it: a composite whose Origin held "Cognitive-behavioral model" and "Clinical presentation" lost both rows and Frost, Hartl and Steketee with them, keeping one record where there should have been five, and every gate green. `originRowErrors` closed that by making such a row declare itself, which is right for khai, whose tree holds six such rows and lists them as strings.

It was unadoptable by a house whose non-author rows are a **convention**. Measured over khai-misfits' corpus (every `misfits/*/REFERENCE.md` Origin chapter): **499 errors, 352 distinct Source values, 268 misfits affected**. 120 are `Practitioner`, the kit's own anticipated case; the long tail is that house's documented convention, a Source that deliberately names no person ("Boundary of the effect", "The measurement dispute", "Whether any settlement reaches it"). Declaring 352 strings is precisely the "closed list of the `NON_AUTHOR` kind ... a list to maintain" that house's own ruling forbids.

An entry is a pattern iff it opens and closes with `/` around at least one character; it compiles with the `i` flag and matches the same qualifier-stripped Source the string path uses. One rule, `"/^(The|Whether|Why|What|How|Whose|Where|When|A |An ) /"`, plus `Practitioner` and two named cells, takes that house from **499 to 58**, leaving a 39-value residue for it to decide on. This is the shape `workPolicy.contrastMarkers` already has: a declared vocabulary for an intentional class, authored by the person who knows the class and never inferred from the prose.

The wall keeps its prey, because a pattern exempts what it names and nothing else: that rule reaches neither "Cognitive-behavioral model" nor "Clinical presentation". The two degenerate readings are refused for the same reason -- `"/"` and `"//"` carry no body and stay strings, rather than compiling to the empty regex that would match every Source and silently disarm the wall for a whole house, and a slash inside an entry (khai's own `NFPA / DOE hydrogen safety`) stays a literal, since read as a regex it would match unanchored.

**An invalid pattern throws, naming the entry**, and throws before a single row is read. A pattern that cannot compile declares nothing, which is indistinguishable from a vocabulary nobody has used yet; the fault belongs on the build that introduced it, not on the row that eventually needed it.

New export `matchesNonAuthor(source, entries)`, the single reading of the policy that both the wall and any caller share. Both existing call sites pass `nonAuthorSources` through unchanged, and khai's own config does not change: its six entries are strings.
