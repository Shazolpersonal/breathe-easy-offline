import { useNavigate, useLocation } from "react-router-dom";
import { Play, Pause, X, Wind } from "lucide-react";
import { useSessionContext } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MiniPlayer() {
  const { miniSession, updateMiniSession, stopMiniSession } = useSessionContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  if (!miniSession?.isActive || location.pathname === "/session") return null;

  const elapsed = miniSession.elapsed;
  const display = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
  const total = `${miniSession.totalDuration}:00`;

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-40 safe-bottom zen-mode-hide"
      onClick={() => navigate("/session")}
    >
      <div className="mx-auto max-w-md px-2">
        <div className="flex items-center gap-3 rounded-t-2xl border border-b-0 border-border bg-card/95 px-4 py-2.5 backdrop-blur-md shadow-lg cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <Wind className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{miniSession.techniqueName}</p>
            <p className="text-xs text-muted-foreground">
              {t(`phase.${miniSession.currentPhase}`)} · {display} / {total}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              updateMiniSession({ isPaused: !miniSession.isPaused });
            }}
            className="rounded-full p-1.5 text-foreground hover:bg-secondary transition-colors"
            aria-label={miniSession.isPaused ? t("session.resume") : t("session.pause")}
          >
            {miniSession.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              stopMiniSession();
            }}
            className="rounded-full p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            aria-label={t("session.stop")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
