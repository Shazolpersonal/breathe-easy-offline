import { useTheme, THEMES, ThemeId, ThemeMode } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportData, importDataSmart, getLastBackupDate, getDataSummary, exportDataCompact, importDataFromCompact, validateImportData } from "@/lib/storage";
import { exportSessionsCSV } from "@/lib/csvExport";
import { Download, Upload, Circle, Waves, BarChart3, Flower2, Plus, Trash2, Bell, BellOff, Accessibility, Mic, Heart, Music, FileSpreadsheet, AlertTriangle, Database, Volume2, Info, HeartHandshake, Clipboard, ClipboardPaste, Target } from "lucide-react";
import { SoundscapeType, getSoundscapeEngine } from "@/lib/soundscapes";
import SoundscapePicker from "@/components/SoundscapePicker";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useRef, useState, useEffect } from "react";
import { VisualizationType } from "@/components/BreathingVisualizer";
import { getReminders, addReminder, updateReminder, deleteReminder, requestNotificationPermission, getNotificationPermission, Reminder } from "@/lib/reminders";
import { getAvailableVoices, hasBengaliVoice, previewVoice, type VoiceInfo } from "@/lib/voice";
import DonateDialog from "@/components/DonateDialog";

export default function Settings() {
  const { theme, setTheme, themeMode, setThemeMode } = useTheme();
  const { settings, update } = useSettings();
  const { t, language, setLanguage } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [reminders, setReminders] = useState(getReminders);
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission);
  const [voices, setVoices] = useState(() => getAvailableVoices());
  const [bnAvailable, setBnAvailable] = useState(() => hasBengaliVoice());
  const [showDonateDialog, setShowDonateDialog] = useState(false);

  // Re-fetch voices when they load asynchronously
  useEffect(() => {
    const handler = () => {
      setVoices(getAvailableVoices());
      setBnAvailable(hasBengaliVoice());
    };
    window.speechSynthesis?.addEventListener("voiceschanged", handler);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", handler);
  }, []);

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
      const content = reader.result as string;
      const validation = validateImportData(content);
      
      if (!validation.success) {
        const errorMessage = validation.errors.map(err => t(err)).join(", ");
        toast({ title: t("settings.invalidFile"), description: errorMessage, variant: "destructive" });
        return;
      }
      
      const result = importDataSmart(content, true);
      if (result.success) {
        const msg = result.stats 
          ? t("import.success", { new: result.stats.newSessions, duplicates: result.stats.duplicates })
          : t("settings.dataImported");
        toast({ title: msg });
        window.location.reload();
      } else {
        const errorMessage = result.errors.map(err => t(err)).join(", ");
        toast({ title: t("settings.invalidFile"), description: errorMessage, variant: "destructive" });
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
          <div className="mt-3">
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">{t("settings.themeMode")}</h3>
            <div className="flex gap-2">
              {(["manual", "manual-light", "auto", "auto-warm"] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  className={cn(
                    "flex-1 rounded-xl py-2 text-xs font-medium transition-colors",
                    themeMode === mode ? "bg-primary/20 ring-2 ring-primary text-primary" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  {t(`settings.themeMode.${mode === "auto-warm" ? "autoWarm" : mode}`)}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">{t("settings.themeMode.desc")}</p>
          </div>
        </section>

        {/* Ambient Soundscape */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.soundscape")}</h2>
          </div>
          <SoundscapePicker
            value={(settings.soundscapeType || "off") as SoundscapeType}
            onChange={(type) => {
              update({ soundscapeType: type });
              // Play a brief preview
              const engine = getSoundscapeEngine();
              engine.stop();
              if (type !== "off") {
                engine.start(type, settings.soundscapeVolume ?? 0.5);
                setTimeout(() => engine.stop(), 4000);
              }
            }}
          />
          <div>
            <Label className="mb-2 block">{t("soundscape.volume")}</Label>
            <Slider min={0} max={1} step={0.05} value={[settings.soundscapeVolume ?? 0.5]} onValueChange={([v]) => update({ soundscapeVolume: v })} />
          </div>
          <p className="text-[10px] text-muted-foreground">{t("settings.soundscapeDesc")}</p>
        </section>

        {/* Accessibility */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Accessibility className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.accessibility")}</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("settings.highContrast")}</Label>
              <p className="text-xs text-muted-foreground">{t("settings.highContrastDesc")}</p>
            </div>
            <Switch checked={settings.highContrast} onCheckedChange={(v) => update({ highContrast: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("settings.largeText")}</Label>
              <p className="text-xs text-muted-foreground">{t("settings.largeTextDesc")}</p>
            </div>
            <Switch checked={settings.largeText} onCheckedChange={(v) => update({ largeText: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("settings.reducedMotion")}</Label>
              <p className="text-xs text-muted-foreground">{t("settings.reducedMotionDesc")}</p>
            </div>
            <Switch checked={settings.reducedMotion} onCheckedChange={(v) => update({ reducedMotion: v })} />
          </div>
        </section>

        {/* Intelligence & Sensors */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.intelligence")}</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("settings.breathDetection")}</Label>
              <p className="text-xs text-muted-foreground">{t("settings.breathDetectionDesc")}</p>
            </div>
            <Switch checked={settings.breathDetectionEnabled} onCheckedChange={(v) => update({ breathDetectionEnabled: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("settings.heartRate")}</Label>
              <p className="text-xs text-muted-foreground">{t("settings.heartRateDesc")}</p>
            </div>
            <Switch checked={settings.heartRateEnabled} onCheckedChange={(v) => update({ heartRateEnabled: v })} />
          </div>
        </section>

        {/* Voice */}
        <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.voice")}</h2>
          </div>

          <div className="flex items-center justify-between">
            <Label>{t("settings.voiceEnable")}</Label>
            <Switch checked={settings.voiceEnabled} onCheckedChange={(v) => update({ voiceEnabled: v })} />
          </div>

          {settings.voiceEnabled && (
            <>
              {/* English Voice Picker */}
              <div>
                <Label className="mb-2 block text-xs">{t("settings.voiceEn")}</Label>
                <div className="flex gap-2">
                  <Select
                    value={settings.voiceNameEn || "auto"}
                    onValueChange={(v) => update({ voiceNameEn: v === "auto" ? null : v })}
                  >
                    <SelectTrigger className="flex-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">{t("settings.voiceAuto")}</SelectItem>
                      {voices.en.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    onClick={() => previewVoice(settings.voiceNameEn || "", "en", settings.voicePitch, settings.voiceSpeed, settings.voiceVolume)}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Bengali Voice Picker */}
              <div>
                <Label className="mb-2 block text-xs">{t("settings.voiceBn")}</Label>
                {!bnAvailable && (
                  <div className="flex items-center gap-1.5 mb-2 rounded-lg bg-secondary/50 px-3 py-2">
                    <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground">{t("settings.voiceBnUnavailable")}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Select
                    value={settings.voiceNameBn || "auto"}
                    onValueChange={(v) => update({ voiceNameBn: v === "auto" ? null : v })}
                  >
                    <SelectTrigger className="flex-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">{t("settings.voiceAuto")}</SelectItem>
                      {voices.bn.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    onClick={() => previewVoice(settings.voiceNameBn || "", "bn", settings.voicePitch, settings.voiceSpeed, settings.voiceVolume)}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Speed */}
              <div>
                <Label className="mb-2 block">{t("settings.voiceSpeed", { speed: settings.voiceSpeed.toFixed(1) })}</Label>
                <Slider min={0.5} max={1.5} step={0.1} value={[settings.voiceSpeed]} onValueChange={([v]) => update({ voiceSpeed: v })} />
              </div>

              {/* Pitch */}
              <div>
                <Label className="mb-2 block">{t("settings.voicePitch", { pitch: settings.voicePitch.toFixed(1) })}</Label>
                <Slider min={0.5} max={2.0} step={0.05} value={[settings.voicePitch]} onValueChange={([v]) => update({ voicePitch: v })} />
                <p className="text-[10px] text-muted-foreground mt-1">{t("settings.voicePitchDesc")}</p>
              </div>

              {/* Volume */}
              <div>
                <Label className="mb-2 block">{t("settings.voiceVolume", { vol: Math.round(settings.voiceVolume * 100) })}</Label>
                <Slider min={0} max={1} step={0.05} value={[settings.voiceVolume]} onValueChange={([v]) => update({ voiceVolume: v })} />
              </div>

              {/* Voice Cues */}
              <div className="space-y-3 pt-2 border-t border-border">
                <h3 className="text-xs font-medium text-muted-foreground">{t("settings.voiceCues")}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">{t("settings.cuePhaseNames")}</Label>
                    <p className="text-[10px] text-muted-foreground">{t("settings.cuePhaseNamesDesc")}</p>
                  </div>
                  <Switch checked={settings.cuePhaseNames} onCheckedChange={(v) => update({ cuePhaseNames: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">{t("settings.cueCountdown")}</Label>
                    <p className="text-[10px] text-muted-foreground">{t("settings.cueCountdownDesc")}</p>
                  </div>
                  <Switch checked={settings.cueCountdown} onCheckedChange={(v) => update({ cueCountdown: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">{t("settings.cueSessionStart")}</Label>
                    <p className="text-[10px] text-muted-foreground">{t("settings.cueSessionStartDesc")}</p>
                  </div>
                  <Switch checked={settings.cueSessionStart} onCheckedChange={(v) => update({ cueSessionStart: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">{t("settings.cueSessionEnd")}</Label>
                    <p className="text-[10px] text-muted-foreground">{t("settings.cueSessionEndDesc")}</p>
                  </div>
                  <Switch checked={settings.cueSessionEnd} onCheckedChange={(v) => update({ cueSessionEnd: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">{t("settings.cueCycleMilestone")}</Label>
                    <p className="text-[10px] text-muted-foreground">{t("settings.cueCycleMilestoneDesc")}</p>
                  </div>
                  <Switch checked={settings.cueCycleMilestone} onCheckedChange={(v) => update({ cueCycleMilestone: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">{t("settings.cueEncouragement")}</Label>
                    <p className="text-[10px] text-muted-foreground">{t("settings.cueEncouragementDesc")}</p>
                  </div>
                  <Switch checked={settings.cueEncouragement} onCheckedChange={(v) => update({ cueEncouragement: v })} />
                </div>
              </div>
            </>
          )}
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
          <div>
            <Label className="mb-2 block">{t("settings.dailyGoal", { min: settings.dailyGoalMinutes })}</Label>
            <Slider min={1} max={60} step={1} value={[settings.dailyGoalMinutes]} onValueChange={([v]) => update({ dailyGoalMinutes: v })} />
            <p className="text-[10px] text-muted-foreground mt-1">{t("settings.dailyGoalDesc")}</p>
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

          {/* Backup Health Indicator */}
          {(() => {
            const summary = getDataSummary();
            const lastBackup = getLastBackupDate();
            const daysSinceBackup = lastBackup ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000) : null;
            const needsBackup = daysSinceBackup === null || daysSinceBackup >= 30;
            return (
              <div className={`rounded-xl p-3 space-y-2 ${needsBackup ? "bg-destructive/10 border border-destructive/20" : "bg-secondary/50"}`}>
                <div className="flex items-center gap-2">
                  {needsBackup ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Database className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs font-medium text-foreground">{t("settings.backupHealth")}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <span>{t("settings.dataSessions", { count: summary.sessions })}</span>
                  <span>{t("settings.dataJournals", { count: summary.journals })}</span>
                  <span>{t("settings.dataMoods", { count: summary.moodRecords })}</span>
                  <span>{t("settings.dataXP", { xp: summary.xpTotal })}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {lastBackup
                    ? t("settings.lastBackup", { days: daysSinceBackup! })
                    : t("settings.neverBacked")}
                </p>
                {needsBackup && (
                  <p className="text-[10px] font-medium text-destructive">{t("settings.backupWarning")}</p>
                )}
              </div>
            );
          })()}

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="gap-1 flex-1" onClick={handleExport}>
              <Download className="h-4 w-4" /> {t("settings.export")}
            </Button>
            <Button variant="secondary" size="sm" className="gap-1 flex-1" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> {t("settings.import")}
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1"
            onClick={() => {
              exportSessionsCSV();
              toast({ title: t("settings.csvExported") });
            }}
          >
            <FileSpreadsheet className="h-4 w-4" /> {t("settings.exportCSV")}
          </Button>

          {/* Clipboard Backup */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 flex-1"
              onClick={async () => {
                try {
                  const compact = exportDataCompact();
                  await navigator.clipboard.writeText(compact);
                  toast({ title: t("settings.clipboardCopied") });
                } catch {
                  toast({ title: t("settings.clipboardError"), variant: "destructive" });
                }
              }}
            >
              <Clipboard className="h-4 w-4" /> {t("settings.copyBackup")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 flex-1"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  if (!text.trim()) {
                    toast({ title: t("settings.clipboardEmpty"), variant: "destructive" });
                    return;
                  }
                  importDataFromCompact(text.trim());
                  toast({ title: t("settings.dataImported") });
                  window.location.reload();
                } catch {
                  toast({ title: t("settings.clipboardReadError"), variant: "destructive" });
                }
              }}
            >
              <ClipboardPaste className="h-4 w-4" /> {t("settings.pasteRestore")}
            </Button>
          </div>
        </section>

        {/* Support Us / Donate */}
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <HeartHandshake className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-foreground">{t("donate.supportUs")}</h2>
              <p className="text-xs text-muted-foreground">{t("donate.supportSubtitle")}</p>
            </div>
          </div>
          <Button className="mt-3 w-full gap-2" onClick={() => setShowDonateDialog(true)}>
            <Heart className="h-4 w-4" /> {t("donate.button")}
          </Button>
        </section>
      </div>

      <DonateDialog open={showDonateDialog} onOpenChange={setShowDonateDialog} />
    </div>
  );
}
