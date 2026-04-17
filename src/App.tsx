import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { useEffect, useState, useCallback } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { startReminderChecker } from "@/lib/reminders";
import { parseChallengeFromURL, FriendChallengeParams } from "@/lib/friendChallenge";
import { AcceptChallengeDialog } from "@/components/FriendChallenge";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import BottomNav from "@/components/BottomNav";
import MiniPlayer from "@/components/MiniPlayer";
import OfflineIndicator from "@/components/OfflineIndicator";
import { lazy, Suspense } from "react";
const Home = lazy(() => import("@/pages/Home"));
const Session = lazy(() => import("@/pages/Session"));
const Techniques = lazy(() => import("@/pages/Techniques"));
const Stats = lazy(() => import("@/pages/Stats"));
const Settings = lazy(() => import("@/pages/Settings"));
const Playlists = lazy(() => import("@/pages/Playlists"));
const Programs = lazy(() => import("@/pages/Programs"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Guide = lazy(() => import("@/pages/Guide"));

const queryClient = new QueryClient();

function AppInner() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [incomingChallenge, setIncomingChallenge] = useState<FriendChallengeParams | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    startReminderChecker();
  }, []);

  useEffect(() => {
    const challenge = parseChallengeFromURL();
    if (challenge) {
      setIncomingChallenge(challenge);
      setShowAcceptDialog(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-high-contrast", String(settings.highContrast));
    root.setAttribute("data-large-text", String(settings.largeText));
    root.setAttribute("data-reduced-motion", String(settings.reducedMotion));
  }, [settings.highContrast, settings.largeText, settings.reducedMotion]);

  useKeyboardShortcuts({
    sessionActive: false,
    onNavigate: (path) => navigate(path),
    onHelp: () => setShowShortcuts(true),
  });

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        {t("a11y.skipToMain")}
      </a>
      <OfflineIndicator />
      <Toaster />
      <Sonner />
      <main id="main-content">
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/session" element={<Session />} />
            <Route path="/techniques" element={<Techniques />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <MiniPlayer />
      <BottomNav />
      <AcceptChallengeDialog
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
        challenge={incomingChallenge}
      />
      <KeyboardShortcutsHelp open={showShortcuts} onOpenChange={setShowShortcuts} />
    </>
  );
}

function AppShell() {
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem("breathe_onboarding_done") === "1");

  const handleOnboardingComplete = useCallback(() => {
    setOnboarded(true);
  }, []);

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return <AppInner />;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SettingsProvider>
            <TooltipProvider>
              <BrowserRouter>
                <SessionProvider>
                  <AppShell />
                </SessionProvider>
              </BrowserRouter>
            </TooltipProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
