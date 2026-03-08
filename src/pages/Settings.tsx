import { useTheme, THEMES, ThemeId } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportData, importData } from "@/lib/storage";
import { Download, Upload, Circle, Waves, BarChart3, Flower2, Plus, Trash2, Bell, BellOff, Accessibility } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { VisualizationType } from "@/components/BreathingVisualizer";
import { getReminders, addReminder, updateReminder, deleteReminder, requestNotificationPermission, getNotificationPermission, Reminder } from "@/lib/reminders";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { settings, update } = useSettings();
  const { t, language, setLanguage } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [reminders, setReminders] = useState(getReminders);
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission);

  const DAYS_KEYS = ["day.sun", "day.mon", "day.tue", "day.wed", "day.thu", "day.fri", "day.sat"];

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "muhurto-breath-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t("settings.dataExported") });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(reader.result as string);
        toast({ title: t("settings.dataImported") });
        window.location.reload();
      } catch {
        toast({ title: t("settings.invalidFile"), variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(getNotificationPermission());
    if (!granted) toast({ title: t("settings.notifDenied"), variant: "destructive" });
  };

  const handleAddReminder = () => {
    const r: Reminder = {
      id: `reminder-${Date.now()}`,
      time: "09:00",
      days: [1, 2, 3, 4, 5],
      enabled: true,
      message: t("settings.reminders.defaultMessage"),
    };
    addReminder(r);
    setReminders(getReminders());
  };

  const handleUpdateReminder = (id: string, partial: Partial<Reminder>) => {
    updateReminder(id, partial);
    setReminders(getReminders());
  };

  const handleDeleteReminder = (id: string) => {
    deleteReminder(id);
    setReminders(getReminders());
  };

  const toggleReminderDay = (reminderId: string, day: number) => {
    const r = reminders.find(rem => rem.id === reminderId);
    if (!r) return;
    const newDays = r.days.includes(day) ? r.days.filter(d => d !== day) : [...r.days, day];
    handleUpdateReminder(reminderId, { days: newDays });
  };

  return (
    <div className="min-h-screen px-4 pb-24 pt-12">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>

        {/* Language */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.language")}</h2>
          <div className="flex gap-2">
            {(["en", "bn"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors",
                  language === lang ? "bg-primary/20 ring-2 ring-primary text-primary" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                {lang === "en" ? t("common.english") : t("common.bengali")}
              </button>
            ))}
          </div>
        </section>

        {/* Themes */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.theme")}</h2>
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
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.voice")}</h2>
          <div className="flex items-center justify-between">
            <Label>{t("settings.voiceEnable")}</Label>
            <Switch checked={settings.voiceEnabled} onCheckedChange={(v) => update({ voiceEnabled: v })} />
          </div>
          <div>
            <Label className="mb-2 block">{t("settings.voiceSpeed", { speed: settings.voiceSpeed.toFixed(1) })}</Label>
            <Slider min={0.5} max={1.5} step={0.1} value={[settings.voiceSpeed]} onValueChange={([v]) => update({ voiceSpeed: v })} />
          </div>
        </section>

        {/* General */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.general")}</h2>
          <div className="flex items-center justify-between">
            <Label>{t("settings.vibration")}</Label>
            <Switch checked={settings.vibrationEnabled} onCheckedChange={(v) => update({ vibrationEnabled: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>{t("settings.sound")}</Label>
            <Switch checked={settings.soundEnabled} onCheckedChange={(v) => update({ soundEnabled: v })} />
          </div>
          <div>
            <Label className="mb-2 block">{t("settings.defaultDuration", { min: settings.defaultDurationMinutes })}</Label>
            <Slider min={1} max={30} step={1} value={[settings.defaultDurationMinutes]} onValueChange={([v]) => update({ defaultDurationMinutes: v })} />
          </div>
        </section>

        {/* Visualization */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.visualization")}</h2>
          <div className="grid grid-cols-4 gap-2">
            {([
              { id: "circle" as VisualizationType, icon: Circle, labelKey: "viz.circle" },
              { id: "wave" as VisualizationType, icon: Waves, labelKey: "viz.wave" },
              { id: "bars" as VisualizationType, icon: BarChart3, labelKey: "viz.bars" },
              { id: "mandala" as VisualizationType, icon: Flower2, labelKey: "viz.mandala" },
            ]).map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                onClick={() => update({ visualizationType: id })}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs transition-colors",
                  settings.visualizationType === id ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-secondary"
                )}
              >
                <Icon className="h-5 w-5 text-foreground" />
                <span className="text-muted-foreground">{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Reminders */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.reminders")}</h2>
            <Button size="sm" variant="secondary" className="gap-1 h-7 text-xs" onClick={handleAddReminder}>
              <Plus className="h-3.5 w-3.5" /> {t("settings.reminders.add")}
            </Button>
          </div>

          {notifPermission !== "granted" && (
            <div className="rounded-xl bg-secondary/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <BellOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {notifPermission === "unsupported"
                    ? t("settings.reminders.unsupported")
                    : notifPermission === "denied"
                      ? t("settings.reminders.denied")
                      : t("settings.reminders.default")}
                </span>
              </div>
              {notifPermission === "default" && (
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={handleRequestPermission}>
                  <Bell className="h-3.5 w-3.5" /> {t("settings.reminders.enableButton")}
                </Button>
              )}
            </div>
          )}

          {reminders.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("settings.reminders.empty")}</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      type="time"
                      value={r.time}
                      onChange={e => handleUpdateReminder(r.id, { time: e.target.value })}
                      className="h-8 w-28 text-sm bg-transparent border-none px-0 font-semibold text-foreground"
                    />
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={r.enabled}
                        onCheckedChange={v => handleUpdateReminder(r.id, { enabled: v })}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDeleteReminder(r.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {DAYS_KEYS.map((dk, i) => (
                      <button
                        key={dk}
                        onClick={() => toggleReminderDay(r.id, i)}
                        className={cn(
                          "flex-1 rounded-md py-1 text-[10px] font-medium transition-colors",
                          r.days.includes(i) ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {t(dk)}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={r.message}
                    onChange={e => handleUpdateReminder(r.id, { message: e.target.value })}
                    placeholder={t("settings.reminders.messagePlaceholder")}
                    className="h-7 text-xs bg-transparent"
                  />
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            {t("settings.reminders.warning")}
          </p>
        </section>

        {/* Data */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.data")}</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="gap-1 flex-1" onClick={handleExport}>
              <Download className="h-4 w-4" /> {t("settings.export")}
            </Button>
            <Button variant="secondary" size="sm" className="gap-1 flex-1" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> {t("settings.import")}
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </section>

        {/* Install */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.install")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("settings.installDesc")}
            <strong className="text-foreground"> {t("settings.installAction")}</strong>{t("settings.installOffline")}
          </p>
        </section>
      </div>
    </div>
  );
}
