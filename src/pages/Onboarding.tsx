import { useState, useCallback } from "react";
import { Wind, Brain, BarChart3, WifiOff, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useTheme, THEMES, ThemeId } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { settings, update } = useSettings();
  const [step, setStep] = useState(0);

  const totalSteps = 3;

  const next = useCallback(() => {
    if (step >= totalSteps - 1) {
      localStorage.setItem("breathe_onboarding_done", "1");
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, totalSteps, onComplete]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-sm py-12">
          {step === 0 && <StepLanguage language={language} setLanguage={setLanguage} t={t} />}
          {step === 1 && <StepFeatures t={t} />}
          {step === 2 && (
            <StepPersonalize
              t={t}
              theme={theme}
              setTheme={setTheme}
              voiceEnabled={settings.voiceEnabled}
              vibrationEnabled={settings.vibrationEnabled}
              onToggleVoice={(v) => update({ voiceEnabled: v })}
              onToggleVibration={(v) => update({ vibrationEnabled: v })}
            />
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="shrink-0 px-6 pb-8 pt-4">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {step > 0 && (
            <Button variant="ghost" size="sm" onClick={back} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> {t("onboarding.back")}
            </Button>
          )}
          <div className="flex-1" />
          {step === totalSteps - 1 ? (
            <Button onClick={next} className="gap-1 px-6">
              <Wind className="h-4 w-4" /> {t("onboarding.start")}
            </Button>
          ) : (
            <Button onClick={next} className="gap-1">
              {t("onboarding.next")} <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Language Selection ─── */
function StepLanguage({
  language,
  setLanguage,
  t,
}: {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (k: string) => string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
        style={{
          background: `radial-gradient(circle at 35% 35%, hsl(var(--breathe-glow)), hsl(var(--breathe-glow-secondary)))`,
          boxShadow: `0 0 40px 12px hsl(var(--breathe-glow) / 0.25)`,
        }}
      >
        <Wind className="h-10 w-10 text-primary-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-1">{t("onboarding.welcome")}</p>
      <h1 className="text-3xl font-bold text-foreground mb-2">{t("onboarding.appName")}</h1>
      <p className="text-sm text-muted-foreground mb-10">{t("onboarding.tagline")}</p>

      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
        {/* Show in both languages so first-time user can read */}
        Choose your language · ভাষা বেছে নিন
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setLanguage("en")}
          className={`rounded-2xl border-2 p-5 transition-all ${
            language === "en"
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
              : "border-border bg-card hover:border-muted-foreground/30"
          } focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2`}
        >
          <span className="text-2xl block mb-2">🇺🇸</span>
          <span className="text-sm font-semibold text-foreground">English</span>
        </button>
        <button
          onClick={() => setLanguage("bn")}
          className={`rounded-2xl border-2 p-5 transition-all ${
            language === "bn"
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
              : "border-border bg-card hover:border-muted-foreground/30"
          } focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2`}
        >
          <span className="text-2xl block mb-2">🇧🇩</span>
          <span className="text-sm font-semibold text-foreground">বাংলা</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2: Features ─── */
function StepFeatures({ t }: { t: (k: string) => string }) {
  const features = [
    { icon: Brain, titleKey: "onboarding.feature1.title", descKey: "onboarding.feature1.desc" },
    { icon: BarChart3, titleKey: "onboarding.feature2.title", descKey: "onboarding.feature2.desc" },
    { icon: WifiOff, titleKey: "onboarding.feature3.title", descKey: "onboarding.feature3.desc" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.featuresTitle")}</h2>
      <p className="text-sm text-muted-foreground mb-8">{t("onboarding.tagline")}</p>
      <div className="space-y-5">
        {features.map((f, i) => (
          <div key={i} className="flex gap-4 items-start rounded-2xl border border-border bg-card p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">{t(f.titleKey)}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 3: Personalization ─── */
function StepPersonalize({
  t,
  theme,
  setTheme,
  voiceEnabled,
  vibrationEnabled,
  onToggleVoice,
  onToggleVibration,
}: {
  t: (k: string) => string;
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  voiceEnabled: boolean;
  vibrationEnabled: boolean;
  onToggleVoice: (v: boolean) => void;
  onToggleVibration: (v: boolean) => void;
}) {
  const themeColors: Record<ThemeId, string> = {
    ocean: "195 85% 55%",
    zen: "35 55% 60%",
    forest: "145 60% 45%",
    nightsky: "240 60% 65%",
    neon: "280 85% 60%",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.personalizeTitle")}</h2>
      <p className="text-sm text-muted-foreground mb-8">{t("onboarding.chooseTheme")}</p>

      {/* Theme Picker */}
      <div className="flex justify-center gap-3 mb-8">
        {(Object.keys(THEMES) as ThemeId[]).map((id) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all ${
              theme === id ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-card"
            } focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2`}
          >
            <div
              className="h-10 w-10 rounded-full border-2 transition-transform"
              style={{
                backgroundColor: `hsl(${themeColors[id]})`,
                borderColor: theme === id ? `hsl(${themeColors[id]})` : "transparent",
                transform: theme === id ? "scale(1.15)" : "scale(1)",
              }}
            />
            <span className="text-[10px] text-muted-foreground">{THEMES[id].emoji} {THEMES[id].label}</span>
          </button>
        ))}
      </div>

      {/* Toggles */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{t("onboarding.voiceGuidance")}</p>
          </div>
          <Switch checked={voiceEnabled} onCheckedChange={onToggleVoice} />
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{t("onboarding.hapticFeedback")}</p>
          </div>
          <Switch checked={vibrationEnabled} onCheckedChange={onToggleVibration} />
        </div>
      </div>
    </div>
  );
}
