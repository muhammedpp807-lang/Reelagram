# Reelgram — Firebase backend

A mobile-first Instagram-style Reels clone (React + Vite + Tailwind) with a **Firebase backend**: Auth, Firestore, and Storage.

The Firebase project (`reelagram-81560`) is already wired up in `src/firebase.ts`,
so you can just `npm install && npm run dev` and the app will read/write real
data. The legacy demo-mode fallback still kicks in only if the config is removed.

---

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and sign up with any email + password — a new user
will be created in Firebase Auth and a matching `users/{uid}` doc in Firestore.

---

## 🔥 Using a different Firebase project

The config is hard-coded in `src/firebase.ts` (and mirrored in `firebase.js`).
You can either edit those files directly, or override at build time with Vite
env vars in `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-app-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Before going live, make sure you have:

1. **Authentication → Sign-in method → Email/Password** enabled.
2. A **Firestore Database** created.
3. **Storage** enabled.

### Deploy security rules

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
