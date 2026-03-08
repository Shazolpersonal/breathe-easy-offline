import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { SoundscapeType } from "@/lib/soundscapes";

const SOUNDSCAPE_OPTIONS: { id: SoundscapeType; emoji: string; labelKey: string }[] = [
  { id: "off", emoji: "🔇", labelKey: "soundscape.off" },
  { id: "rain", emoji: "🌧", labelKey: "soundscape.rain" },
  { id: "ocean", emoji: "🌊", labelKey: "soundscape.ocean" },
  { id: "wind", emoji: "💨", labelKey: "soundscape.wind" },
];

interface Props {
  value: SoundscapeType;
  onChange: (type: SoundscapeType) => void;
  compact?: boolean;
}

export default function SoundscapePicker({ value, onChange, compact }: Props) {
  const { t } = useLanguage();

  return (
    <div className={cn("flex gap-1.5", compact ? "" : "justify-center")}>
      {SOUNDSCAPE_OPTIONS.map(({ id, emoji, labelKey }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            value === id
              ? "bg-primary/20 text-primary ring-1 ring-primary/40"
              : "bg-secondary/60 text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{emoji}</span>
          <span className={compact ? "hidden sm:inline" : ""}>{t(labelKey)}</span>
        </button>
      ))}
    </div>
  );
}
