import { useStore } from "../store";
import {
  HomeIcon, SearchIcon, CompassIcon, ReelsIcon, PlusSquareIcon, MenuIcon,
} from "./Icons";

export function Sidebar() {
  const { route, navigate, currentUser, setUploadOpen, logout } = useStore();
  if (!currentUser) return null;

  const Item = ({
    icon, label, active, onClick,
  }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`group flex items-center gap-4 w-full px-3 py-3 rounded-lg hover:bg-zinc-900 transition ${active ? "font-bold" : ""}`}
    >
      <span className="shrink-0 transition group-active:scale-90">{icon}</span>
      <span className="hidden xl:inline text-sm">{label}</span>
    </button>
  );

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[72px] xl:w-[244px] border-r border-zinc-900 bg-black z-40 flex-col px-3 py-6">
      <div className="px-3 mb-8">
        <span className="hidden xl:inline font-serif italic text-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          Reelgram
        </span>
        <span className="xl:hidden block w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" />
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <Item icon={<HomeIcon filled={route.name === "home"} />} label="Home"
          active={route.name === "home"} onClick={() => navigate({ name: "home" })} />
        <Item icon={<SearchIcon />} label="Search" onClick={() => navigate({ name: "explore" })} />
        <Item icon={<CompassIcon filled={route.name === "explore"} />} label="Explore"
          active={route.name === "explore"} onClick={() => navigate({ name: "explore" })} />
        <Item icon={<ReelsIcon filled={route.name === "reels"} />} label="Reels"
          active={route.name === "reels"} onClick={() => navigate({ name: "reels" })} />
        <Item icon={<PlusSquareIcon />} label="Create" onClick={() => setUploadOpen(true)} />
        <Item
          icon={<img src={currentUser.avatar} alt="" className={`w-7 h-7 rounded-full ring-2 ${route.name === "profile" ? "ring-white" : "ring-transparent"}`} />}
          label="Profile"
          active={route.name === "profile"}
          onClick={() => navigate({ name: "profile", username: currentUser.username })}
        />
      </nav>

      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-4 w-full px-3 py-3 rounded-lg hover:bg-zinc-900 transition"
        >
          <MenuIcon />
          <span className="hidden xl:inline text-sm">Log out</span>
        </button>
      </div>
    </aside>
  );
}

export function MobileTopBar() {
  const { route, navigate, currentUser } = useStore();
  if (!currentUser || route.name === "reels") return null;
  return (
    <header className="md:hidden sticky top-0 z-30 bg-black/90 backdrop-blur border-b border-zinc-900 flex items-center justify-between px-4 h-14">
      <button onClick={() => navigate({ name: "home" })} className="font-serif italic text-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
        Reelgram
      </button>
      <div className="flex items-center gap-4">
        <button aria-label="Search" onClick={() => navigate({ name: "explore" })}><SearchIcon className="w-6 h-6" /></button>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const { route, navigate, currentUser, setUploadOpen } = useStore();
  if (!currentUser) return null;
  const onReels = route.name === "reels";
  return (
    <nav className={`md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around h-14 border-t ${onReels ? "bg-black border-zinc-900" : "bg-black border-zinc-900"}`}>
      <button onClick={() => navigate({ name: "home" })} aria-label="Home">
        <HomeIcon filled={route.name === "home"} className="w-7 h-7" />
      </button>
      <button onClick={() => navigate({ name: "explore" })} aria-label="Explore">
        <CompassIcon filled={route.name === "explore"} className="w-7 h-7" />
      </button>
      <button onClick={() => setUploadOpen(true)} aria-label="Create">
        <PlusSquareIcon className="w-7 h-7" />
      </button>
      <button onClick={() => navigate({ name: "reels" })} aria-label="Reels">
        <ReelsIcon filled={route.name === "reels"} className="w-7 h-7" />
      </button>
      <button onClick={() => navigate({ name: "profile", username: currentUser.username })} aria-label="Profile">
        <img src={currentUser.avatar} alt="" className={`w-7 h-7 rounded-full ring-2 ${route.name === "profile" ? "ring-white" : "ring-transparent"}`} />
      </button>
    </nav>
  );
}
