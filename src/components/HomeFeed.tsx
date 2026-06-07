import { useMemo, useState } from "react";
import { formatCount, timeAgo, useStore } from "../store";
import type { Post } from "../types";
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, MoreIcon, VerifiedIcon, PlayIcon, ReelsIcon } from "./Icons";

export function HomeFeed() {
  const { currentUser, posts, users, getUserById, navigate } = useStore();

  const feed = useMemo(() => {
    if (!currentUser) return [];
    const followed = new Set([...currentUser.following, currentUser.id]);
    return posts
      .filter((p) => followed.has(p.userId))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, currentUser]);

  const stories = useMemo(() => {
    if (!currentUser) return [];
    return [currentUser, ...currentUser.following.map((id) => getUserById(id)!).filter(Boolean)];
  }, [currentUser, getUserById]);

  const suggestions = useMemo(() => {
    if (!currentUser) return [];
    return users
      .filter((u) => u.id !== currentUser.id && !currentUser.following.includes(u.id))
      .slice(0, 5);
  }, [users, currentUser]);

  if (!currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto pt-4 pb-24 md:py-6 px-0 md:px-6 flex gap-10">
      <div className="flex-1 max-w-[470px] mx-auto md:mx-0">
        {/* Stories */}
        <div className="border-b border-zinc-900 md:border md:rounded-xl py-3 px-2 mb-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-4">
            {stories.map((u) => (
              <button
                key={u.id}
                onClick={() => navigate({ name: "profile", username: u.username })}
                className="flex flex-col items-center gap-1 shrink-0 w-16"
              >
                <span className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                  <span className="block p-[2px] bg-black rounded-full">
                    <img src={u.avatar} alt="" className="w-14 h-14 rounded-full object-cover bg-zinc-800" />
                  </span>
                </span>
                <span className="text-[11px] truncate w-full text-center text-zinc-300">
                  {u.id === currentUser.id ? "Your story" : u.username}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {feed.length === 0 && (
            <div className="text-center text-zinc-400 py-12">
              Follow people to see their posts here. Try <button className="text-blue-400" onClick={() => navigate({ name: "explore" })}>Explore</button>.
            </div>
          )}
          {feed.map((post) => <FeedCard key={post.id} post={post} />)}
        </div>
      </div>

      {/* Right rail */}
      <aside className="hidden lg:block w-80 shrink-0">
        <div className="flex items-center gap-3 mb-5">
          <img src={currentUser.avatar} alt="" className="w-14 h-14 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{currentUser.username}</div>
            <div className="text-xs text-zinc-400 truncate">{currentUser.fullName}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-zinc-400 font-semibold">Suggested for you</span>
          <button className="text-xs text-white">See all</button>
        </div>

        <div className="space-y-3">
          {suggestions.map((u) => <Suggestion key={u.id} userId={u.id} />)}
        </div>

        <p className="text-[11px] text-zinc-600 mt-8 leading-relaxed">
          About · Help · API · Privacy · Terms · Locations · Language<br />
          © {new Date().getFullYear()} REELGRAM FROM EXAMPLE
        </p>
      </aside>
    </div>
  );
}

function Suggestion({ userId }: { userId: string }) {
  const { getUserById, toggleFollow, currentUser, navigate } = useStore();
  const u = getUserById(userId);
  if (!u || !currentUser) return null;
  const following = currentUser.following.includes(u.id);
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => navigate({ name: "profile", username: u.username })}>
        <img src={u.avatar} alt="" className="w-9 h-9 rounded-full" />
      </button>
      <div className="flex-1 min-w-0">
        <button onClick={() => navigate({ name: "profile", username: u.username })} className="block text-sm font-semibold truncate">
          {u.username}
        </button>
        <div className="text-xs text-zinc-500 truncate">Suggested for you</div>
      </div>
      <button
        onClick={() => toggleFollow(u.id)}
        className={`text-xs font-semibold ${following ? "text-white" : "text-blue-400"}`}
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}

function FeedCard({ post }: { post: Post }) {
  const { getUserById, currentUser, toggleLike, addComment, navigate } = useStore();
  const author = getUserById(post.userId);
  const liked = !!currentUser && post.likes.includes(currentUser.id);
  const [pop, setPop] = useState(false);
  const [text, setText] = useState("");
  const [dblTap, setDblTap] = useState(false);
  const lastTap = { current: 0 } as { current: number };

  const onTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (!liked) toggleLike(post.id);
      setDblTap(true);
      setTimeout(() => setDblTap(false), 700);
    }
    lastTap.current = now;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(post.id, text);
    setText("");
  };

  return (
    <article className="md:border md:border-zinc-900 md:rounded-xl overflow-hidden bg-black">
      <header className="flex items-center gap-3 px-3 py-3">
        <button onClick={() => author && navigate({ name: "profile", username: author.username })}>
          <img src={author?.avatar} alt="" className="w-8 h-8 rounded-full" />
        </button>
        <button
          onClick={() => author && navigate({ name: "profile", username: author.username })}
          className="flex items-center gap-1 text-sm font-semibold"
        >
          {author?.username}
          {author?.verified && <VerifiedIcon className="w-3.5 h-3.5" />}
        </button>
        <span className="text-zinc-500 text-sm">· {timeAgo(post.createdAt)}</span>
        <button className="ml-auto"><MoreIcon className="w-5 h-5" /></button>
      </header>

      <div className="relative bg-black select-none" onClick={onTap}>
        {post.type === "image" ? (
          <img src={post.mediaUrl} alt="" className="w-full max-h-[600px] object-cover" />
        ) : (
          <div
            className="relative cursor-pointer"
            onClick={(e) => { e.stopPropagation(); navigate({ name: "reels", startId: post.id }); }}
          >
            <img src={post.thumbnail ?? post.mediaUrl} alt="" className="w-full aspect-[4/5] object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-4"><PlayIcon className="w-8 h-8 text-white" /></div>
            </div>
            <div className="absolute top-3 right-3 bg-black/50 rounded-md px-2 py-1 text-xs flex items-center gap-1 text-white">
              <ReelsIcon className="w-3.5 h-3.5" /> Reel
            </div>
          </div>
        )}
        {dblTap && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <HeartIcon filled className="w-24 h-24 text-white drop-shadow-2xl animate-[heartPop_0.7s_ease-out]" />
          </div>
        )}
      </div>

      <div className="px-3 pt-2">
        <div className="flex items-center gap-3 -ml-1">
          <button
            onClick={() => { toggleLike(post.id); setPop(true); setTimeout(() => setPop(false), 300); }}
            aria-label="Like"
          >
            <HeartIcon
              filled={liked}
              className={`w-7 h-7 transition-transform ${liked ? "text-rose-500" : "text-white"} ${pop ? "scale-125" : "scale-100"}`}
            />
          </button>
          <button aria-label="Comment"><CommentIcon className="w-7 h-7" /></button>
          <button aria-label="Share"><ShareIcon className="w-7 h-7" /></button>
          <button aria-label="Save" className="ml-auto"><BookmarkIcon className="w-7 h-7" /></button>
        </div>

        <p className="text-sm font-semibold mt-2">{formatCount(post.likes.length)} likes</p>
        {post.caption && (
          <p className="text-sm mt-1">
            <span className="font-semibold mr-1.5">{author?.username}</span>{post.caption}
          </p>
        )}
        {post.comments.length > 0 && (
          <button className="block text-sm text-zinc-500 mt-1">View all {post.comments.length} comments</button>
        )}
        <p className="text-[11px] text-zinc-500 uppercase mt-1">{timeAgo(post.createdAt)} ago</p>
      </div>

      <form onSubmit={submit} className="px-3 py-3 border-t border-zinc-900 mt-2 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-zinc-500"
        />
        <button type="submit" disabled={!text.trim()} className="text-sm font-semibold text-blue-400 disabled:opacity-40">
          Post
        </button>
      </form>
    </article>
  );
}
