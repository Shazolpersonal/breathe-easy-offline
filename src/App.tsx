import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { startReminderChecker } from "@/lib/reminders";
import BottomNav from "@/components/BottomNav";
import Home from "@/pages/Home";
import Session from "@/pages/Session";
import Techniques from "@/pages/Techniques";
import Stats from "@/pages/Stats";
import Settings from "@/pages/Settings";
import Playlists from "@/pages/Playlists";
import Programs from "@/pages/Programs";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppInner() {
  const { settings } = useSettings();

  useEffect(() => {
    startReminderChecker();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-high-contrast", String(settings.highContrast));
    root.setAttribute("data-large-text", String(settings.largeText));
    root.setAttribute("data-reduced-motion", String(settings.reducedMotion));
  }, [settings.highContrast, settings.largeText, settings.reducedMotion]);

  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
        <BottomNav />
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider>
          <TooltipProvider>
            <AppInner />
          </TooltipProvider>
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
