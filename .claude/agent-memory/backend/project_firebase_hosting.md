---
name: project-firebase-hosting
description: Firebase Hosting/Firestore setup status for malme-ai-hs project and known gaps
metadata:
  type: project
---

Firebase project id is `malme-ai-hs`, configured in `src/firebase.js`, `.firebaserc`. Hosting public dir is `dist` (Vite build output). Vite + vite-plugin-pwa emits content-hashed files only under `dist/assets/*`; `index.html`, `manifest.webmanifest`, `sw.js`, `registerSW.js`, `workbox-*.js` sit at dist root and are NOT hashed.

**Why:** Firebase Hosting does not auto-apply long-cache to hashed filenames or no-cache to the SPA shell — both need explicit `headers` entries in `firebase.json`, or users get stale `index.html` referencing deleted hashed assets after a redeploy.

**How to apply:** When touching `firebase.json` hosting headers, ensure `/assets/**` gets `public, max-age=31536000, immutable` and `/index.html`, `/manifest.webmanifest`, `/sw.js`, `/registerSW.js`, `/workbox-*.js` all get `no-cache`. firestore.rules already isolates `memos` collection by `userId` correctly (deny-by-default elsewhere) — no changes needed there.

Known unresolved gotcha: `.env` contains a live `VITE_OPENROUTER_API_KEY` that Vite inlines into the client JS bundle at build time — anyone can extract it from deployed `dist/assets/*.js`. Not fixable via `.gitignore` (that only protects the repo, not the shipped bundle). Real fix needs a server-side proxy (Cloud Function / Cloud Run) holding the key; not yet implemented. See [[feedback_session_tool_permissions]].
