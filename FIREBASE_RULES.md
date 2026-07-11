# Firebase Security Rules for WolfGang/Schattenwelt

## The rules live in `firestore.rules`

The security rules are now versioned in the repo root at
[`firestore.rules`](./firestore.rules). That file is the single source of truth.
Do not paste ad-hoc rules into the Firebase console; edit `firestore.rules` and
deploy it.

## These rules are NOT auto-deployed

Neither `npm run build` nor a Vercel deploy publishes Firestore rules. The file
only takes effect after an explicit deploy with the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

Until you run that command, whatever is currently live in the Firebase console
stays live. `firebase.json` already points the CLI at `firestore.rules`.

## What the versioned rules fix

1. **World-writable exposure.** The former dev rules (`allow read, write: if true`
   on `/{document=**}`) let anyone read, overwrite or delete any document by room
   code. The new rules scope every write to `/games/{code}`, validate the shape,
   cap the document at 20 players, and close every other path.

2. **Frozen phase transitions.** The former "production" rules only allowed
   updates to `['players','nightActions','dayVotes','status','phaseEndTime','winner']`
   and therefore rejected the writes to `dayCount` (every night to day),
   `hunterDeath` and `accusedPlayerId`, which froze the game. The new field
   allowlist is derived from the real writes in `src/lib/gameService.ts` and
   `src/lib/gameLogic.ts` and includes all of those fields.

## Trust model and limits

The game has no authentication: player ids are random client strings, so the
rules cannot gate on `request.auth` (that would block every write). The rules
harden shape and scope, not identity. They are appropriate for trusted,
friends-only rooms. Full anti-cheat and hidden-role secrecy would require a
server-authoritative backend (Cloud Functions) and is out of scope.

## The public web API key is fine

`VITE_FIREBASE_API_KEY` in the client is expected and is not a secret. `.env` and
`.env.local` are gitignored. No real secret ships in source.
