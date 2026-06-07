import { useEffect, useMemo, useRef, useState } from "react";
import { formatCount, timeAgo, useStore } from "../store";
import type { Post } from "../types";
import {
  HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, MoreIcon, MusicIcon, MuteIcon, UnmuteIcon, PlayIcon, CloseIcon, VerifiedIcon,
} from "./Icons";

export function ReelsFeed() {
  const { posts, route } = useStore();
  const reels = useMemo(() => posts.filter((p) => p.type === "reel"), [posts]);
  const [muted, setMuted] = useState(true);
  const [commentsForId, setCommentsForId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to a specific reel when route requests it
  useEffect(() => {
    if (route.name !== "reels" || !route.startId || !containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>(`[data-reel-id="${route.startId}"]`);
    if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
  }, [route]);

  return (
    <div
      ref={containerRef}
      className="
        fixed inset-0 md:left-[72px] xl:left-[244px] md:right-0
        bg-black overflow-y-scroll snap-y snap-mandatory
        overscroll-contain
        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        z-20
      "
      style={{ scrollSnapType: "y mandatory" }}
    >
      {reels.map((reel) => (
        <ReelItem
          key={reel.id}
          reel={reel}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          onOpenComments={() => setCommentsForId(reel.id)}
        />
      ))}

      {commentsForId && (
        <CommentsTray
          postId={commentsForId}
          onClose={() => setCommentsForId(null)}
        />
      )}
    </div>
  );
}

function ReelItem({
  reel, muted, onToggleMute, onOpenComments,
}: {
  reel: Post;
  muted: boolean;
  onToggleMute: () => void;
  onOpenComments: () => void;
}) {
  const { getUserById, currentUser, toggleLike, toggleFollow, navigate } = useStore();
  const author = getUserById(reel.userId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [popHeart, setPopHeart] = useState(false);
  const [bigHeart, setBigHeart] = useState(false);
  const lastTap = useRef(0);

  // IntersectionObserver for autoplay
  useEffect(() => {
    if (!wrapperRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visible = entry.intersectionRatio >= 0.65;
          setIsInView(visible);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.65, 0.85, 1] },
    );
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  // Play/pause based on visibility + paused state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (isInView && !isPaused) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => { /* autoplay blocked */ });
    } else {
      v.pause();
    }
  }, [isInView, isPaused, muted]);

  // Progress bar
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (v.duration) setProgress((v.currentTime / v.duration) * 100);
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, []);

  const liked = !!currentUser && reel.likes.includes(currentUser.id);
  const isOwn = currentUser?.id === reel.userId;
  const isFollowing = currentUser?.following.includes(reel.userId);

  const handleLike = () => {
    toggleLike(reel.id);
    setPopHeart(true);
    setTimeout(() => setPopHeart(false), 350);
  };

  // Double-tap to like
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (!liked) toggleLike(reel.id);
      setBigHeart(true);
      setTimeout(() => setBigHeart(false), 700);
    } else {
      setIsPaused((p) => !p);
    }
    lastTap.current = now;
  };

  return (
    <div
      ref={wrapperRef}
      data-reel-id={reel.id}
      className="snap-start snap-always w-full h-screen flex items-center justify-center relative"
    >
      {/* Video card - phone aspect on desktop */}
      <div className="relative h-full md:h-[92vh] md:my-[4vh] aspect-[9/16] max-h-full bg-zinc-900 md:rounded-xl overflow-hidden mx-auto">
        <video
          ref={videoRef}
          src={reel.mediaUrl}
          poster={reel.thumbnail}
          loop
          playsInline
          preload="metadata"
          onClick={handleTap}
          className="absolute inset-0 w-full h-full object-cover bg-black"
        />

        {/* Gradient overlays for legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Top bar — only inside the card */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between p-3 text-white">
          <span className="font-semibold text-base">Reels</span>
          <button onClick={onToggleMute} className="bg-black/40 backdrop-blur rounded-full p-1.5">
            {muted ? <MuteIcon className="w-5 h-5" /> : <UnmuteIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Pause indicator */}
        {isPaused && isInView && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 rounded-full p-5">
              <PlayIcon className="w-10 h-10 text-white" />
            </div>
          </div>
        )}

        {/* Big double-tap heart */}
        {bigHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <HeartIcon filled className="w-28 h-28 text-white drop-shadow-2xl animate-[heartPop_0.7s_ease-out]" />
          </div>
        )}

        {/* Bottom-left meta */}
        <div className="absolute left-0 right-16 bottom-6 px-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => author && navigate({ name: "profile", username: author.username })}
              className="flex items-center gap-2"
            >
              <img src={author?.avatar} alt="" className="w-8 h-8 rounded-full ring-1 ring-white/40" />
              <span className="font-semibold text-sm flex items-center gap-1">
                {author?.username}
                {author?.verified && <VerifiedIcon className="w-3.5 h-3.5" />}
              </span>
            </button>
            {!isOwn && (
              <button
                onClick={() => toggleFollow(reel.userId)}
                className={`ml-1 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                  isFollowing ? "border-white/40 text-white" : "border-white text-white"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
          <p className="text-sm line-clamp-2 mb-2">{reel.caption}</p>
          {reel.audio && (
            <div className="flex items-center gap-2 text-xs">
              <MusicIcon className="w-3.5 h-3.5" />
              <span className="truncate">{reel.audio}</span>
            </div>
          )}
          <div className="text-[11px] text-white/70 mt-1">
            {formatCount(reel.views ?? 0)} views · {timeAgo(reel.createdAt)}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="absolute right-2 bottom-6 flex flex-col items-center gap-4 text-white">
          <SideBtn
            onClick={handleLike}
            count={formatCount(reel.likes.length)}
            icon={
              <HeartIcon
                filled={liked}
                className={`w-7 h-7 transition-transform ${liked ? "text-rose-500" : ""} ${popHeart ? "scale-125" : "scale-100"}`}
              />
            }
          />
          <SideBtn
            onClick={onOpenComments}
            count={formatCount(reel.comments.length)}
            icon={<CommentIcon className="w-7 h-7" />}
          />
          <SideBtn
            onClick={() => navigator.clipboard?.writeText(`reelgram.app/r/${reel.id}`).catch(() => {})}
            count="Share"
            icon={<ShareIcon className="w-7 h-7" />}
          />
          <SideBtn icon={<BookmarkIcon className="w-7 h-7" />} />
          <SideBtn icon={<MoreIcon className="w-7 h-7" />} />
          {/* Audio thumbnail */}
          <div className="mt-1 w-8 h-8 rounded-md overflow-hidden border border-white/30">
            <img src={author?.avatar} alt="" className="w-full h-full object-cover animate-[spin_4s_linear_infinite]" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-white/20">
          <div className="h-full bg-white" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function SideBtn({
  icon, count, onClick,
}: { icon: React.ReactNode; count?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 active:scale-90 transition">
      {icon}
      {count !== undefined && <span className="text-xs font-medium">{count}</span>}
    </button>
  );
}

function CommentsTray({ postId, onClose }: { postId: string; onClose: () => void }) {
  const { posts, getUserById, currentUser, addComment } = useStore();
  const post = posts.find((p) => p.id === postId);
  const [text, setText] = useState("");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!post) return null;

  const close = () => {
    setShown(false);
    setTimeout(onClose, 200);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(postId, text);
    setText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={close}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity ${shown ? "opacity-100" : "opacity-0"}`} />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full md:w-[420px] md:rounded-2xl rounded-t-2xl
          bg-zinc-950 border border-zinc-800 text-white
          max-h-[75vh] flex flex-col
          transition-transform duration-200
          ${shown ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <span className="font-semibold text-sm">Comments</span>
          <button onClick={close} aria-label="Close"><CloseIcon className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {post.comments.length === 0 && (
            <div className="text-center text-zinc-500 text-sm py-10">No comments yet. Start the conversation.</div>
          )}
          {post.comments.map((c) => {
            const u = getUserById(c.userId);
            return (
              <div key={c.id} className="flex gap-3">
                <img src={u?.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold mr-1.5">{u?.username}</span>
                    {c.text}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{timeAgo(c.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={submit} className="border-t border-zinc-800 px-4 py-3 flex items-center gap-3">
          {currentUser && <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full" />}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-zinc-500"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="text-blue-400 font-semibold text-sm disabled:opacity-40"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
