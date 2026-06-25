---
"@chbrain/khai-language": patch
"@chbrain/khai-rules": patch
---

Migrate js-yaml to v5 in governance lane (2/4). js-yaml 5 removed the default export; switched to namespace imports `import * as yaml` and bumped the dependency to ^5.1.0 in @chbrain/khai-language and @chbrain/khai-rules.
