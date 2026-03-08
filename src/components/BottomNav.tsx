import { Home, Wind, BookOpen, BarChart3, MoreHorizontal } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSessionContext } from "@/contexts/SessionContext";

const MAIN_ITEMS = [
  { path: "/", icon: Home, labelKey: "nav.home" },
  { path: "/session", icon: Wind, labelKey: "nav.breathe" },
  { path: "/techniques", icon: BookOpen, labelKey: "nav.library" },
  { path: "/stats", icon: BarChart3, labelKey: "nav.stats" },
];

const MORE_ITEMS = [
  { path: "/playlists", labelKey: "nav.playlists" },
  { path: "/programs", labelKey: "nav.programs" },
  { path: "/settings", labelKey: "nav.settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { miniSession } = useSessionContext();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_ITEMS.some(i => location.pathname === i.path);
  const hasMiniPlayer = miniSession?.isActive && location.pathname !== "/session";

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute bottom-16 right-4 rounded-xl border border-border bg-card p-1 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            {MORE_ITEMS.map(({ path, labelKey }) => (
              <button
                key={path}
                onClick={() => { navigate(path); setMoreOpen(false); }}
                className={cn(
                  "block w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors",
                  location.pathname === path ? "bg-primary/15 text-primary font-medium" : "text-foreground hover:bg-secondary"
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom transition-transform duration-300 zen-mode-hide",
          hasMiniPlayer && "border-t-0"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
          {MAIN_ITEMS.map(({ path, icon: Icon, labelKey }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} />
                <span className="font-medium">{t(labelKey)}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs transition-colors",
              isMoreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MoreHorizontal className={cn("h-5 w-5", isMoreActive && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} />
            <span className="font-medium">{t("nav.more")}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
