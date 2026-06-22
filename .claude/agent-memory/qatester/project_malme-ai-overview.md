---
name: project-malme-ai-overview
description: malme-ai (말메 AI) is a Vite+React PWA voice-memo app with Firebase Auth/Firestore and OpenRouter AI; PRD at docs/prd.md defines 7 screens and full user flow
metadata:
  type: project
---

**말메 AI (malme-ai-app)**: Korean-focused "second brain" voice memo PWA. Record voice -> STT -> AI summary/tags/category -> Firestore save -> searchable list. Spec lives at `docs/prd.md` (Korean), with section 3 = screen list, section 4 = per-screen detail (4.1 login ... 4.7 settings), section 5 = full user flow diagram, section 6 = Firestore data shape, section 7 = AI model fallback chain (OpenRouter: gemini-2.5-flash -> gemini-2.5-pro -> gpt-4o-audio-preview).

Stack: Vite 5 + React + react-router-dom (BrowserRouter in `src/main.jsx`), Firebase Auth (Google sign-in via `signInWithPopup`) + Firestore, Firebase project id `malme-ai-hs`. No PWA plugin configured yet in `vite.config.js` as of 2026-06-22 — PRD item 6 (PWA install) is not yet implemented despite being a core feature requirement.

All page components under `src/pages/` are currently stubs with `// TODO` comments marking unimplemented logic (MediaRecorder, OpenRouter calls, Firestore CRUD, signOut). This is expected early-stage scaffolding, not a regression — don't flag TODOs as bugs, just confirm routing/navigation wiring is internally consistent.

**Known gap as of 2026-06-22**: no auth guard exists anywhere in the app. `/home` and all other routes are reachable by direct URL with no login check, and `/` does not redirect away even when already authenticated (violates PRD 4.1 "이미 로그인되어 있으면 바로 홈으로 이동"). `SettingsPage.jsx` logout handler navigates to `/` but never calls Firebase `signOut()` — session persists after "logout". Flag these every time routing/auth in this app is reviewed, until fixed.

**How to apply**: When QA'ing future auth/routing changes in this project, check whether the auth-guard gap and the missing `signOut()` call have been addressed; don't re-derive this from scratch each time — verify current file state first since this was true as of 2026-06-22.

**PWA setup gap (audited 2026-06-22)**: no `public/` directory exists at all in this project — `index.html`'s favicon link (`/vite.svg`) 404s, and there is zero manifest/service-worker/icon setup despite PRD section 2 #6 requiring installability. `vite-plugin-pwa` is the recommended path but is not yet a devDependency; installing it requires `npm install -D vite-plugin-pwa` (no Bash access in this agent, so this must be run by the user or a future session with Bash). Theme color in `index.html` was still the old indigo `#4f46e5` — should be updated to match the app's actual purple/pink brand (~`#a855f7`) once edits are applied. Icon files (pwa-192x192.png, pwa-512x512.png, maskable variants, apple-touch-icon.png) do not exist and need a source logo asset before they can be generated — ask the user for one if revisiting this work.

**How to apply**: Before redoing PWA audit work, check whether `public/manifest.webmanifest`, `vite-plugin-pwa` in package.json, and updated `index.html` head tags now exist — this snapshot is frozen at 2026-06-22 when none of it did, and in that same session Write/Edit tool permissions were denied so no files were actually changed despite the audit being completed.
