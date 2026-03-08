import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSmartSuggestion, getSuggestionTechnique } from "@/lib/suggestions";
import { Button } from "@/components/ui/button";

export default function SmartSuggestion() {
  const navigate = useNavigate();
  const suggestion = getSmartSuggestion();
  const technique = getSuggestionTechnique(suggestion);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-foreground">{suggestion.message}</p>
          <Button
            size="sm"
            className="mt-3"
            onClick={() => navigate(`/session?technique=${technique.id}`)}
          >
            Start {technique.name}
          </Button>
        </div>
      </div>
    </div>
  );
}
