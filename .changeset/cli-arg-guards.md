---
"@chbrain/khai-tests": patch
---

The CLI now fails loudly on two operator mistakes instead of silently
proceeding: `--project <path>` errors (exit 2) when the path does not exist,
rather than walking an empty tree and reporting "all instance files conform";
and `pack ... --out` with no following value errors instead of silently
falling back to `<dir>/dist`.
