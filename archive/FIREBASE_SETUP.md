# Firebase Setup Guide for Schattenrudel

## Step 1: Initialize Firebase in Your Project

You've already installed `firebase-tools` globally. Now let's connect this project to Firebase:

```bash
firebase login
firebase init
```

When prompted, select:
- ✅ Firestore: Configure security rules and indexes
- ✅ Hosting: Configure files for Firebase Hosting
- ❌ Functions, Storage, etc. (not needed for MVP)

**Firestore Setup:**
- Use existing project: `wolfgang-67846`
- Use default `firestore.rules` and `firestore.indexes.json`

**Hosting Setup:**
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub deploys: `No` (for now)

## Step 2: Configure Firestore Security Rules

Your app needs these collections:
- `games` - For active game sessions

Navigate to the [Firebase Console](https://console.firebase.google.com/project/wolfgang-67846/firestore) and set up these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to create and read games (for MVP)
    // TODO: Add proper authentication later
    match /games/{gameId} {
      allow read, write: true;
    }
  }
}
```

⚠️ **Security Note**: These rules are permissive for development. Before going live, implement proper user authentication.

## Step 3: Test the Connection

The app should show "Firebase Connected" at the bottom. If you see "Connection Failed", check:
1. Is the `.env` file in the root directory?
2. Are the Firebase credentials correct?
3. Is Firestore enabled in the Firebase Console?

## Step 4: Deploy to Firebase Hosting (Optional)

When you're ready to share:

```bash
npm run build
firebase deploy
```

Your app will be live at: `https://wolfgang-67846.web.app`
