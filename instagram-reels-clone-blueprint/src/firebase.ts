// Firebase initialization.
// Defaults to the Reelagram project below; can be overridden via Vite env vars
// (VITE_FIREBASE_*) if you want to point at a different Firebase project
// without editing this file. See Firebase console: Project Settings → Web app.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const env = ((import.meta as any).env ?? {}) as Record<string, string | undefined>;

// ---- Your Firebase project config (hard-coded fallback) ----
const defaultConfig = {
  apiKey: "AIzaSyA8K2B-out3gHxPAZ8egv7cCwxTnwVQrFc",
  authDomain: "reelagram-81560.firebaseapp.com",
  databaseURL: "https://reelagram-81560-default-rtdb.firebaseio.com",
  projectId: "reelagram-81560",
  storageBucket: "reelagram-81560.firebasestorage.app",
  messagingSenderId: "836309025458",
  appId: "1:836309025458:web:058e0e811f0e995e3abfab",
  measurementId: "G-TYXN3RRC0E",
};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? defaultConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? defaultConfig.authDomain,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL ?? defaultConfig.databaseURL,
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? defaultConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? defaultConfig.storageBucket,
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? defaultConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID ?? defaultConfig.appId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? defaultConfig.measurementId,
};

// Returns true when all required keys are present.
// With the hard-coded defaults above this is always true, so the app runs
// against the real Firebase backend (not demo mode) out of the box.
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function fbAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function fbDb(): Firestore {
  if (!_db) _db = getFirestore(getFirebaseApp());
  return _db;
}

export function fbStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(getFirebaseApp());
  return _storage;
}
