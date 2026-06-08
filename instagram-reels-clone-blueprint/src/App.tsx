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
  const { currentUser, route } = useStore();

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

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}
