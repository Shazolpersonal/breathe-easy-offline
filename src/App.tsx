import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
import Home from "@/pages/Home";
import Session from "@/pages/Session";
import Techniques from "@/pages/Techniques";
import Stats from "@/pages/Stats";
import Settings from "@/pages/Settings";
import Playlists from "@/pages/Playlists";
import Programs from "@/pages/Programs";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";

const queryClient = new QueryClient();

function AppInner() {
  const { settings } = useSettings();
  const navigate = useNavigate();
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
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/session" element={<Session />} />
        <Route path="/techniques" element={<Techniques />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
