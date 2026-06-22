---
name: feedback-session-tool-permissions
description: Tool permissions (Bash/Read/Edit) can be granted independently and inconsistently within one session
metadata:
  type: feedback
---

In one observed session, Bash and Read were allowed but Edit was denied, even though all three are normally bundled. Don't assume tool availability is all-or-nothing for an agent in a given run.

**Why:** Hit this while trying to patch `firebase.json` cache headers — could read/verify files and run Bash freely but Edit calls were blocked by the sandbox.

**How to apply:** If Edit/Write is denied but Read/Bash work, don't try to work around it (e.g. via Bash heredocs) — per harness rules, stop and hand the user/main agent an exact diff to apply instead. Don't assume a single permission denial means the whole session is read-only; retry the specific tool once if context suggests it might have been a one-off prompt (this happened with Bash here — first call denied, later calls succeeded).
