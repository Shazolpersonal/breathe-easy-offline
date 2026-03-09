import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { RotateCcw, X } from "lucide-react";

export interface RecoverableSession {
  techniqueId: string;
  techniqueName: string;
  elapsed: number;
  completedCycles: number;
  durationMin: number;
  moodBefore: number | null;
  phaseIndex: number;
  secondsLeft: number;
  currentRound: number;
  voiceOn: boolean;
  soundscapeType: string;
  timestamp: number;
}

interface Props {
  open: boolean;
  session: RecoverableSession | null;
  onRecover: () => void;
  onDiscard: () => void;
}

export default function SessionRecoveryDialog({ open, session, onRecover, onDiscard }: Props) {
  const { t } = useLanguage();

  if (!session) return null;

  const elapsedMin = Math.floor(session.elapsed / 60);
  const elapsedSec = session.elapsed % 60;
  const elapsedDisplay = `${elapsedMin}:${String(elapsedSec).padStart(2, "0")}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDiscard()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            {t("recovery.title")}
          </DialogTitle>
          <DialogDescription>
            {t("recovery.desc", { technique: session.techniqueName, elapsed: elapsedDisplay })}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-secondary/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("recovery.technique")}</span>
            <span className="font-medium text-foreground">{session.techniqueName}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted-foreground">{t("recovery.progress")}</span>
            <span className="font-medium text-foreground">{elapsedDisplay} / {session.durationMin}:00</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted-foreground">{t("recovery.cycles")}</span>
            <span className="font-medium text-foreground">{session.completedCycles}</span>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onDiscard} className="gap-1.5">
            <X className="h-4 w-4" />
            {t("recovery.discard")}
          </Button>
          <Button onClick={onRecover} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            {t("recovery.resume")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
