import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Comment, Post, User } from "./types";
import { initialPosts, initialUsers } from "./data/mock";

type Route =
  | { name: "auth" }
  | { name: "home" }
  | { name: "reels"; startId?: string }
  | { name: "explore" }
  | { name: "profile"; username: string }
  | { name: "edit-profile" };

type Store = {
  users: User[];
  posts: Post[];
  currentUserId: string | null;
  currentUser: User | null;
  route: Route;
  uploadOpen: boolean;
  setUploadOpen: (v: boolean) => void;
  navigate: (r: Route) => void;
  login: (identifier: string, password: string) => string | null;
  signup: (data: { username: string; email: string; password: string; fullName: string }) => string | null;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "username" | "fullName" | "bio" | "avatar">>) => string | null;
  toggleFollow: (userId: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  createPost: (data: { type: "image" | "reel"; mediaUrl: string; caption: string; thumbnail?: string }) => void;
  getUserByUsername: (username: string) => User | undefined;
  getUserById: (id: string) => User | undefined;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [route, setRoute] = useState<Route>({ name: "auth" });
  const [uploadOpen, setUploadOpen] = useState(false);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  );

  const getUserByUsername = useCallback(
    (username: string) => users.find((u) => u.username.toLowerCase() === username.toLowerCase()),
    [users],
  );
  const getUserById = useCallback((id: string) => users.find((u) => u.id === id), [users]);

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    // Scroll containers reset
    queueMicrotask(() => window.scrollTo({ top: 0 }));
  }, []);

  const login: Store["login"] = (identifier) => {
    const u = users.find(
      (x) =>
        x.email.toLowerCase() === identifier.toLowerCase() ||
        x.username.toLowerCase() === identifier.toLowerCase(),
    );
    if (!u) return "No account matches that username or email.";
    setCurrentUserId(u.id);
    navigate({ name: "home" });
    return null;
  };

  const signup: Store["signup"] = ({ username, email, fullName }) => {
    if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username))
      return "Username must be 3–20 chars (letters, numbers, _ or .).";
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
      return "That username is taken.";
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
      return "Email already in use.";
    const id = `u${Date.now()}`;
    const newUser: User = {
      id,
      username,
      email,
      fullName: fullName || username,
      bio: "",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
      followers: [],
      following: [],
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(id);
    navigate({ name: "home" });
    return null;
  };

  const logout = () => {
    setCurrentUserId(null);
    navigate({ name: "auth" });
  };

  const updateProfile: Store["updateProfile"] = (patch) => {
    if (!currentUser) return "Not logged in.";
    if (patch.username && patch.username !== currentUser.username) {
      if (!/^[a-zA-Z0-9_.]{3,20}$/.test(patch.username))
        return "Invalid username.";
      if (users.some((u) => u.id !== currentUser.id && u.username.toLowerCase() === patch.username!.toLowerCase()))
        return "That username is taken.";
    }
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...patch } : u)));
    return null;
  };

  const toggleFollow = (userId: string) => {
    if (!currentUser || userId === currentUser.id) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const isFollowing = u.following.includes(userId);
          return {
            ...u,
            following: isFollowing ? u.following.filter((x) => x !== userId) : [...u.following, userId],
          };
        }
        if (u.id === userId) {
          const isFollower = u.followers.includes(currentUser.id);
          return {
            ...u,
            followers: isFollower
              ? u.followers.filter((x) => x !== currentUser.id)
              : [...u.followers, currentUser.id],
          };
        }
        return u;
      }),
    );
  };

  const toggleLike = (postId: string) => {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likes.includes(currentUser.id);
        return { ...p, likes: liked ? p.likes.filter((x) => x !== currentUser.id) : [...p.likes, currentUser.id] };
      }),
    );
  };

  const addComment = (postId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const c: Comment = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      text: text.trim(),
      createdAt: Date.now(),
    };
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, c] } : p)));
  };

  const createPost: Store["createPost"] = ({ type, mediaUrl, caption, thumbnail }) => {
    if (!currentUser) return;
    const post: Post = {
      id: `p${Date.now()}`,
      userId: currentUser.id,
      type,
      mediaUrl,
      thumbnail,
      caption,
      audio: type === "reel" ? `${currentUser.username} · Original audio` : undefined,
      views: type === "reel" ? 0 : undefined,
      likes: [],
      comments: [],
      createdAt: Date.now(),
    };
    setPosts((prev) => [post, ...prev]);
  };

  const value: Store = {
    users,
    posts,
    currentUserId,
    currentUser,
    route,
    uploadOpen,
    setUploadOpen,
    navigate,
    login,
    signup,
    logout,
    updateProfile,
    toggleFollow,
    toggleLike,
    addComment,
    createPost,
    getUserByUsername,
    getUserById,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
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
