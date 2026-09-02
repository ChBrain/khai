---
"@chbrain/khai-tests": patch
---

Three delivery walls existed twice downstream and were about to exist a third
time: khai-cultures' preflight re-derived its CI job list against a gates
manifest that quietly falls behind `ci.yml`, both khai-cultures and khai-misfits
hand-wrote the same test pinning `changesets/action@v2`'s renamed inputs after
four dead releases went unnoticed, and khai-cultures and khai-misfits each wrote
their own version of "the registry's promise held against the tarball" for two
different reasons (a hollow tongues package, a registry naming misfits nobody
shipped).

The kit now holds all three. `gates verify-ci` matches a house's declared
`gates` array to its CI workflow's job ids one-to-one, with `ciPolicy` in
`khai-guard.config.json` (`only`, `split`, a gate's own `job`) for where the
names do not fall out on their own. `release verify` pins a release workflow to
the input names changesets v2 actually reads. `checkRegistryPacking` (paired
with the new `packedFilesAny`, which packs a flat house the way `packedFiles`
packs a workspace one) holds registry.json's entries against the box and
refuses governance content in any tarball.

Measured against both houses: `release verify` and `packing verify` are clean
on each as they stand. Neither declares `ciPolicy` yet; with one added locally
(a `split` for the one job that runs several gates as steps, and for
khai-misfits a `job` override where a local gate's own name does not match its
job id) `gates verify-ci` clears khai-cultures entirely and leaves khai-misfits
with one real finding: `khai-changeset-check` runs in CI with no equivalent in
that house's own `npm run gates` -- a genuine gap in that manifest, not an
idiom, and left standing rather than routed around.
