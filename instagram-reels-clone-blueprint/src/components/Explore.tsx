import { useMemo, useState } from "react";
import { formatCount, useStore } from "../store";
import { SearchIcon, HeartIcon, CommentIcon, ReelsIcon, PlayIcon } from "./Icons";

export function Explore() {
  const { posts, users, navigate } = useStore();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return null;
    const t = q.trim().toLowerCase();
    return users.filter(
      (u) => u.username.toLowerCase().includes(t) || u.fullName.toLowerCase().includes(t),
    );
  }, [users, q]);

  // Mix images and reels with a "varied" pattern
  const tiles = useMemo(() => {
    return [...posts].sort((a, b) => (b.likes.length + (b.views ?? 0) / 1000) - (a.likes.length + (a.views ?? 0) / 1000));
  }, [posts]);

  return (
    <div className="max-w-5xl mx-auto px-2 md:px-6 pt-4 pb-24 text-white">
      <div className="relative mb-4 px-2">
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none"
        />
      </div>

      {filtered ? (
        <div className="divide-y divide-zinc-900">
          {filtered.length === 0 && <p className="text-center text-zinc-500 py-10 text-sm">No users found.</p>}
          {filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => navigate({ name: "profile", username: u.username })}
              className="w-full flex items-center gap-3 py-3 px-2 hover:bg-zinc-950 text-left"
            >
              <img src={u.avatar} alt="" className="w-12 h-12 rounded-full" />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{u.username}</div>
                <div className="text-xs text-zinc-400 truncate">{u.fullName}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-1.5">
          {tiles.map((p, i) => {
            // Make every 7th item a tall/highlighted reel
            const featured = p.type === "reel" && i % 7 === 3;
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (p.type === "reel") navigate({ name: "reels", startId: p.id });
                }}
                className={`relative bg-zinc-900 overflow-hidden group ${
                  featured ? "row-span-2 aspect-[9/16]" : "aspect-square"
                }`}
              >
                <img
                  src={p.type === "reel" ? (p.thumbnail ?? p.mediaUrl) : p.mediaUrl}
                  alt=""
                  className="w-full h-full object-cover transition group-hover:scale-105"
                />
                {p.type === "reel" && (
                  <>
                    <div className="absolute top-1.5 right-1.5 text-white drop-shadow"><ReelsIcon className="w-4 h-4" /></div>
                    <div className="absolute bottom-1.5 left-1.5 text-white text-xs font-semibold flex items-center gap-1 drop-shadow">
                      <PlayIcon className="w-3.5 h-3.5" /> {formatCount(p.views ?? 0)}
                    </div>
                  </>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white text-xs font-semibold">
                  <span className="flex items-center gap-1"><HeartIcon filled className="w-4 h-4" /> {formatCount(p.likes.length)}</span>
                  <span className="flex items-center gap-1"><CommentIcon className="w-4 h-4" /> {formatCount(p.comments.length)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
