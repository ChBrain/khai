---
"@chbrain/khai-review": patch
---

Fix token validation test isolation. The test verifies token validation happens at call-time, not import-time. Clear KHAI_REVIEW_TOKEN and GITHUB_TOKEN environment variables before test execution to ensure the test cannot fall back to env vars.
