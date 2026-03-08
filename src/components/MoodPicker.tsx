import { MOODS } from "@/lib/mood";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface MoodPickerProps {
  selected: number | null;
  onSelect: (mood: number) => void;
  label?: string;
  compact?: boolean;
}

export default function MoodPicker({ selected, onSelect, label, compact }: MoodPickerProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm font-medium")}>
          {label}
        </p>
      )}
      <div className="flex gap-1.5">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onSelect(mood.value)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-2 transition-all",
              compact ? "px-2 py-1.5" : "px-3 py-2",
              selected === mood.value
                ? "bg-primary/15 ring-2 ring-primary scale-110"
                : "bg-secondary/50 hover:bg-secondary"
            )}
          >
            <span className={compact ? "text-lg" : "text-2xl"}>{mood.emoji}</span>
            <span className={cn(
              "text-[10px] leading-tight",
              selected === mood.value ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              {t(`mood.${mood.value}`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
