# Changelog

## 0.2.0 - 2026-07-11

First-principles audit pass. Findings in `docs/AUDIT_FINDINGS.md`. The game engine and multiplayer sync were already solid; this pass fixed the biggest player-facing defect (English players stuck in German), the connection feedback, and the trust and hygiene layer.

### Fixed
- English players played the entire night and day loop in German. `NightPhase`, `DayPhase`, and the game-over text were hardcoded German and bypassed the translation system. They now route through i18n, so switching language flips the whole in-game loop. This was the single biggest defect.
- Fixed the German typo in the day suspicion prompt ("verdächtigst").
- `ConnectionStatus` was built but never shown. It is now mounted, localized, and has a real error and retry state instead of an endless spinner.
- Host actions used raw browser confirm dialogs; they now use the styled `ConfirmDialog`.

### Added
- The role-reveal flip card (built but unused) now plays once at game start, localized, and correctly stays hidden in the hidden-role mode.
- A minimum of four players to start a game (two- and three-player Werewolf is degenerate).
- A versioned `firestore.rules` that scopes writes to a game document, validates the full field set the game actually writes (so phase transitions do not freeze), and closes every other path. It must be deployed with the Firebase CLI (`firebase deploy --only firestore:rules`); see `FIREBASE_RULES.md`.

### Changed
- Self-hosted the fonts (Cinzel, Inter) instead of hotlinking Google Fonts, removing an IP-leak GDPR exposure. Analytics stays off unless explicitly enabled.
- The legal page (`/legal`) carries a truthful Datenschutz describing exactly what Firestore stores (display name, avatar, room code, and game state; no account). Removed the disconnected phone number.

### Removed
- A committed `archive/old_broken_env` (a full stale environment) and inert duplicate files (`*.real`, `*.mock`, `*.backup`), plus the missing `noise.png` reference (now an inline asset).

### Owner action needed (see FUTURE_IMPROVEMENTS.md)
- Deploy the new Firestore rules with the Firebase CLI, and confirm the `VITE_FIREBASE_*` env vars are set in the production host.
