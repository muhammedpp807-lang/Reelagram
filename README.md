# Reelgram — Firebase backend

A mobile-first Instagram-style Reels clone (React + Vite + Tailwind) with a **Firebase backend**: Auth, Firestore, and Storage.

The app automatically detects whether Firebase is configured. If it isn't, it falls back to a fully working **demo mode** that uses in-memory mock data, so you can preview the UI before setting up Firebase.

---

## 🚀 Quick start (demo mode, no setup)

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` in **demo mode** — log in with `you` / `password`.

---

## 🔥 Connect to Firebase

### 1. Create a Firebase project

1. Go to https://console.firebase.google.com/ and create a new project.
2. **Enable Authentication → Sign-in method → Email/Password.**
3. **Create a Firestore Database** (production mode).
4. **Enable Storage.**

### 2. Add a Web app

In Project Settings → Your apps → click the `</>` icon to add a Web app. Copy the config object.

### 3. Add your config

```bash
cp .env.example .env.local
```

Paste the values from step 2 into `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Deploy security rules

```bash
# Install Firebase CLI
npm i -g firebase-tools
firebase login
firebase init   # select Firestore + Storage, use the existing project

firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

Or just paste the contents of `firestore.rules` and `storage.rules` into the Firebase Console.

### 5. Run

```bash
npm run dev
```

You'll see the demo banner disappear and a real email/password signup will create the user in Firebase Auth + a `users` document in Firestore.

---

## 🗂️ Data model (Firestore)

```
users/{uid}                    { username, email, fullName, bio, avatar, followers[], following[], createdAt }
posts/{postId}                 { userId, type, mediaUrl, thumbnailUrl, caption, audio, views, likes[], comments[], createdAt }
posts/{postId}/comments/{cid}  { userId, text, createdAt }
follows/{followerId_followeeId}{ followerId, followeeId, createdAt }
likes/{userId_postId}          { userId, postId, createdAt }
```

- `followers` and `following` on the user doc are **denormalized arrays** for fast reads in the feed and profile.
- `likes[]` on each post is denormalized for O(1) "did the current user like this?" checks.
- All denormalized updates happen in the same write as the source-of-truth record (see `src/firebaseData.ts`).

## 📦 Storage layout

```
avatars/{uid}/{filename}        # max 5 MB, image/*
posts/{uid}/{filename}          # max 100 MB, image/* or video/*
```

---

## 🧠 Architecture

- `src/firebase.ts` — initializes Firebase from `VITE_FIREBASE_*` env vars
- `src/firebaseData.ts` — typed Firestore + Storage helpers (the "data access layer")
- `src/store.tsx` — React Context that wires UI to the data layer; works in both **firebase** and **demo** modes
- `src/components/*` — UI components unchanged from the original

The store exposes the same shape as before (`login`, `signup`, `toggleLike`, etc.) — but the implementations now call Firebase when configured. Components are unaware of the switch.

## 🔁 Feed query (in Firestore)

```ts
// Home feed: posts from people you follow
query(
  collection(db, "posts"),
  where("userId", "in", currentUser.following),
  orderBy("createdAt", "desc"),
  limit(50)
)
```

`src/firebaseData.ts` exposes `subscribePosts(cb, { followedBy: [...] })` for real-time updates.

---

## 🛡️ Security highlights

- Users can only create their own user doc
- Posts can only be created/deleted by the owner
- Comments require sign-in; can be deleted by the author or the post owner
- Likes/follows can only be created with `request.auth.uid`
- Storage: avatars limited to 5 MB, posts to 100 MB, owned by `request.auth.uid`

See `firestore.rules` and `storage.rules` for full details.
