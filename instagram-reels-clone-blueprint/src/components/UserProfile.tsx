import { useMemo, useState } from "react";
import { formatCount, useStore } from "../store";
import type { Post } from "../types";
import { GridIcon, ReelsIcon, PlayIcon, HeartIcon, CommentIcon, VerifiedIcon } from "./Icons";

export function UserProfile({ username }: { username: string }) {
  const { getUserByUsername, currentUser, posts, navigate, toggleFollow } = useStore();
  const user = getUserByUsername(username);
  const [tab, setTab] = useState<"posts" | "reels">("posts");

  const userPosts = useMemo(
    () => posts.filter((p) => p.userId === user?.id).sort((a, b) => b.createdAt - a.createdAt),
    [posts, user?.id],
  );
  const images = userPosts.filter((p) => p.type === "image");
  const reels = userPosts.filter((p) => p.type === "reel");
  const totalCount = userPosts.length;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-zinc-400">
        <p>User not found.</p>
        <button onClick={() => navigate({ name: "home" })} className="mt-3 text-blue-400">Go home</button>
      </div>
    );
  }

  const isMe = currentUser?.id === user.id;
  const isFollowing = currentUser?.following.includes(user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6 pb-24 text-white">
      {/* Header */}
      <div className="flex items-start gap-6 md:gap-16">
        <img
          src={user.avatar}
          alt=""
          className="w-20 h-20 md:w-36 md:h-36 rounded-full ring-2 ring-zinc-800 object-cover bg-zinc-900"
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl flex items-center gap-1.5">
              {user.username}
              {user.verified && <VerifiedIcon className="w-4 h-4" />}
            </h1>

            {isMe ? (
              <>
                <button
                  onClick={() => navigate({ name: "edit-profile" })}
                  className="text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 transition px-3 py-1.5 rounded-md"
                >
                  Edit profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`text-sm font-semibold px-4 py-1.5 rounded-md transition ${
                    isFollowing
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button className="text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded-md">
                  Message
                </button>
              </>
            )}
          </div>

          {/* Counts — desktop */}
          <div className="hidden md:flex items-center gap-8 mt-5 text-sm">
            <Count label="posts" value={totalCount} />
            <Count label="followers" value={user.followers.length} />
            <Count label="following" value={user.following.length} />
          </div>

          {/* Bio — desktop */}
          <div className="hidden md:block mt-5 text-sm">
            <p className="font-semibold">{user.fullName}</p>
            <p className="whitespace-pre-line text-zinc-300">{user.bio}</p>
          </div>
        </div>
      </div>

      {/* Bio — mobile */}
      <div className="md:hidden mt-4 text-sm">
        <p className="font-semibold">{user.fullName}</p>
        <p className="whitespace-pre-line text-zinc-300">{user.bio}</p>
      </div>

      {/* Counts — mobile (bar) */}
      <div className="md:hidden mt-5 grid grid-cols-3 border-y border-zinc-900 py-3 text-center text-sm">
        <CountMobile label="posts" value={totalCount} />
        <CountMobile label="followers" value={user.followers.length} />
        <CountMobile label="following" value={user.following.length} />
      </div>

      {/* Tabs */}
      <div className="mt-6 md:mt-10 border-t border-zinc-900 flex items-center justify-center gap-12 text-xs tracking-widest uppercase text-zinc-500">
        <TabBtn active={tab === "posts"} onClick={() => setTab("posts")}>
          <GridIcon className="w-4 h-4" /> Posts
        </TabBtn>
        <TabBtn active={tab === "reels"} onClick={() => setTab("reels")}>
          <ReelsIcon className="w-4 h-4" /> Reels
        </TabBtn>
      </div>

      {/* Grid */}
      <div className="mt-2">
        {tab === "posts" ? (
          images.length ? (
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {images.map((p) => (
                <ImageTile key={p.id} post={p} />
              ))}
            </div>
          ) : (
            <EmptyTab label="No posts yet" />
          )
        ) : reels.length ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {reels.map((p) => (
              <ReelTile key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <EmptyTab label="No reels yet" />
        )}
      </div>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <span><span className="font-semibold">{formatCount(value)}</span> <span className="text-zinc-400">{label}</span></span>
  );
}
function CountMobile({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-semibold">{formatCount(value)}</div>
      <div className="text-zinc-400 text-xs">{label}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-3 -mt-px border-t-2 ${active ? "border-white text-white" : "border-transparent"}`}
    >
      {children}
    </button>
  );
}

function EmptyTab({ label }: { label: string }) {
  return <div className="py-16 text-center text-zinc-500 text-sm">{label}</div>;
}

function ImageTile({ post }: { post: Post }) {
  return (
    <div className="relative aspect-square overflow-hidden bg-zinc-900 group cursor-pointer">
      <img src={post.mediaUrl} alt="" className="w-full h-full object-cover transition group-hover:scale-105" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-5 text-white text-sm font-semibold">
        <span className="flex items-center gap-1.5"><HeartIcon filled className="w-5 h-5" /> {formatCount(post.likes.length)}</span>
        <span className="flex items-center gap-1.5"><CommentIcon className="w-5 h-5" /> {formatCount(post.comments.length)}</span>
      </div>
    </div>
  );
}

function ReelTile({ post }: { post: Post }) {
  const { navigate } = useStore();
  return (
    <button
      onClick={() => navigate({ name: "reels", startId: post.id })}
      className="relative aspect-[9/16] overflow-hidden bg-zinc-900 group"
    >
      <img src={post.thumbnail ?? post.mediaUrl} alt="" className="w-full h-full object-cover transition group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute top-2 right-2 text-white"><ReelsIcon className="w-4 h-4" /></div>
      <div className="absolute bottom-2 left-2 text-white text-xs font-semibold flex items-center gap-1">
        <PlayIcon className="w-3.5 h-3.5" /> {formatCount(post.views ?? 0)}
      </div>
    </button>
  );
}
