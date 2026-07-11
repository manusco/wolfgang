import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('[Firebase] Initializing app...', {
    hasApiKey: !!firebaseConfig.apiKey,
    projectId: firebaseConfig.projectId
});

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Analytics is OFF by default for GDPR reasons (no consent gate exists in this
// party game). Set VITE_ENABLE_ANALYTICS="true" at build time to opt in.
const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
let analyticsInstance: Analytics | null = null;

if (analyticsEnabled) {
    try {
        analyticsInstance = getAnalytics(app);
        console.log('[Firebase] Analytics initialized successfully');
    } catch (error) {
        console.warn('[Firebase] Analytics initialization failed (non-critical):', error);
    }
}

export const analytics = analyticsInstance;
