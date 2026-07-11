# WolfGang - Forward Improvements

What would make this game great next. Not a log of what shipped (see `CHANGELOG.md` and `docs/AUDIT_FINDINGS.md`). The next bets, ranked.

## The one move that matters most
Make the game survive a host who leaves. Right now the host is a single point of failure: if their phone dies, backgrounds, or drops connection, the whole table is stuck. For a party game passed around a room, that is the most likely real-world failure. Host migration (or letting any client drive the phase transition) turns a fragile session into a robust one. Everything else here is smaller.

## Priority 0: owner action (blocking security and multiplayer)

**Deploy the Firestore rules.** The repo now has a correct, scoped `firestore.rules`, but rules are not auto-deployed. Until you run `firebase deploy --only firestore:rules`, the live database still uses whatever is in the console today. If that is the documented "dev" rule, any player can read or corrupt any game by its 4-letter code. Deploy the versioned rules.

**Confirm the production Firebase env vars.** Multiplayer only works if `VITE_FIREBASE_*` are set in the production host (Vercel or Firebase Hosting). Verify them, or the deployed build silently fails to connect.

## Priority 1: robustness (the game's stated principle)

**Host migration / disconnect handling.** See the top note. When the host drops, promote another connected player or let the client with the earliest join time drive transitions.

**Server-side leave handling.** A player who closes the tab stays `isAlive` in the document, which breaks the vote count and the win condition. Mark leavers dead or absent and recompute.

**Fix the mobile timer.** The auto-advance timer dies when the host's phone backgrounds the tab. Drive the phase deadline from a server timestamp and reconcile on focus, so a backgrounded host does not freeze the round.

## Priority 2: fairness and trust

**Real role secrecy.** The whole game document, including every player's role, is streamed to every client, so a technical player can read all roles from devtools. If the audience is friends in a room, document that trust model explicitly. If it needs to be cheat-resistant, resolve roles server-side (a Cloud Function) and send each client only what it may see.

## Priority 3: first-time experience

**A guided first game.** New groups do best with a tiny bit of hand-holding. A one-screen "how a round works" before the first night, dismissable, lifts the odds that a new table finishes their first game.

**Reconnect gracefully.** When a player reconnects, drop them back into the current phase with their role intact, rather than a cold load. This pairs with the connection status work already shipped.

## Priority 4: performance and polish

**Split the Firebase bundle.** The main chunk is over 500 kB because Firebase is statically imported. Lazy-load it so the landing screen paints fast on a phone on mobile data.

**More game-mode clarity.** The modes (Classic, Blitz Wolf, One Shot Seer, and the rest) are a real differentiator. A short one-line description of each at selection time helps a host pick the right one for their group.

## Priority 5: housekeeping
- Remove the remaining dev junk: `firebase-debug.log`, `lint-output.txt`, `lint_results.txt`, and `dev-scripts/` if unused.
- Add a couple of component tests for the night and day phase rendering now that they are localized, so the i18n wiring cannot silently regress.
