# WolfGang - First-Principles Audit

Date: 2026-07-11
Auditor: automated code audit (read-only, reasoned from source; no live multiplayer session run)
Scope: repo at D:\Dev\WolfGang, commit state on disk. React 19 + Vite 7 + TypeScript + Tailwind + Framer Motion, Zustand client state, Firebase Firestore sync. Deploy target Vercel project "wolfgang".

---

## 0. Headline verdict

- **Multiplayer is REAL, not mocked.** The active code path uses real Firebase Firestore. Cross-device play works in production, provided two external conditions hold that cannot be verified from the repo: the Vercel deployment has the `VITE_FIREBASE_*` env vars set, and the live Firestore security rules permit the writes. See section 1.
- **Build, lint, and tests all pass.** `npm run build` exit 0, `npm run lint` 0 errors/0 warnings, `vitest` 28/28. The state file claims (28/28, clean lint, build pass) are accurate today. The "95/100 health" number is a self-assessment, not a reproducible metric; two same-day report files in `docs/reports/` say 48/100 and 65/100 from earlier in the fix cycle. See section 2.
- **Security is the weak spot.** No Firestore rules file is versioned in the repo, there is no authentication, and the entire game document (including every player's secret role) is streamed to every client. For a technical player this defeats hidden-role secrecy. See section 3.
- **First-time clarity is good on the entry screens, but the in-game phases are hardcoded German.** Full EN translations exist in the dictionary, yet `NightPhase`, `DayPhase`, and the game-over flavor text bypass i18n entirely, so an English player plays the whole night and day in German. See sections 4 and 5.
- **The host is a single point of failure.** All phase progression runs only on the host's device. If the host leaves, backgrounds the tab, or loses connection, the game freezes for everyone. This directly violates the soul's robustness principle. See section 6.

---

## 1. MOCK vs REAL Firebase (the decisive question)

**Verdict: the deployed game uses REAL Firebase Firestore. Real multiplayer.**

Evidence:
- `src/lib/firebase.ts` (the active module) calls `initializeApp` + `getFirestore` with config from `import.meta.env.VITE_FIREBASE_*`. This is the file imported everywhere.
- `src/lib/gameService.ts` (active) imports `db` from `./firebase` and uses real Firestore operations: `setDoc`, `getDoc`, `updateDoc`, `onSnapshot`.
- Consumers import the real modules, confirmed by grep:
  - `src/pages/Lobby.tsx` -> `../lib/gameService` (createGame, joinGame, subscribeToGame, startGame)
  - `src/pages/Landing.tsx`, `src/pages/Game.tsx` -> `../lib/gameService`
  - `src/components/game/NightPhase.tsx`, `DayPhase.tsx` -> `../lib/gameService`
  - `src/lib/gameLogic.ts` -> `./firebase`
- The mock (`src/lib/gameService.mock.ts`) is **never imported** by any source file. It only appears in old lint-output text files. It is dead code.
- The `.real` files (`firebase.ts.real`, `gameService.ts.real`) are not `.ts` modules, are not compiled, and are not imported. They are inert snapshots. The active `firebase.ts`/`gameService.ts` are already the "real" implementations (functionally identical to the `.real` variants, plus logging and mode logic).
- The vitest run initializes the real SDK and logs `projectId: 'wolfgang-67846'`, `hasApiKey: true`, confirming a real project is wired via `.env`.

There is **no env switch** selecting mock vs real. The mock is simply orphaned. A production `vite build` bundles the real Firestore path.

Two caveats that decide whether multiplayer actually works for a real group:
1. **Env vars on Vercel.** The client needs `VITE_FIREBASE_*` at build time on Vercel. If they are missing there, `initializeApp` gets undefined config and all reads/writes fail at runtime (the app would show the loading spinner forever). Cannot verify from the repo; confirm in the Vercel dashboard.
2. **Live Firestore rules.** If the live rules match the "production rules" documented in `DEPLOYMENT.md`/`FIREBASE_RULES.md`, they would **break the game** (see section 3, the `hasOnly` bug). If they are the documented "dev rules" (`allow read, write: if true`), the game works but the database is world-writable.

Terminology note: the task framed this as "Realtime Database". The code uses **Cloud Firestore** (`getFirestore`, `doc`, `onSnapshot`), not Realtime Database. All docs and rules are Firestore. This does not change the verdict; sync is real.

---

## 2. Build, tests, lint (run honestly)

Commands run on this machine, 2026-07-11:

- `npm run build` (`tsc -b && vite build`): **PASS**, exit 0. Warnings:
  - `/noise.png referenced ... didn't resolve at build time`. `src/components/Layout.tsx` uses `bg-[url('/noise.png')]` but `public/` has no `noise.png`. The background noise texture 404s at runtime (cosmetic, the layer is `opacity-5`).
  - `firebase/firestore ... is dynamically imported by src/lib/gameLogic.ts but also statically imported` (the `await import('firebase/firestore')` for `increment` in `transitionToDay`). Harmless but pointless; use a static import.
  - Single JS chunk **785 KB (254 KB gzip)**, over Vite's 500 KB warning. No code splitting. Slow-ish first paint on mobile data.
- `npm run lint`: **PASS**, 0 errors, 0 warnings (`--max-warnings 0`).
- `vitest run`: **PASS**, 3 files, **28/28 tests** (2 App smoke + 24 `gameLogic` unit + 2 integration). Duration ~48s (Firebase init and jsdom setup dominate). The `gameLogic` suite is genuinely good: adversarial cases (votes for nonexistent players, dead-player votes, empty game state, double poison/heal) and a property/fuzz block.

Reconciling the health numbers: `.resonance/01_state.md` says 95/100 and "28/28". `docs/reports/HEALTH-2026-01-09.md` says 48/100 ("no tests, no lint") and `docs/reports/QA-2026-01-09.md` says 65/100 ("20 lint errors, build fails on unused import"). The two report files are earlier snapshots from the same day, before the fixes landed. Current reproducible reality: green across the board. The 95/100 is optimistic but the pass/fail claims hold.

Test smell worth noting: tests initialize the real Firebase project (no mock/emulator), so the suite prints the live `projectId` and needs `.env` present to look clean. Tests should mock Firebase or use the emulator.

---

## 3. Firebase security

**Verdict: unsafe-by-default and unversioned. This is the highest-priority area after multiplayer itself.**

Findings:
1. **No rules in the repo.** There is no `firestore.rules`, `firebase.json`, or `.firebaserc`. Security rules live only in the Firebase console, unversioned and unreviewable. Whatever is live cannot be confirmed here.
2. **Documented "dev rules" are world-writable.** `FIREBASE_RULES.md` ships `allow read, write: if true`, and the workflow history ("writes were silently blocked, so we opened them") makes it likely these are the live rules. If so, anyone can read, overwrite, or delete **any** game document by room code: corrupt a game, flip `status` to `GAMEOVER`, kill players, reassign `winner`. A 4-letter code space (24 letters, no I/O) is ~331k combinations, trivially enumerable to scrape or grief active games.
3. **The documented "production rules" are broken.** They allow updates only to `['players','nightActions','dayVotes','status','phaseEndTime','winner']`. The app also writes `dayCount` (every night->day), `hunterDeath`, and `accusedPlayerId`. Those `updateDoc` calls would be **rejected**, freezing `transitionToDay`. So the "secure" rules as written would break normal play. They also gate on `request.auth != null`, which never holds because...
4. **There is no authentication.** `playerId` is a client-generated string (`'player_' + Math.random().toString(36)`). No anonymous sign-in exists anywhere (no `getAuth`/`signInAnonymously`), despite `FIREBASE_RULES.md` claiming "Anonymous authentication (already supported by the app)". It is not supported. Identity is fully spoofable: anyone can write as any `playerId`.
5. **Whole-document exposure defeats hidden roles.** `subscribeToGame` streams the entire game doc, including `players[*].role` for every player, to every client. Any player can open devtools and read everyone's secret role directly from the Firestore payload. For a hidden-role social deduction game this is a core-integrity gap. The only real fix is server-authoritative logic (Cloud Functions) that withholds other players' roles until reveal; that is a large change. For a friends-only casual context it may be tolerable, but it is worth stating plainly against the "high-fidelity" ambition in the soul.
6. **Client-authoritative game logic.** All resolution (`resolveNightActions`, `resolveDayVotes`, `checkWinCondition`, kills, transitions) runs in the browser and writes results to Firestore. A modified client can write arbitrary state. Acceptable for trusted friend groups, not for public/anonymous rooms.
7. **The public web API key is fine.** `VITE_FIREBASE_API_KEY` in the client is expected and not a secret. `.env`/`.env.local` are gitignored. No real secret is shipped in source. This is the one thing the prior reports got right.

Minimum viable hardening (without a backend rewrite): scope rules to `/games/{code}`, cap document size, require that a write's affected keys stay within the real schema (including `dayCount`, `hunterDeath`, `accusedPlayerId`, `mode`), add anonymous auth so `request.auth` is meaningful, and add a TTL/cleanup for old games. Verset the rules file into the repo and deploy via CLI so they are reviewable.

---

## 4. First-principles battery, per screen

### Landing (`src/pages/Landing.tsx`)
- **Job to be done:** get a group into a room fast (create or join), or resume an active game.
- **Value + clarity:** strong. Title, subtitle ("Der digitale Begleiter fuer dein Werwolf-Spiel"), a one-line "no moderator needed" pitch, and an expandable HowToPlay with four cards (Roles/Night/Day/Victory). Two obvious CTAs plus a conditional green "resume" button when a session exists. A first-timer understands what this is in seconds.
- **Positioning insight:** the copy frames WolfGang as a *companion that replaces the human moderator* for a group that is physically together. There is no in-app chat or voice; discussion is meant to happen in the room. That is a co-located, one-phone-each design, not remote play. The brief's "play with friends across devices" is true at the sync layer but the product is built for same-room groups. Worth making explicit in marketing so expectations match.
- **CTA:** clear single primary ("Rudel gruenden"), secondary join, optional resume. Good.
- **Copy:** DE and EN both idiomatic, dark-playful, on tone. No dashes issues.
- **Mobile:** centered stack, `max-w-xs` buttons, large tap targets. Version pinned `absolute bottom-6` can crowd the home indicator on small screens; minor.
- **Robustness:** `handleRejoin` calls `reconnectToGame`; on failure it clears the session and drops the resume button. Sensible.

### Lobby (`src/pages/Lobby.tsx`)
- **Job to be done (host):** set name/avatar/mode, open a room, share the code, start. **(joiner):** set name/avatar, enter code, wait.
- **Value + clarity:** good. Avatar grid, name field, five mode cards with `InfoTooltip` details and recommended player counts. Room code shown large and monospaced with a copy button. Player list updates live.
- **CTA:** one primary per state ("Lobby oeffnen" / "Beitreten" / "Spiel starten"). Good.
- **Copy:** fully i18n via `t.lobby` and `t.modes`. Idiomatic both languages. One label ("Spielmodus"/"Game Mode") is inlined with a ternary rather than a key; trivial.
- **Mobile:** mode cards are `p-4` with `scale`/glow on selection, thumb-friendly. Avatar buttons `p-2` are on the small side but acceptable.
- **Robustness gaps:**
  - **Min players is 2**, a testing hack shipped to prod (`startGame` throws only under 2; Start button disabled under 2). `TESTING.md` itself says production should be 4+. Two-player Classic is degenerate: role config yields `[WOLF, SEER, WITCH]` for two seats, so one special role is dropped and there is no plain villager; win math collapses to near-coin-flip. Raise the floor to 4 (or per-mode minimums) for real play.
  - `startGame` is a read-then-write with no transaction and is not host-guarded on the server. Only the host sees the button, but any client could call it. Low risk given the trust model, but not enforced.
  - No de-dupe of names or avatars; two "Max" with the same fox are indistinguishable in-game (names use `translate="no"`, good, but collisions are unhandled).

### In-game shell (`src/pages/Game.tsx`)
- **Job to be done:** show the current phase, the player's role, and drive the round.
- **Clarity:** header with room code, `GameTimer`, phase icon, a role-reminder card, then `HostControls` + the phase component. A leave button with a confirm dialog. Reasonable.
- **Copy bug:** the game-over flavor lines (roughly lines 131-137) are **hardcoded German** ("Der Wolf hat 3 Tage ueberlebt!", "Das Dorf hat alle Bedrohungen eliminiert!"), even though the win/lose headers use `t.game`. English players get German here.
- **Robustness:** `beforeunload` warns during an active game (good). Reconnect-on-mount via `reconnectToGame`. But leaving only resets local state (see section 6).

### RoleReveal (`src/components/game/RoleReveal.tsx`)
- **Status: DEAD CODE.** Nothing imports or renders `RoleReveal`. The dramatic flip-card reveal is never shown; players instead see a small static "Deine Rolle: X" card in `Game.tsx`. A polished, on-theme component is going to waste.
- **Copy:** entirely hardcoded German (role names, descriptions, "Verstanden, weiter"), with a parallel `t.roleReveal` dictionary that exists but is unused. If wired in, it must switch to i18n.

### NightPhase (`src/components/game/NightPhase.tsx`)
- **Job to be done:** let each role act (wolf picks victim, seer inspects, others idle with a minigame).
- **Clarity:** role-specific views are clear; wolf sees the pack (hidden in Survival Sprint), seer gets an inline role reveal on tap, villagers get the firefly minigame.
- **Copy bug (major):** the whole component is **hardcoded German**. "Nachtphase", "Waehle ein Opfer:", "Bestaetigen", "Seherin", "Die Nacht bricht herein...", "Du schlaefst friedlich...". The `t.night` dictionary is complete in DE and EN but unused. English players play the entire night in German.
- **Robustness:** `hasActed` is local state; a wolf can submit once per mount, but a refresh resets it and Firestore already holds the vote, so re-voting is possible (last write wins, low harm). Seer's result is computed client-side from the synced doc (so a seer could read any role anyway; see section 3).

### DayPhase (`src/components/game/DayPhase.tsx`)
- **Job to be done:** discuss (IRL) and cast one elimination vote; dead players observe.
- **Clarity:** good. Vote grid, live tally ("Stimmen abgegeben: n / alive"), accused badge for The Accused, Blitz countdown nudge.
- **Copy bug (major):** **hardcoded German** throughout ("Tagphase", "Wen verdaechtigst du?", "Stimme abgeben", "Geistermodus"). `t.day` exists in both languages, unused.
- **Robustness:** the dead-player inline "ghost" view here (hardcoded German) is what actually renders for dead players; the richer `GhostMode` component is not used. The alive denominator in the tally counts players who *left* (still `isAlive` on the server), so it can read as incomplete forever (see section 6).

### GameTimer (`src/components/game/GameTimer.tsx`)
- **Job to be done:** show time left; optional expiry callback.
- **Clarity:** clean mm:ss, red pulse under 10s. In `Game.tsx` it is display-only; auto-advance lives in `HostControls`. Consistent.
- **Nit:** re-derives from `Date.now()` every second against `phaseEndTime`; fine.

### GhostMode (`src/components/game/GhostMode.tsx`)
- **Status: DEAD CODE.** Never imported/rendered. It is fully i18n (`t.ghostMode`) and nicer than the inline ghost view that ships. Either wire it in or delete it. It also reveals all living roles to the dead player, which is expected for ghost mode but reinforces that roles are on the client.

### HostControls (`src/components/game/HostControls.tsx`)
- **Job to be done:** advance phases (manual button + auto on timer), resolve deaths, run hunter revenge, end the game.
- **Clarity:** host-only card, shows next action and live vote count. Uses `t.game`, so this one is localized.
- **Critical robustness issues:**
  - **Renders only for the host** (`game.hostId !== playerId -> null`). Phase transitions and the auto-timer exist nowhere else. Host leaves or disconnects -> game frozen for all. No host migration.
  - **Uses `window.confirm`** for manual transitions. Native blocking prompt, jarring on mobile, and inconsistent with the custom `ConfirmDialog` used elsewhere.
  - **Auto-advance depends on the host's foreground tab.** The `setInterval` timer that auto-advances phases only ticks on the host device. Mobile browsers throttle/suspend timers in backgrounded tabs, so if the host locks the phone or switches apps, phases stall until they return. For a phone game this is a real failure mode.
  - **Hunter is unreachable.** No game mode assigns `HUNTER` (`assignRoles` has no hunter slot and no mode config sets one), so `HUNTER_REVENGE`, `triggerHunterRevenge`, and `handleHunterShot` are dead paths. The role appears in `RoleReveal`/types but can never be dealt.

### HowToPlay (`src/components/ui/HowToPlay.tsx`)
- **Job to be done:** explain the loop before playing.
- **Clarity:** four concise cards, fully i18n, on-tone. Good. Expandable so it does not clutter the landing.
- **CTA:** none needed; it is informational.

### VillagerMinigame (`src/components/game/VillagerMinigame.tsx`)
- **Job to be done:** keep idle players engaged during the night.
- **Clarity + mobile:** tap fireflies, score counter, i18n. Framer-motion loops for up to 8 sprites; fine on modern phones. Nice touch that fits the theme.

---

## 5. Copy and DE/EN parity

- **Dictionary parity: excellent.** `src/i18n/translations.ts` has matching DE and EN trees for landing, modes, modeInstructions, lobby, game, roles, actions, night, day, roleReveal, ghostMode, minigame. EN is idiomatic and keeps the dark-playful voice ("Speedrun the apocalypse", "Paranoia Level 1000", "lie to your friends' faces"). DE reads native, not translated. No em/en dashes in the strings (hyphens only). Tone is consistent.
- **The gap is wiring, not translation.** The three highest-traffic in-game surfaces (`NightPhase`, `DayPhase`, and the game-over flavor text in `Game.tsx`) are hardcoded German and never touch the dictionary. So the EN experience silently collapses to German the moment the game starts, even though the EN strings already exist. This is the single biggest copy defect and it is cheap to fix (swap literals for `t.night.*` / `t.day.*`). `RoleReveal` and `GhostMode` are also German-hardcoded but are dead code.
- **Small leaks:**
  - `ConfirmDialog` defaults are hardcoded English ("Confirm"/"Cancel"); `Landing` passes `cancelLabel="Cancel"` literally, so DE users see "Cancel" on the new-game dialog. Use `t.lobby.back`.
  - `ErrorBoundary` text ("Something went wrong", "Reload Game") and `ConnectionStatus` ("Firebase Connected") are hardcoded English (both low-visibility; ConnectionStatus is unused).
  - `index.html` has `lang="en"` while the app is DE-first by default; set dynamically or to a neutral value.
- **DE typo in the dictionary:** `day.whoDoYouSuspect` is `"Wen verd aechtigst du?"` (stray space, should be "verdaechtigst"). Currently unused because `DayPhase` hardcodes the correct string, but fix it before wiring i18n in.
- **Language detection:** `detectBrowserLanguage()` defaults non-English browsers to German, English browsers to English, and persists the choice. Reasonable for a DE-first product.

---

## 6. Correctness and robustness (reasoned from code)

Ranked by severity.

1. **Host is a single point of failure (critical).** Phase progression and the auto-timer live only in `HostControls`, which renders only for the host. Host disconnect, tab close, app switch, or leave -> the game freezes permanently. No migration of `hostId`. The soul explicitly demands graceful host-leaving; this is unmet.
2. **Leaving does not update the server (high).** `Game.confirmLeave` and `Landing.confirmNewGame` call `reset()`, which only clears local `localStorage`/Zustand. The player stays in `game.players` on Firestore, still `isAlive: true`. Consequences: vote tallies count phantom "alive" players, and `checkWinCondition` counts a departed villager as a living villager, so wolves may never reach parity and the game cannot resolve correctly. There is no `removePlayer`/`leaveGame` server write anywhere.
3. **Timers rely on the host's foreground tab (high, mobile-specific).** Backgrounded mobile tabs throttle `setInterval`, so auto-advance stalls whenever the host's phone sleeps or switches apps. Combined with (1), the game's forward motion is fragile on exactly the primary surface.
4. **No connection feedback in play (medium).** `ConnectionStatus` exists but is never rendered. If Firestore is unreachable or rules block writes, players just see the loading spinner ("Lade Spiel...") or a dead button with a console error. The soul's robustness principle wants graceful degradation; there is none surfaced to the user.
5. **Min-players = 2 in production (medium).** Degenerate role assignment and win math for tiny games (see Lobby). Raise to 4+ or set per-mode minimums.
6. **Auto-transition can double-fire (low/medium).** The 1s interval keeps firing between the transition write and the `onSnapshot` echo. `isProcessing` guards within a render, but there is a race window. `killPlayers`/transitions are close to idempotent, so harm is limited, but two rapid transitions could skip a phase.
7. **Join mid-game and rejoin-by-code (low).** `joinGame` correctly blocks non-LOBBY joins. Reconnect only works if the `playerId` is already in `players`; a friend who gets the code late cannot join once started (by design), but there is no clear messaging for it.
8. **What is actually solid:** the pure resolvers (`resolveNightActions`, `resolveDayVotes`, `checkWinCondition`) are well-tested, handle ties (no death), ignore dead-player and nonexistent-target votes, and survive empty state. Vote writes are per-voter keys, so concurrent votes do not clobber each other. `ErrorBoundary` wraps the app at the root. Session persistence with a 24h TTL is sensible.

---

## 7. Accessibility

- `Input` renders a `<label>` with no `htmlFor`/`id` link to the `<input>`; screen readers do not associate them. Easy fix.
- Avatar and firefly buttons are emoji-only with no `aria-label`.
- Vote status uses color-only cues (green/red dots, check/circle glyphs help a bit).
- `window.confirm` in `HostControls` is a blocking native prompt; the custom `ConfirmDialog` (ESC + backdrop close, `aria-label` on close) is better and should be used consistently.
- No focus trapping on dialogs/reveal, no safe-area-inset handling for notch/home indicator (the fixed language toggle at `top-4 right-4` can sit under a notch).
- `ErrorBoundary` at the root is good. The missing `ConnectionStatus` wiring is the main resilience-UX gap.

---

## 8. Mobile and design (primary surface, 375px)

- Layouts use `max-w-md`/`max-w-xs`, `grid-cols-2` player pickers, `grid-cols-4` avatars: appropriate for phones. Most tap targets are generous (`p-4`), avatars slightly small (`p-2`).
- Dark immersive aesthetic holds: deep-purple to midnight-blue gradient, blood-red accents, Cinzel display font. Fonts load via a Google Fonts `@import` in `index.css` (works, but render-blocking; and hotlinking Google Fonts is a known GDPR sore point for German-facing sites, see section 9).
- `public/noise.png` is missing, so the intended noise overlay 404s (cosmetic).
- Framer-motion animations are lightweight; no obvious jank.
- 785 KB single JS bundle (254 KB gzip) with no splitting: acceptable but not great on mobile data; the biggest quick win is lazy-loading Firebase/analytics.
- `Layout` root uses `overflow-hidden`; content still flows since the container grows with content, but it clips decorative layers by design. No confirmed scroll bug.

---

## 9. Trust, legal, privacy (German-facing)

- **No Impressum, no Datenschutzerklaerung, no cookie/consent notice anywhere.** Grep for Impressum/Datenschutz/Privacy/Cookie in `src/` returns nothing.
- The app processes personal-ish data (chosen display names) and loads Firebase (Google) plus Google Fonts and Firebase Analytics from Google servers. For a product aimed at German users this needs at least a basic Datenschutzhinweis and an Impressum. Google Fonts hotlinking specifically has been ruled a data-protection issue in DE; self-hosting the fonts removes that exposure.
- Firebase Analytics is initialized on load (`getAnalytics`) with no consent gate. Either gate it behind consent or drop it for a party game that does not need it.
- Suggested entity for the imprint (from the brief): Pirate GmbH, Brabanter Str. 53, 50672 Koeln, info@pirate.global.

---

## 10. File hygiene (what to clean)

The `.real`/`.mock`/`.backup` sprawl signals confusion about what is canonical. Canonical is `src/lib/firebase.ts` + `src/lib/gameService.ts`. Remove or archive:
- `src/lib/firebase.ts.real`, `src/lib/gameService.ts.real` (inert snapshots).
- `src/lib/gameService.mock.ts` (never imported).
- `src/i18n/translations.ts.backup` (173-line older copy; current is 490 lines).
- `src/components/game/RoleReveal.tsx`, `src/components/game/GhostMode.tsx`, `src/components/ConnectionStatus.tsx` (all defined, none rendered) - wire in or delete. `RoleReveal` and `GhostMode` are genuinely nicer than what ships, so wiring is the better call.
- `archive/old_broken_env/` contains a full committed-on-disk `node_modules/` tree plus an old app copy: large and pure noise. Remove from the repo.
- Root clutter: `firebase-debug.log`, `lint-output.txt`, `lint_results.txt`, `dev-scripts/patch-lobby.*`, `dev-scripts/mode-selection-insert.txt`.
- Reconcile the three conflicting health numbers (95 vs 65 vs 48) into one current state file.

---

## 11. Deploy URL

Could not confirm the live URL from the repo (no network fetch run). Candidates:
- Vercel project is `wolfgang` (`.vercel/project.json`), so likely `https://wolfgang.vercel.app` (or a team-scoped alias).
- Firebase project is `wolfgang-67846` (from the test log and docs), so the Firebase Hosting fallback would be `https://wolfgang-67846.web.app`.
Verify the actual production alias in the Vercel dashboard.

---

## 12. Prioritized changes (top 15, impact-ranked)

Correctness/multiplayer/security first.

1. **[Firebase security] add + version scoped Firestore rules.** Replace world-writable dev rules. Scope to `/games/{code}`, allow the real key set (`players, nightActions, dayVotes, status, phaseEndTime, winner, dayCount, hunterDeath, accusedPlayerId, mode`), cap doc size, add game TTL/cleanup. Commit a `firestore.rules` file and deploy via CLI. Fixes the world-writable exposure and the broken "production rules" `hasOnly` bug in one move.
2. **[Vercel] verify `VITE_FIREBASE_*` env vars are set in production.** Without them the deployed app cannot reach Firebase and multiplayer silently dies. One dashboard check; gates everything.
3. **[HostControls/gameService] remove the host single point of failure.** Either promote a new host when the current one disconnects (Firebase `onDisconnect`/presence + reassign `hostId`), or let any client drive the timer-based auto-transition. Today, host loss freezes the game.
4. **[gameService] implement leave/disconnect on the server.** Add `leaveGame(code, playerId)` that removes the player from `players` (and reassigns host if needed); call it from `confirmLeave` and on disconnect. Fixes phantom "alive" players skewing votes and win conditions.
5. **[NightPhase + DayPhase] wire i18n.** Replace all hardcoded German with the existing `t.night.*` / `t.day.*` keys. Restores the English experience for the whole in-game loop. Cheap, high impact.
6. **[Game.tsx] localize the game-over flavor text.** Move the hardcoded German win/lose lines into `t.game`.
7. **[HostControls] fix mobile timer reliability.** Do not rely on a backgrounded host tab. Drive auto-advance from `phaseEndTime` on any live client, or compute transitions server-side; at minimum, add a visible "host must keep the app open" state and a manual advance fallback for all.
8. **[Lobby/gameService] raise min players to 4 (or per-mode minimums).** Ships a testing hack today; two-player games are degenerate. Update the disabled-state copy accordingly.
9. **[Security/UX] add real player secrecy or state the limitation.** Roles for all players are streamed to every client. Either move resolution server-side (Cloud Functions) and withhold others' roles, or, if staying casual, document that WolfGang assumes friendly players. This is the core hidden-role integrity call.
10. **[ConnectionStatus] render it and localize it.** Surface Firebase connectivity/errors in-app instead of an endless spinner. Add a timeout on the Game loading state that explains failure and offers retry.
11. **[Legal] add Impressum + Datenschutzhinweis, self-host fonts, gate analytics.** Add a footer link to both pages (entity: Pirate GmbH, Brabanter Str. 53, 50672 Koeln, info@pirate.global). Self-host Cinzel/Inter to remove the Google Fonts GDPR exposure. Gate or drop Firebase Analytics.
12. **[RoleReveal] wire the reveal in at game start (i18n).** A polished, on-theme flip-card reveal is built and unused; showing it once when roles are assigned is a real UX upgrade over the static reminder. Swap its German literals for `t.roleReveal.*`.
13. **[HostControls] replace `window.confirm` with `ConfirmDialog`.** Consistent, non-blocking, on-theme, works better on mobile.
14. **[Hunter] either implement or remove it.** No mode deals the Hunter, so all hunter-revenge code is dead. Either add it to a mode's role config or strip the role, the `HUNTER_REVENGE` state, and its UI.
15. **[Hygiene + perf] delete `.real/.mock/.backup` and `archive/old_broken_env`, fix `/noise.png`, lazy-load Firebase.** Remove the canonical-file confusion, ship the missing texture (or drop the layer), and code-split the 785 KB bundle (Firebase/analytics lazy) for faster mobile first paint. Also fix the DE typo `day.whoDoYouSuspect` ("verd aechtigst").

---

Notes on method: verdicts on rules and env vars are stated as conditional because neither the live Firestore rules nor the Vercel env config are in the repo. Everything else is grounded in the source as it exists on disk, plus a real build/lint/test run on this machine.
