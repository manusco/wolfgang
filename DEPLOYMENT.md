# Deployment Guide - WolfGang/Schattenwelt

## Quick Deploy (Recommended): Vercel + Firebase

This is the fastest way to get your game online.

### Prerequisites
- Firebase project already set up ✓
- Firestore database created ✓
- Environment variables in `.env.local` ✓

### Step 1: Build the App

```bash
npm run build
```

This creates a `dist` folder with your production-ready app.

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Fastest)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts:
   - "Set up and deploy?" → **Yes**
   - "Which scope?" → Select your account
   - "Link to existing project?" → **No**
   - "What's your project's name?" → `wolfgang` (or any name)
   - "In which directory is your code located?" → `./`
   - "Want to override settings?" → **No**

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all `VITE_FIREBASE_*` variables from your `.env.local`

5. Redeploy:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard (No CLI)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository (or upload the project)
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables in the dashboard (same as above)
6. Click "Deploy"

### Step 3: Update Firebase Rules (Production)

Replace your current Firestore rules with these more secure production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      // Anyone can read game state
      allow read: if true;
      
      // Anyone can create a new game
      allow create: if request.resource.data.status == 'LOBBY';
      
      // Only allow updates to game-related fields
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['players', 'nightActions', 'dayVotes', 'status', 'phaseEndTime', 'winner']);
    }
  }
}
```

### Step 4: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://wolfgang-xyz.vercel.app`)
2. Create a game
3. Share the room code with friends
4. Test the full game flow

---

## Alternative: Firebase Hosting

If you prefer to host everything on Firebase:

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase Hosting

```bash
firebase init hosting
```

- **Public directory**: `dist`
- **Single-page app**: **Yes**
- **Set up automatic builds**: **No**
- **Overwrite index.html**: **No**

### Build and Deploy

```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at: `https://wolfgang-67846.web.app`

---

## PWA Installation

Your app is already configured as a PWA (Progressive Web App). Users can:

1. Visit your deployed URL on their phone
2. Tap "Add to Home Screen" (iOS) or "Install App" (Android)
3. Play WolfGang like a native app!

---

## Environment Variables Checklist

Make sure these are set in your deployment platform:

- ✓ `VITE_FIREBASE_API_KEY`
- ✓ `VITE_FIREBASE_AUTH_DOMAIN`
- ✓ `VITE_FIREBASE_PROJECT_ID`
- ✓ `VITE_FIREBASE_STORAGE_BUCKET`
- ✓ `VITE_FIREBASE_MESSAGING_SENDER_ID`
- ✓ `VITE_FIREBASE_APP_ID`
- ✓ `VITE_FIREBASE_MEASUREMENT_ID`

---

## Troubleshooting

### Game won't load in production
- Check browser console for errors
- Verify all environment variables are set correctly
- Make sure Firebase rules are published

### Players can't join games
- Verify Firestore rules allow `update` operations
- Check that room codes are being generated correctly

### App is slow
- Enable Firebase's free CDN (automatic with Firebase Hosting)
- Consider upgrading Firestore to Blaze plan for better performance

---

## Cost Estimate (Free Tier)

- **Vercel**: Free for personal projects
- **Firebase Firestore**: 50K reads/day, 20K writes/day (free)
- **Firebase Hosting**: 10GB storage, 360MB/day transfer (free)

Your game should comfortably stay within free limits unless you go viral! 🎮
