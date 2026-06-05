# khai-plays

The play registry: the bill. khai holds the index of houses, not the
productions. Each house (a `khai-plays-<source>` collection) registers one entry
under `registry/`; the website reads them and renders one card per house, with
its productions underneath.

- `registry/<source>.json` is a house card (see `registry/README.md` for the shape).
- `loadRegistry()` reads and validates every entry, sorted by id; a malformed card fails the build.
- `houses` is the loaded bill.

khai owns this registry; the productions live in the external houses, raised by
`khai-stage` and written in `khai-playwright` mode. The impresario lists a house
here when it raises it.
