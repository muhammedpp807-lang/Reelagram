// Standalone Firebase entry point (plain JS).
// The React app uses `src/firebase.ts`; this file mirrors that config so you
// can also use Firebase from non-TS scripts or a plain HTML page if needed.
//
// Docs: https://firebase.google.com/docs/web/setup

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8K2B-out3gHxPAZ8egv7cCwxTnwVQrFc",
  authDomain: "reelagram-81560.firebaseapp.com",
  databaseURL: "https://reelagram-81560-default-rtdb.firebaseio.com",
  projectId: "reelagram-81560",
  storageBucket: "reelagram-81560.firebasestorage.app",
  messagingSenderId: "836309025458",
  appId: "1:836309025458:web:058e0e811f0e995e3abfab",
  measurementId: "G-TYXN3RRC0E",
};

// Reuse an existing app if one is already initialized (avoids HMR duplicates).
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

// Analytics only works in the browser AND requires the host to be supported
// (e.g. https or localhost). Load it lazily so SSR/Node tooling doesn't crash.
export let analytics = null;
if (typeof window !== "undefined") {
  import("firebase/analytics")
    .then(({ getAnalytics, isSupported }) =>
      isSupported().then((ok) => {
        if (ok) analytics = getAnalytics(app);
      }),
    )
    .catch(() => {
      /* analytics is optional; ignore if blocked */
    });
}

export { firebaseConfig };
