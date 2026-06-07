import { StoreProvider, useStore } from "./store";
import { AuthPage } from "./components/AuthPage";
import { Sidebar, MobileBottomNav, MobileTopBar } from "./components/Sidebar";
import { ReelsFeed } from "./components/ReelsFeed";
import { UserProfile } from "./components/UserProfile";
import { HomeFeed } from "./components/HomeFeed";
import { Explore } from "./components/Explore";
import { EditProfile } from "./components/EditProfile";
import { UploadModal } from "./components/UploadModal";

function Router() {
  const { currentUser, route, mode, loading } = useStore();

  // Show a tiny splash while Firebase is initializing
  if (mode === "firebase" && loading && !currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="font-serif italic text-4xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Reelgram
          </span>
          <span className="text-zinc-500 text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage />;

  // Reels has its own full-screen layout (no top/bottom chrome)
  if (route.name === "reels") {
    return (
      <>
        <Sidebar />
        <ReelsFeed />
        <UploadModal />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {mode === "demo" && <DemoBanner />}
      <Sidebar />
      <MobileTopBar />
      <main className="md:ml-[72px] xl:ml-[244px] pb-14 md:pb-0">
        {route.name === "home" && <HomeFeed />}
        {route.name === "explore" && <Explore />}
        {route.name === "profile" && <UserProfile username={route.username} />}
        {route.name === "edit-profile" && <EditProfile />}
      </main>
      <MobileBottomNav />
      <UploadModal />
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-500/95 text-black text-[11px] sm:text-xs text-center py-1.5 font-medium px-3">
      Demo mode — Firebase env vars not detected. Data is in-memory and resets on refresh. See <code className="font-mono">.env.example</code>.
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}
