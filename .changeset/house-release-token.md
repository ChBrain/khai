---
"@chbrain/khai-stage": patch
---

Every house releases through its own RELEASE_TOKEN, and until now nothing
raised warned it before the release workflow failed on it at the last step.
The blueprint now stamps `.github/workflows/release-token.yml`: a monthly,
self-contained check (no script file, the way khai-drift.yml renders its
table inline) that authenticates with the house's own RELEASE_TOKEN, reads
its expiry, and reads what the GitHub API says it may do on the house's own
repository. It opens, updates or closes one issue titled "release token" and
never fails the workflow on a bad token; the issue is the signal.
