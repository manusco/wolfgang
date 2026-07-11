# Current State

## Phase
Code complete and verified locally. Production deploy needs a manual step.

## Version
v0.2.0. Build, lint, and 28 tests green. Pushed and tagged.

## Shipped in this pass
- Fixed the biggest defect: English players were playing the whole night and day loop in German. Now bilingual all the way through.
- Added a real connection status.
- Played the role-reveal card at the start.
- Required four players to start.
- Self-hosted the fonts.
- Versioned a correct `firestore.rules` file (deploy via the Firebase CLI).
- Removed a disconnected phone number.

## Live vs Blocked
- Verified locally: build, lint, and 28 tests pass. Tag pushed.
- Blocked on going live: the production deploy is a manual step (`vercel --prod` or the Vercel dashboard, per DEPLOYMENT.md). The live URL could not be confirmed.

## Next Steps
1. Run the production deploy (`vercel --prod` or the dashboard).
2. Deploy `firestore.rules` via the Firebase CLI.
3. Confirm the live URL and smoke-test a full game in both languages.

---
**Note**: This file is the agent's persistent memory across sessions.
