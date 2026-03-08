import { Heart, HeartOff, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BreathingTechnique, getCycleDuration } from "@/lib/techniques";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TechniqueCardProps {
  technique: BreathingTechnique;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  compact?: boolean;
}

const difficultyColor = {
  beginner: "bg-accent/20 text-accent",
  intermediate: "bg-primary/20 text-primary",
  advanced: "bg-destructive/20 text-destructive",
};

export default function TechniqueCard({ technique, isFavorite, onToggleFavorite, compact }: TechniqueCardProps) {
  const navigate = useNavigate();
  const cycleSec = getCycleDuration(technique);

  if (compact) {
    return (
      <button
        onClick={() => navigate(`/session?technique=${technique.id}`)}
        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-secondary"
      >
        <Play className="h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{technique.name}</p>
          <p className="text-xs text-muted-foreground">{cycleSec}s cycle</p>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{technique.name}</h3>
            <Badge variant="secondary" className={cn("text-[10px]", difficultyColor[technique.difficulty])}>
              {technique.difficulty}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{technique.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {technique.benefits.map((b) => (
              <span key={b} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                {b}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {technique.phases.map((p) => `${p.label} ${p.duration}s`).join(" → ")} ({cycleSec}s/cycle)
          </p>
        </div>
        <button onClick={onToggleFavorite} className="ml-2 shrink-0 p-1 text-muted-foreground hover:text-primary">
          {isFavorite ? <Heart className="h-5 w-5 fill-primary text-primary" /> : <HeartOff className="h-5 w-5" />}
        </button>
      </div>
      <button
        onClick={() => navigate(`/session?technique=${technique.id}`)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Play className="h-4 w-4" />
        Start Session
      </button>
    </div>
  );
}
