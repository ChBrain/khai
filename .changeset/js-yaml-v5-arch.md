---
"@chbrain/khai-arch": patch
---

Migrate js-yaml to v5 (1/4, arch lane). js-yaml 5 removed the default export and
ships only named exports, so `import yaml from "js-yaml"` resolved to undefined;
switched to `import * as yaml from "js-yaml"` (keeps every `yaml.load` call site
intact) and bumped the dependency to ^5.1.0. Part of the per-lane split of the
Dependabot js-yaml 4→5 bump (arch → governance → methods → skills).
