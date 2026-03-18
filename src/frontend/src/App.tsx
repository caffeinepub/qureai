import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import BottomNav, { type TabId } from "./components/BottomNav";
import LoginScreen from "./components/LoginScreen";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import DashboardPage from "./pages/DashboardPage";
import InvestPage from "./pages/InvestPage";
import ProfilePage from "./pages/ProfilePage";
import TradePage from "./pages/TradePage";
import WalletPage from "./pages/WalletPage";

const queryClient = new QueryClient();

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && profile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/qureai-logo-transparent.dim_120x120.png"
            alt="QureAi"
            className="w-16 h-16 animate-pulse"
          />
          <p className="gradient-text font-bold text-lg">QureAi</p>
          <p className="text-xs text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (showProfileSetup) {
    return <ProfileSetup onComplete={() => {}} />;
  }

  const tabContent: Record<TabId, React.ReactNode> = {
    dashboard: <DashboardPage />,
    trade: <TradePage />,
    invest: <InvestPage />,
    wallet: <WalletPage />,
    profile: <ProfilePage />,
  };

  return (
    <div className="min-h-screen aurora-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 pt-4 pb-2">
        <div className="glass-card flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/qureai-logo-transparent.dim_120x120.png"
              alt="QureAi"
              className="w-8 h-8"
            />
            <span className="font-bold text-base gradient-text">QureAi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-xs font-medium" style={{ color: "#2EE6A6" }}>
              AI Active
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 pt-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* Footer inside main but below content */}
      <div className="pb-2 px-4 text-center">
        <p className="text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="neon-text-cyan hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            color: "#F2F6FF",
          },
        }}
      />
    </QueryClientProvider>
  );
}
