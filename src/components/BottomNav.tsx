import { Home, Wind, BookOpen, BarChart3, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/session", icon: Wind, label: "Breathe" },
  { path: "/techniques", icon: BookOpen, label: "Library" },
  { path: "/stats", icon: BarChart3, label: "Stats" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
