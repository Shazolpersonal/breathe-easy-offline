import { useTheme, THEMES, ThemeId } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { exportData, importData } from "@/lib/storage";
import { Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useRef } from "react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { settings, update } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "breathe-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Data exported!" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(reader.result as string);
        toast({ title: "Data imported successfully!" });
        window.location.reload();
      } catch {
        toast({ title: "Invalid file", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen px-4 pb-24 pt-12">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        {/* Themes */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Theme</h2>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl p-2 text-xs transition-colors",
                  theme === id ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-secondary"
                )}
              >
                <span className="text-lg">{THEMES[id].emoji}</span>
                <span className="text-muted-foreground">{THEMES[id].label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Voice */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Voice Guidance</h2>
          <div className="flex items-center justify-between">
            <Label>Enable Voice</Label>
            <Switch checked={settings.voiceEnabled} onCheckedChange={(v) => update({ voiceEnabled: v })} />
          </div>
          <div>
            <Label className="mb-2 block">Speed: {settings.voiceSpeed.toFixed(1)}x</Label>
            <Slider
              min={0.5}
              max={1.5}
              step={0.1}
              value={[settings.voiceSpeed]}
              onValueChange={([v]) => update({ voiceSpeed: v })}
            />
          </div>
        </section>

        {/* General */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">General</h2>
          <div className="flex items-center justify-between">
            <Label>Vibration</Label>
            <Switch checked={settings.vibrationEnabled} onCheckedChange={(v) => update({ vibrationEnabled: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Sound Effects</Label>
            <Switch checked={settings.soundEnabled} onCheckedChange={(v) => update({ soundEnabled: v })} />
          </div>
          <div>
            <Label className="mb-2 block">Default Duration: {settings.defaultDurationMinutes} min</Label>
            <Slider
              min={1}
              max={30}
              step={1}
              value={[settings.defaultDurationMinutes]}
              onValueChange={([v]) => update({ defaultDurationMinutes: v })}
            />
          </div>
        </section>

        {/* Data */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Data</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="gap-1 flex-1" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="secondary" size="sm" className="gap-1 flex-1" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Import
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </section>

        {/* Install */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Install App</h2>
          <p className="text-sm text-muted-foreground">
            On your phone, open this app in Chrome or Safari, tap the share/menu button, and choose
            <strong className="text-foreground"> "Add to Home Screen"</strong>. The app works fully offline once installed.
          </p>
        </section>
      </div>
    </div>
  );
}
