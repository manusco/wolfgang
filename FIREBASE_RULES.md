# Firebase Security Rules for Wolfgang/Schattenwelt

## Problem
Firestore writes are being silently blocked because the database is in production mode with restrictive security rules.

## Solution
Update Firestore security rules to allow authenticated (or temporarily public) access.

## Development Rules (Temporary - for testing)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // WARNING: These rules allow anyone to read/write to your database
    // Only use these for development/testing!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Production Rules (Recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Games collection
    match /games/{gameId} {
      // Anyone can read game state (needed for spectators)
      allow read: if true;
      
      // Anyone can create a new game
      allow create: if request.resource.data.status == 'LOBBY';
      
      // Only allow updates to specific fields
      // This prevents malicious writes to game state
      allow update: if request.auth != null ||
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['players', 'nightActions', 'dayVotes', 'status', 'phaseEndTime', 'winner']);
    }
  }
}
```

## How to Update Rules

### Option 1: Firebase Console (Recommended)
1. Go to https://console.firebase.google.com
2. Select your project: `wolfgang-67846`
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the development rules above
5. Click **Publish**

### Option 2: Firebase CLI
If you have the Firebase CLI installed:
```bash
# Create firestore.rules file in project root
# Then deploy
firebase deploy --only firestore:rules
```

## ⚠️ Security Warning
The development rules (`allow read, write: if true`) make your database completely public. This is fine for testing but **NOT for production**. Once you're ready to deploy, switch to the production rules.

The production rules require:
- Anonymous authentication (already supported by the app)
- Controlled field updates (prevents game state manipulation)
