import { Home, Wind, BookOpen, BarChart3, MoreHorizontal, ListMusic, GraduationCap, BookOpenText, Settings2 } from "lucide-react";
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
  { path: "/playlists", labelKey: "nav.playlists", icon: ListMusic },
  { path: "/programs", labelKey: "nav.programs", icon: GraduationCap },
  { path: "/guide", labelKey: "nav.guide", icon: BookOpenText },
  { path: "/settings", labelKey: "nav.settings", icon: Settings2 },
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
        <div className="fixed inset-0 z-[60]" onClick={() => setMoreOpen(false)}>
          <div
            role="menu"
            className="absolute bottom-20 right-3 min-w-[200px] rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-2xl shadow-black/20 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-3 duration-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {MORE_ITEMS.map(({ path, labelKey, icon: Icon }, idx) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  role="menuitem"
                  onClick={() => { navigate(path); setMoreOpen(false); }}
                  className={cn(
                    "relative flex w-full items-center gap-4 px-5 py-4 text-base transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring",
                    idx < MORE_ITEMS.length - 1 && "border-b border-border/30",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-secondary/60"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
                  )}
                  <Icon className={cn("h-4.5 w-4.5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                  <span>{t(labelKey)}</span>
                </button>
              );
            })}
            {/* Caret */}
            <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-r border-b border-border/60 bg-card/90" />
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
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} aria-hidden="true" />
                <span className="font-medium">{t(labelKey)}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring",
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
