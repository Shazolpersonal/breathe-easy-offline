import { useNavigate, useLocation } from "react-router-dom";
import { Play, Pause, X, Wind } from "lucide-react";
import { useSessionContext } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { addSession } from "@/lib/storage";
import { updateProgression } from "@/lib/progression";
import { toast } from "sonner";

export default function MiniPlayer() {
  const { miniSession, updateMiniSession, stopMiniSession } = useSessionContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  if (!miniSession?.isActive || location.pathname === "/session") return null;

  const elapsed = miniSession.elapsed;
  const display = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
  const total = `${miniSession.totalDuration}:00`;

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Save partial session if elapsed > 30 seconds
    if (miniSession.elapsed > 30) {
      addSession({
        id: crypto.randomUUID(),
        techniqueId: miniSession.techniqueId,
        techniqueName: miniSession.techniqueName,
        date: new Date().toISOString(),
        durationSeconds: miniSession.elapsed,
        completedCycles: miniSession.completedCycles,
        moodBefore: miniSession.moodBefore ?? undefined,
      });
      updateProgression(miniSession.techniqueId, miniSession.completedCycles);
      toast.success(t("session.savedPartial"));
    }
    stopMiniSession();
  };

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-40 safe-bottom zen-mode-hide"
      onClick={() => navigate("/session")}
      role="region"
      aria-label={t("session.miniPlayer")}
    >
      <div className="mx-auto max-w-md px-2">
        <div className="flex items-center gap-3 rounded-t-2xl border border-b-0 border-border bg-card/95 px-4 py-2.5 backdrop-blur-md shadow-lg cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15" aria-hidden="true">
            <Wind className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{miniSession.techniqueName}</p>
            <p className="text-xs text-muted-foreground" aria-live="polite">
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
            onClick={handleStop}
            className="rounded-full p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            aria-label={t("session.stopAndSave")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
