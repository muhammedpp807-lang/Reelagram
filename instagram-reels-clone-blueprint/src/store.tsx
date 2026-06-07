import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Comment, Post, User } from "./types";
import { initialPosts, initialUsers } from "./data/mock";
import { isFirebaseConfigured } from "./firebase";
import * as fb from "./firebaseData";

type Route =
  | { name: "auth" }
  | { name: "home" }
  | { name: "reels"; startId?: string }
  | { name: "explore" }
  | { name: "profile"; username: string }
  | { name: "edit-profile" };

type Store = {
  mode: "firebase" | "demo";
  users: User[];
  posts: Post[];
  currentUserId: string | null;
  currentUser: User | null;
  route: Route;
  uploadOpen: boolean;
  setUploadOpen: (v: boolean) => void;
  navigate: (r: Route) => void;
  login: (identifier: string, password: string) => Promise<string | null>;
  signup: (data: { username: string; email: string; password: string; fullName: string }) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "username" | "fullName" | "bio" | "avatar">>) => Promise<string | null>;
  toggleFollow: (userId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  createPost: (data: { type: "image" | "reel"; mediaUrl: string; caption: string; thumbnail?: string; file?: File }) => Promise<void>;
  getUserByUsername: (username: string) => User | undefined;
  getUserById: (id: string) => User | undefined;
  loading: boolean;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const mode: "firebase" | "demo" = isFirebaseConfigured() ? "firebase" : "demo";

  // ---- DEMO state (kept in-memory; works without Firebase) ----
  const [demoUsers, setDemoUsers] = useState<User[]>(initialUsers);
  const [demoPosts, setDemoPosts] = useState<Post[]>(initialPosts);
  const [demoCurrentUserId, setDemoCurrentUserId] = useState<string | null>(null);

  // ---- FIREBASE state ----
  const [fbUsers, setFbUsers] = useState<User[]>([]);
  const [fbPosts, setFbPosts] = useState<Post[]>([]);
  const [fbCurrentUserId, setFbCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === "firebase");

  const [route, setRoute] = useState<Route>({ name: "auth" });
  const [uploadOpen, setUploadOpen] = useState(false);

  // ---------- FIREBASE auth + listeners ----------
  useEffect(() => {
    if (mode !== "firebase") return;
    let cancelled = false;

    // 1. Auth state
    const unsubAuth = fb.onAuth(async (fbUser) => {
      if (cancelled) return;
      if (!fbUser) {
        setFbCurrentUserId(null);
        setRoute({ name: "auth" });
        setLoading(false);
        return;
      }
      setFbCurrentUserId(fbUser.uid);
      // Ensure user doc exists
      let userDoc = await fb.getUserDoc(fbUser.uid);
      if (!userDoc) {
        const username = (fbUser.email ?? "").split("@")[0] || `user${fbUser.uid.slice(0, 5)}`;
        userDoc = await fb.createUserDoc(fbUser, { username, fullName: fbUser.displayName ?? username });
      }
      // Initial load
      try {
        const allUsers = await fb.getAllUsers(200);
        if (!cancelled) setFbUsers(allUsers);
      } catch (e) {
        console.warn("Failed to load users:", e);
      }
      if (route.name === "auth") setRoute({ name: "home" });
      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubAuth();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Live posts feed (all types)
  useEffect(() => {
    if (mode !== "firebase" || !fbCurrentUserId) return;
    const unsub = fb.subscribePosts((p) => setFbPosts(p));
    return () => unsub();
  }, [mode, fbCurrentUserId]);

  // Live users (refresh on auth changes)
  useEffect(() => {
    if (mode !== "firebase" || !fbCurrentUserId) return;
    let cancelled = false;
    (async () => {
      try {
        const all = await fb.getAllUsers(200);
        if (!cancelled) setFbUsers(all);
      } catch (e) {
        console.warn(e);
      }
    })();
    return () => { cancelled = true; };
  }, [mode, fbCurrentUserId]);

  // ---------- Computed ----------
  const users = mode === "firebase" ? fbUsers : demoUsers;
  const posts = mode === "firebase" ? fbPosts : demoPosts;
  const currentUserId = mode === "firebase" ? fbCurrentUserId : demoCurrentUserId;
  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  );
  const getUserById = useCallback((id: string) => users.find((u) => u.id === id), [users]);
  const getUserByUsername = useCallback(
    (username: string) => users.find((u) => u.username.toLowerCase() === username.toLowerCase()),
    [users],
  );

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    queueMicrotask(() => window.scrollTo({ top: 0 }));
  }, []);

  // ---------- AUTH actions ----------
  const login: Store["login"] = async (identifier, password) => {
    if (mode === "demo") {
      const u = users.find(
        (x) =>
          x.email.toLowerCase() === identifier.toLowerCase() ||
          x.username.toLowerCase() === identifier.toLowerCase(),
      );
      if (!u) return "No account matches that username or email.";
      setDemoCurrentUserId(u.id);
      navigate({ name: "home" });
      return null;
    }
    try {
      await fb.signIn(identifier.includes("@") ? identifier : `${identifier}@reelgram.app`, password);
      // The auth listener will route to home
      return null;
    } catch (e: any) {
      return prettifyAuthError(e);
    }
  };

  const signup: Store["signup"] = async ({ username, email, password, fullName }) => {
    if (mode === "demo") {
      if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) return "Username must be 3–20 chars (letters, numbers, _ or .).";
      if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) return "That username is taken.";
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return "Email already in use.";
      const id = `u${Date.now()}`;
      const newUser: User = {
        id, username, email, fullName: fullName || username, bio: "",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
        followers: [], following: [],
      };
      setDemoUsers((prev) => [...prev, newUser]);
      setDemoCurrentUserId(id);
      navigate({ name: "home" });
      return null;
    }
    try {
      const cred = await fb.signUp(email, password);
      // Username uniqueness
      if (await fb.isUsernameTaken(username)) {
        // Roll back the auth user so they don't end up in a broken state
        await fb.signOutNow();
        return "That username is taken.";
      }
      await fb.createUserDoc(cred.user, { username, fullName, bio: "" });
      if (fullName) await fb.updateAuthProfile(fullName).catch(() => {});
      return null;
    } catch (e: any) {
      return prettifyAuthError(e);
    }
  };

  const logout: Store["logout"] = async () => {
    if (mode === "demo") {
      setDemoCurrentUserId(null);
      navigate({ name: "auth" });
      return;
    }
    await fb.signOutNow();
    setRoute({ name: "auth" });
  };

  const updateProfile: Store["updateProfile"] = async (patch) => {
    if (!currentUser) return "Not logged in.";
    if (patch.username && patch.username !== currentUser.username) {
      if (!/^[a-zA-Z0-9_.]{3,20}$/.test(patch.username)) return "Invalid username.";
      if (mode === "demo") {
        if (users.some((u) => u.id !== currentUser.id && u.username.toLowerCase() === patch.username!.toLowerCase()))
          return "That username is taken.";
      } else {
        if (await fb.isUsernameTaken(patch.username)) return "That username is taken.";
      }
    }
    if (mode === "demo") {
      setDemoUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...patch } : u)));
      return null;
    }
    try {
      await fb.updateUserDoc(currentUser.id, patch);
      // Refresh current user in local state
      setFbUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...patch } : u)));
      if (patch.fullName) await fb.updateAuthProfile(patch.fullName).catch(() => {});
      return null;
    } catch (e: any) {
      return e?.message ?? "Failed to update profile.";
    }
  };

  const toggleFollow: Store["toggleFollow"] = async (userId) => {
    if (!currentUser || userId === currentUser.id) return;
    const isFollowing = currentUser.following.includes(userId);
    if (mode === "demo") {
      setDemoUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentUser.id) {
            return { ...u, following: isFollowing ? u.following.filter((x) => x !== userId) : [...u.following, userId] };
          }
          if (u.id === userId) {
            return { ...u, followers: isFollowing ? u.followers.filter((x) => x !== currentUser.id) : [...u.followers, currentUser.id] };
          }
          return u;
        }),
      );
      return;
    }
    try {
      if (isFollowing) await fb.unfollowUser(currentUser.id, userId);
      else await fb.followUser(currentUser.id, userId);
      // Refresh users
      const all = await fb.getAllUsers(200);
      setFbUsers(all);
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleLike: Store["toggleLike"] = async (postId) => {
    if (!currentUser) return;
    if (mode === "demo") {
      setDemoPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const liked = p.likes.includes(currentUser.id);
          return { ...p, likes: liked ? p.likes.filter((x) => x !== currentUser.id) : [...p.likes, currentUser.id] };
        }),
      );
      return;
    }
    const post = posts.find((p) => p.id === postId);
    const liked = post?.likes.includes(currentUser.id) ?? false;
    try {
      if (liked) await fb.unlikePost(currentUser.id, postId);
      else await fb.likePost(currentUser.id, postId);
      // Optimistic UI
      setFbPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes: liked ? p.likes.filter((x) => x !== currentUser.id) : [...p.likes, currentUser.id] }
            : p,
        ),
      );
    } catch (e) {
      console.warn(e);
    }
  };

  const addComment: Store["addComment"] = async (postId, text) => {
    if (!currentUser || !text.trim()) return;
    const trimmed = text.trim();
    if (mode === "demo") {
      const c: Comment = { id: `c${Date.now()}`, userId: currentUser.id, text: trimmed, createdAt: Date.now() };
      setDemoPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, c] } : p)));
      return;
    }
    try {
      await fb.addComment(postId, currentUser.id, trimmed);
    } catch (e) {
      console.warn(e);
    }
  };

  const createPost: Store["createPost"] = async ({ type, mediaUrl, caption, thumbnail, file }) => {
    if (!currentUser) return;
    if (mode === "demo") {
      const post: Post = {
        id: `p${Date.now()}`,
        userId: currentUser.id,
        type,
        mediaUrl,
        thumbnail,
        caption,
        audio: type === "reel" ? `${currentUser.username} · Original audio` : undefined,
        views: type === "reel" ? 0 : undefined,
        likes: [], comments: [], createdAt: Date.now(),
      };
      setDemoPosts((prev) => [post, ...prev]);
      return;
    }
    try {
      let finalUrl = mediaUrl;
      let finalThumb: string | undefined = thumbnail;
      if (file) {
        const ext = (file.name.split(".").pop() || (type === "reel" ? "mp4" : "jpg")).toLowerCase();
        const path = `posts/${currentUser.id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        finalUrl = await fb.uploadFile(path, file);
        // For images, use the same URL as the thumbnail.
        if (type === "image" && !finalThumb) finalThumb = finalUrl;
      }
      await fb.createPost({
        userId: currentUser.id,
        type,
        mediaUrl: finalUrl,
        thumbnail: finalThumb,
        caption,
        audio: type === "reel" ? `${currentUser.username} · Original audio` : undefined,
        views: type === "reel" ? 0 : undefined,
        likes: [],
        comments: [],
        createdAt: Date.now(),
      });
    } catch (e: any) {
      console.warn("Upload failed:", e);
    }
  };

  const value: Store = {
    mode, users, posts, currentUserId, currentUser, route, uploadOpen,
    setUploadOpen, navigate, login, signup, logout, updateProfile,
    toggleFollow, toggleLike, addComment, createPost,
    getUserByUsername, getUserById, loading,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function prettifyAuthError(e: any): string {
  const code = e?.code as string | undefined;
  switch (code) {
    case "auth/invalid-email": return "That email address isn't valid.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password": return "Wrong username/email or password.";
    case "auth/email-already-in-use": return "That email is already registered.";
    case "auth/weak-password": return "Password should be at least 6 characters.";
    case "auth/too-many-requests": return "Too many attempts. Please try again later.";
    case "auth/network-request-failed": return "Network error. Check your connection.";
    default: return e?.message ?? "Authentication failed.";
  }
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  return `${w}w`;
}
