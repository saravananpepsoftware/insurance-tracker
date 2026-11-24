import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyAld7NwjXNpdT-ilJiuzaNEpWrwCirL_zA",
  authDomain: "ashok-auto-insurnace.firebaseapp.com",
  projectId: "ashok-auto-insurnace",
  storageBucket: "ashok-auto-insurnace.firebasestorage.app",
  messagingSenderId: "844113303797",
  appId: "1:844113303797:web:8b09668da7c9a115340dbc",
  measurementId: "G-5HCX58H80J"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (safely check browser environment support)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}
