---
"@chbrain/khai-stage": patch
---

The stamped pre-push hook runs the suite, and git exports GIT_DIR into every
hook it runs. A house whose suite builds scratch repositories in a temp
directory found its scratch `init` and `commit` acting on the real repository
under that hook: two scratch commits on the branch being pushed and a checkout
flipped to bare. The hook now drops GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE
before the gates, so a suite run from the hook sees the same environment as
one run from a shell.
