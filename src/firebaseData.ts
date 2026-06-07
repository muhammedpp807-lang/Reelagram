// Typed Firestore + Storage helpers. All reads/writes go through these functions
// so components can stay UI-focused.

import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, onSnapshot,
  arrayUnion, arrayRemove, increment, type QueryConstraint,
} from "firebase/firestore";
import {
  ref as storageRef, getDownloadURL, deleteObject,
} from "firebase/storage";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile as fbUpdateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { fbAuth, fbDb, fbStorage } from "./firebase";
import type { User, Post, Comment } from "./types";

// ---------- USERS ----------

const USERS = "users";

export async function createUserDoc(fbUser: FirebaseUser, extra: {
  username: string; fullName: string; bio?: string; avatar?: string;
}) {
  const userData: User = {
    id: fbUser.uid,
    username: extra.username,
    email: fbUser.email ?? "",
    fullName: extra.fullName,
    bio: extra.bio ?? "",
    avatar: extra.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(extra.username)}`,
    followers: [],
    following: [],
  };
  const { id, ...rest } = userData;
  await setDoc(doc(fbDb(), USERS, fbUser.uid), {
    ...rest,
    createdAt: serverTimestamp(),
  });
  return userData;
}

export async function getUserDoc(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(fbDb(), USERS, uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const q = query(collection(fbDb(), USERS), where("username", "==", username), limit(1));
  const res = await getDocs(q);
  if (res.empty) return null;
  return res.docs[0].data() as User;
}

export async function getUsersByIds(ids: string[]): Promise<User[]> {
  if (!ids.length) return [];
  // Firestore `in` supports up to 10 ids per query; chunk for safety.
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
  const out: User[] = [];
  for (const c of chunks) {
    const q = query(collection(fbDb(), USERS), where("__name__", "in", c));
    const snap = await getDocs(q);
    snap.forEach((d) => out.push(d.data() as User));
  }
  return out;
}

export async function getAllUsers(limitN = 200): Promise<User[]> {
  const q = query(collection(fbDb(), USERS), orderBy("createdAt", "desc"), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as User);
}

export async function updateUserDoc(uid: string, patch: Partial<User>) {
  await updateDoc(doc(fbDb(), USERS, uid), patch);
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const u = await getUserByUsername(username);
  return !!u;
}

// ---------- FOLLOWS ----------

const FOLLOWS = "follows";
// doc id = `${followerId}_${followeeId}` for easy uniqueness

export async function followUser(followerId: string, followeeId: string) {
  const id = `${followerId}_${followeeId}`;
  await setDoc(doc(fbDb(), FOLLOWS, id), {
    followerId, followeeId, createdAt: serverTimestamp(),
  });
  // denormalized counts on user doc
  await updateDoc(doc(fbDb(), USERS, followerId), { following: arrayUnion(followeeId) });
  await updateDoc(doc(fbDb(), USERS, followeeId), { followers: arrayUnion(followerId) });
}

export async function unfollowUser(followerId: string, followeeId: string) {
  const id = `${followerId}_${followeeId}`;
  await deleteDoc(doc(fbDb(), FOLLOWS, id));
  await updateDoc(doc(fbDb(), USERS, followerId), { following: arrayRemove(followeeId) });
  await updateDoc(doc(fbDb(), USERS, followeeId), { followers: arrayRemove(followerId) });
}

// ---------- POSTS ----------

const POSTS = "posts";

export async function createPost(post: Omit<Post, "id">): Promise<string> {
  const ref = await addDoc(collection(fbDb(), POSTS), {
    ...post,
    createdAt: Date.now(), // store as number for easy sort + offline
    // serverTimestamp() also works, but number keeps `timeAgo` simple
  });
  return ref.id;
}

export async function getPost(postId: string): Promise<Post | null> {
  const snap = await getDoc(doc(fbDb(), POSTS, postId));
  if (!snap.exists()) return null;
  const { id: _ignored, ...rest } = snap.data() as Post;
  return { id: snap.id, ...rest };
}

export async function getPosts(
  filters: { type?: "image" | "reel"; userId?: string; followedBy?: string[]; pageSize?: number } = {},
): Promise<Post[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc"), limit(filters.pageSize ?? 50)];
  if (filters.type) constraints.unshift(where("type", "==", filters.type));
  if (filters.userId) constraints.unshift(where("userId", "==", filters.userId));
  if (filters.followedBy && filters.followedBy.length) {
    // Firestore `in` supports up to 10; chunk if needed
    constraints.unshift(where("userId", "in", filters.followedBy.slice(0, 10)));
  }
  const q = query(collection(fbDb(), POSTS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const { id: _ignored, ...rest } = d.data() as Post;
    return { id: d.id, ...rest };
  });
}

// Live subscription: keeps posts in sync.
export function subscribePosts(
  cb: (posts: Post[]) => void,
  filters: { type?: "image" | "reel"; userId?: string; followedBy?: string[] } = {},
): () => void {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc"), limit(50)];
  if (filters.type) constraints.unshift(where("type", "==", filters.type));
  if (filters.userId) constraints.unshift(where("userId", "==", filters.userId));
  if (filters.followedBy && filters.followedBy.length) {
    constraints.unshift(where("userId", "in", filters.followedBy.slice(0, 10)));
  }
  const q = query(collection(fbDb(), POSTS), ...constraints);
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => {
      const { id: _ignored, ...rest } = d.data() as Post;
      return { id: d.id, ...rest };
    }));
  });
}

// ---------- LIKES ----------

const LIKES = "likes"; // doc id = `${userId}_${postId}`

export async function likePost(userId: string, postId: string) {
  await setDoc(doc(fbDb(), LIKES, `${userId}_${postId}`), {
    userId, postId, createdAt: serverTimestamp(),
  });
  await updateDoc(doc(fbDb(), POSTS, postId), {
    likes: arrayUnion(userId),
  });
}

export async function unlikePost(userId: string, postId: string) {
  await deleteDoc(doc(fbDb(), LIKES, `${userId}_${postId}`));
  await updateDoc(doc(fbDb(), POSTS, postId), {
    likes: arrayRemove(userId),
  });
}

// ---------- COMMENTS ----------

const COMMENTS = "comments";

export async function addComment(postId: string, userId: string, text: string): Promise<Comment> {
  const data = { postId, userId, text, createdAt: Date.now() };
  const ref = await addDoc(collection(fbDb(), COMMENTS, postId, "list"), data);
  return { id: ref.id, ...data };
}

export function subscribeComments(postId: string, cb: (c: Comment[]) => void): () => void {
  const q = query(
    collection(fbDb(), COMMENTS, postId, "list"),
    orderBy("createdAt", "asc"),
    limit(200),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => {
      const { id: _ignored, ...rest } = d.data() as Comment;
      return { id: d.id, ...rest };
    }));
  });
}

// ---------- VIEWS (for reels) ----------

export async function incrementViews(postId: string) {
  await updateDoc(doc(fbDb(), POSTS, postId), { views: increment(1) });
}

// ---------- STORAGE ----------

export async function uploadFile(
  path: string,         // e.g. `posts/${uid}/${uuid}.mp4`
  file: Blob,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const ref = storageRef(fbStorage(), path);
  // uploadBytesResumable gives progress; uploadBytes is simpler but no progress.
  const { uploadBytesResumable } = await import("firebase/storage");
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref, file);
    task.on(
      "state_changed",
      (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      (err) => reject(err),
      async () => resolve(await getDownloadURL(task.snapshot.ref)),
    );
  });
}

export async function deleteFile(url: string) {
  try {
    const ref = storageRef(fbStorage(), url);
    await deleteObject(ref);
  } catch {
    /* ignore (e.g. file already removed) */
  }
}

// ---------- AUTH ----------

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(fbAuth(), email, password);
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(fbAuth(), email, password);
}

export async function signOutNow() {
  return signOut(fbAuth());
}

export async function updateAuthProfile(displayName?: string, photoURL?: string) {
  return fbUpdateProfile(fbAuth().currentUser!, { displayName, photoURL });
}

export function onAuth(cb: (u: FirebaseUser | null) => void) {
  return onAuthStateChanged(fbAuth(), cb);
}
