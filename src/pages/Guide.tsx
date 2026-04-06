import { BookOpen, Wind, Zap, Trophy, Keyboard, Shield, Accessibility, HelpCircle, ListMusic, GraduationCap, Palette, Heart, Clock, Target, Sparkles, Database, Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useMemo } from "react";

function SectionIcon({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary shrink-0" />
      <span>{label}</span>
    </span>
  );
}

function TechniqueTable() {
  const { t } = useLanguage();
  const techniques = [
    { nameKey: "guide.tech.box", patternKey: "guide.tech.box.pattern", diffKey: "guide.tech.box.diff", bestKey: "guide.tech.box.best" },
    { nameKey: "guide.tech.478", patternKey: "guide.tech.478.pattern", diffKey: "guide.tech.478.diff", bestKey: "guide.tech.478.best" },
    { nameKey: "guide.tech.calm", patternKey: "guide.tech.calm.pattern", diffKey: "guide.tech.calm.diff", bestKey: "guide.tech.calm.best" },
    { nameKey: "guide.tech.equal", patternKey: "guide.tech.equal.pattern", diffKey: "guide.tech.equal.diff", bestKey: "guide.tech.equal.best" },
    { nameKey: "guide.tech.physSigh", patternKey: "guide.tech.physSigh.pattern", diffKey: "guide.tech.physSigh.diff", bestKey: "guide.tech.physSigh.best" },
    { nameKey: "guide.tech.resonant", patternKey: "guide.tech.resonant.pattern", diffKey: "guide.tech.resonant.diff", bestKey: "guide.tech.resonant.best" },
    { nameKey: "guide.tech.alternate", patternKey: "guide.tech.alternate.pattern", diffKey: "guide.tech.alternate.diff", bestKey: "guide.tech.alternate.best" },
    { nameKey: "guide.tech.diaphragmatic", patternKey: "guide.tech.diaphragmatic.pattern", diffKey: "guide.tech.diaphragmatic.diff", bestKey: "guide.tech.diaphragmatic.best" },
    { nameKey: "guide.tech.pursedLip", patternKey: "guide.tech.pursedLip.pattern", diffKey: "guide.tech.pursedLip.diff", bestKey: "guide.tech.pursedLip.best" },
    { nameKey: "guide.tech.energizing", patternKey: "guide.tech.energizing.pattern", diffKey: "guide.tech.energizing.diff", bestKey: "guide.tech.energizing.best" },
    { nameKey: "guide.tech.sleep", patternKey: "guide.tech.sleep.pattern", diffKey: "guide.tech.sleep.diff", bestKey: "guide.tech.sleep.best" },
    { nameKey: "guide.tech.wim", patternKey: "guide.tech.wim.pattern", diffKey: "guide.tech.wim.diff", bestKey: "guide.tech.wim.best" },
  ];

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 pr-3 font-semibold text-foreground">{t("guide.table.technique")}</th>
            <th className="pb-2 pr-3 font-semibold text-foreground">{t("guide.table.pattern")}</th>
            <th className="pb-2 pr-3 font-semibold text-foreground">{t("guide.table.level")}</th>
            <th className="pb-2 font-semibold text-foreground">{t("guide.table.bestFor")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {techniques.map((tech) => {
            const diff = t(tech.diffKey);
            const isAdvanced = diff === "Advanced" || diff === "উন্নত";
            const isIntermediate = diff === "Intermediate" || diff === "মাঝারি";
            return (
              <tr key={tech.nameKey}>
                <td className="py-2 pr-3 font-medium text-foreground text-xs">{t(tech.nameKey)}</td>
                <td className="py-2 pr-3 font-mono text-[10px] text-muted-foreground">{t(tech.patternKey)}</td>
                <td className="py-2 pr-3">
                  <Badge
                    variant={isAdvanced ? "destructive" : "secondary"}
                    className={`text-[10px] ${isIntermediate ? "border-amber-500/50 text-amber-600 dark:text-amber-400" : ""}`}
                  >
                    {diff}
                  </Badge>
                </td>
                <td className="py-2 text-muted-foreground text-xs">{t(tech.bestKey)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BadgeTable() {
  const { t } = useLanguage();
  const badgeIds = [
    "first-breath", "week-warrior", "night-owl", "early-bird", "century",
    "marathon", "creator", "zen-master", "calm-mind", "explorer",
    "consistent", "deep-diver", "mood-lifter", "dedicated", "perfect-week",
  ];
  const emojis: Record<string, string> = {
    "first-breath": "🌱", "week-warrior": "🔥", "night-owl": "🦉", "early-bird": "🐦",
    "century": "💯", "marathon": "🏃", "creator": "🎨", "zen-master": "🧘",
    "calm-mind": "🧠", "explorer": "🧭", "consistent": "📅", "deep-diver": "🌊",
    "mood-lifter": "🌈", "dedicated": "⭐", "perfect-week": "🏆",
  };

  return (
    <div className="grid gap-2">
      {badgeIds.map((id) => (
        <div key={id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
          <span className="text-lg">{emojis[id]}</span>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-foreground text-sm">{t(`badge.${id}.name`)}</span>
            <span className="text-muted-foreground text-xs ml-2">— {t(`badge.${id}.description`)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function XPLevelTable() {
  const { t } = useLanguage();
  const levels = [
    { level: 1, xp: 0, titleKey: "xp.Beginner Breather" },
    { level: 2, xp: 50, titleKey: "xp.Mindful Starter" },
    { level: 3, xp: 150, titleKey: "xp.Breath Apprentice" },
    { level: 4, xp: 350, titleKey: "xp.Calm Practitioner" },
    { level: 5, xp: 600, titleKey: "xp.Focus Adept" },
    { level: 6, xp: 1000, titleKey: "xp.Serenity Seeker" },
    { level: 7, xp: 1500, titleKey: "xp.Breath Master" },
    { level: 8, xp: 2200, titleKey: "xp.Calm Master" },
    { level: 9, xp: 3000, titleKey: "xp.Zen Sage" },
    { level: 10, xp: 4000, titleKey: "xp.Enlightened" },
    { level: 11, xp: 5000, titleKey: "xp.Breath Sage" },
    { level: 12, xp: 6500, titleKey: "xp.Inner Peace" },
    { level: 13, xp: 8500, titleKey: "xp.Transcendent" },
    { level: 14, xp: 11000, titleKey: "xp.Eternal Calm" },
    { level: 15, xp: 14000, titleKey: "xp.Ascended" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 pr-4 font-semibold text-foreground">{t("guide.xp.levelCol")}</th>
            <th className="pb-2 pr-4 font-semibold text-foreground">{t("guide.xp.xpCol")}</th>
            <th className="pb-2 font-semibold text-foreground">{t("guide.xp.titleCol")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {levels.map((l) => (
            <tr key={l.level}>
              <td className="py-1.5 pr-4 font-mono text-muted-foreground">{l.level}</td>
              <td className="py-1.5 pr-4 font-mono text-muted-foreground">{l.xp.toLocaleString()}</td>
              <td className="py-1.5 font-medium text-foreground">{t(l.titleKey)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 bg-secondary/30 border-border">
      <h4 className="font-semibold text-foreground mb-2 text-sm">{title}</h4>
      <div className="text-sm text-muted-foreground space-y-2">{children}</div>
    </Card>
  );
}

// Quick navigation links at top
function QuickNav({ onJump }: { onJump: (id: string) => void }) {
  const { t } = useLanguage();
  const sections = [
    { id: "getting-started", icon: "⚡", labelKey: "guide.gettingStarted" },
    { id: "techniques", icon: "🌬️", labelKey: "guide.techniques" },
    { id: "sessions", icon: "❤️", labelKey: "guide.sessions" },
    { id: "smart-features", icon: "✨", labelKey: "guide.smartFeatures" },
    { id: "progress", icon: "🏆", labelKey: "guide.progress" },
    { id: "data-backup", icon: "💾", labelKey: "guide.dataBackup" },
    { id: "faq", icon: "❓", labelKey: "guide.faq" },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => onJump(s.id)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-xs text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors"
        >
          <span>{s.icon}</span>
          <span>{t(s.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}

export default function Guide() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // All section IDs for accordion
  const ALL_SECTIONS = [
    "getting-started", "techniques", "sessions", "custom", "playlists",
    "programs", "smart-features", "progress", "shortcuts", "data-backup",
    "privacy", "accessibility", "faq"
  ];

  // Search filter — if user is searching, auto-expand matching sections
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return null; // null = show all, don't force open
    const q = searchQuery.toLowerCase();
    // We match section IDs based on their content keywords
    const sectionKeywords: Record<string, string[]> = {
      "getting-started": ["start", "install", "pwa", "first", "শুরু", "ইনস্টল", "প্রথম"],
      "techniques": ["technique", "breathing", "box", "478", "calm", "wim", "sigh", "resonant", "nostril", "diaphragm", "pursed", "sleep", "কৌশল", "শ্বাস", "বক্স"],
      "sessions": ["session", "zen", "voice", "sound", "heart", "calm score", "visual", "সেশন", "জেন", "ভয়েস", "হার্ট"],
      "custom": ["custom", "pyramid", "create", "কাস্টম", "পিরামিড", "তৈরি"],
      "playlists": ["playlist", "chain", "প্লেলিস্ট"],
      "programs": ["program", "stress", "sleep", "focus", "প্রোগ্রাম", "চাপ", "ঘুম", "ফোকাস"],
      "smart-features": ["smart", "wake", "goal", "resume", "recovery", "finish", "streak freeze", "suggestion", "weekly", "স্মার্ট", "লক্ষ্য", "পুনরায়"],
      "progress": ["xp", "level", "badge", "streak", "mood", "challenge", "insight", "অগ্রগতি", "স্তর", "ব্যাজ", "ধারা", "মুড"],
      "shortcuts": ["keyboard", "shortcut", "key", "কীবোর্ড", "শর্টকাট"],
      "data-backup": ["backup", "export", "import", "csv", "clipboard", "auto-backup", "ব্যাকআপ", "এক্সপোর্ট", "ইমপোর্ট"],
      "privacy": ["privacy", "local", "offline", "data", "গোপনীয়তা", "লোকাল", "অফলাইন"],
      "accessibility": ["accessibility", "contrast", "large text", "motion", "অ্যাক্সেসিবিলিটি", "কনট্রাস্ট"],
      "faq": ["faq", "question", "free", "প্রশ্ন", "বিনামূল্যে"],
    };
    return ALL_SECTIONS.filter((id) =>
      sectionKeywords[id]?.some((kw) => kw.includes(q) || q.includes(kw))
    );
  }, [searchQuery]);

  const openSections = filteredSections ?? undefined;

  const handleJump = (id: string) => {
    const el = document.querySelector(`[data-value="${id}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Trigger click on the trigger to open
      const trigger = el.querySelector("button") as HTMLButtonElement | null;
      if (trigger && el.getAttribute("data-state") !== "open") {
        trigger.click();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("guide.title")}</h1>
          <Badge variant="outline" className="text-[10px] ml-auto">{t("guide.version")}</Badge>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{t("guide.subtitle")}</p>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("guide.searchPlaceholder")}
            className="w-full rounded-xl border border-border bg-secondary/30 py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Quick Nav */}
        <QuickNav onJump={handleJump} />
      </div>

      <Separator className="max-w-2xl mx-auto" />

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        <Accordion
          type="multiple"
          className="space-y-1"
          {...(openSections ? { value: openSections } : {})}
        >

          {/* 1. Getting Started */}
          <AccordionItem value="getting-started" className="border-border rounded-lg border px-4" data-value="getting-started">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Zap} label={t("guide.gettingStarted")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.whatIs")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.whatIsDesc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.firstSession")}</h4>
                  <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>{t("guide.firstStep1")}</li>
                    <li>{t("guide.firstStep2")}</li>
                    <li>{t("guide.firstStep3")}</li>
                    <li>{t("guide.firstStep4")}</li>
                    <li>{t("guide.firstStep5")}</li>
                  </ol>
                </div>
                <InfoBlock title={t("guide.installPWA")}>
                  <p>{t("guide.installPWADesc")}</p>
                </InfoBlock>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Breathing Techniques — now 12 */}
          <AccordionItem value="techniques" className="border-border rounded-lg border px-4" data-value="techniques">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Wind} label={t("guide.techniques")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("guide.techniquesIntro")}</p>
                <TechniqueTable />
                <Separator />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.phases")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.phasesDesc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.difficultyTitle")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("guide.difficultyDesc1")}{" "}
                    <Badge variant="secondary" className="text-xs">{t("guide.diffBeginner")}</Badge>,{" "}
                    <Badge variant="secondary" className="text-xs border-amber-500/50 text-amber-600 dark:text-amber-400">{t("guide.diffIntermediate")}</Badge>,{" "}
                    {t("guide.diffOr")}{" "}
                    <Badge variant="destructive" className="text-xs">{t("guide.diffAdvanced")}</Badge>.{" "}
                    {t("guide.difficultyDesc2")}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.choosingTechnique")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.choosingTechniqueDesc")}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Sessions */}
          <AccordionItem value="sessions" className="border-border rounded-lg border px-4" data-value="sessions">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Heart} label={t("guide.sessions")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.sessionFlow")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.sessionFlowDesc")}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock title={`🧘 ${t("guide.zenMode")}`}>
                    <p>{t("guide.zenModeDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`🗣️ ${t("guide.voiceGuidance")}`}>
                    <p>{t("guide.voiceGuidanceDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`🎵 ${t("guide.ambientSounds")}`}>
                    <p>{t("guide.ambientSoundsDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`🎤 ${t("guide.breathDetection")}`}>
                    <p>{t("guide.breathDetectionDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`❤️ ${t("guide.heartRate")}`}>
                    <p>{t("guide.heartRateDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`📊 ${t("guide.calmScore")}`}>
                    <p>{t("guide.calmScoreDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`⏱️ ${t("guide.estimatedFinish")}`}>
                    <p>{t("guide.estimatedFinishDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`🫁 ${t("guide.breathingRate")}`}>
                    <p>{t("guide.breathingRateDesc")}</p>
                  </InfoBlock>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.visualizations")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.visualizationsDesc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.postSession")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.postSessionDesc")}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Custom Techniques */}
          <AccordionItem value="custom" className="border-border rounded-lg border px-4" data-value="custom">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Palette} label={t("guide.customTech")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("guide.customTechIntro")}</p>
                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>{t("guide.customStep1")}</li>
                  <li>{t("guide.customStep2")}</li>
                  <li>{t("guide.customStep3")}</li>
                  <li>{t("guide.customStep4")}</li>
                </ol>
                <InfoBlock title={`🔺 ${t("guide.pyramidMode")}`}>
                  <p>{t("guide.pyramidModeDesc")}</p>
                </InfoBlock>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Playlists */}
          <AccordionItem value="playlists" className="border-border rounded-lg border px-4" data-value="playlists">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={ListMusic} label={t("guide.playlists")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("guide.playlistsIntro")}</p>
                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>{t("guide.playlistStep1")}</li>
                  <li>{t("guide.playlistStep2")}</li>
                  <li>{t("guide.playlistStep3")}</li>
                  <li>{t("guide.playlistStep4")}</li>
                </ol>
                <p className="text-sm text-muted-foreground">{t("guide.playlistExample")}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Guided Programs */}
          <AccordionItem value="programs" className="border-border rounded-lg border px-4" data-value="programs">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={GraduationCap} label={t("guide.programs")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("guide.programsIntro")}</p>
                <div className="space-y-3">
                  <InfoBlock title={`🧘 ${t("guide.programStress")}`}>
                    <p>{t("guide.programStressDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`😴 ${t("guide.programSleep")}`}>
                    <p>{t("guide.programSleepDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`🎯 ${t("guide.programFocus")}`}>
                    <p>{t("guide.programFocusDesc")}</p>
                  </InfoBlock>
                </div>
                <p className="text-sm text-muted-foreground">{t("guide.programsEnroll")}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 7. NEW — Smart Features */}
          <AccordionItem value="smart-features" className="border-border rounded-lg border px-4" data-value="smart-features">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Sparkles} label={t("guide.smartFeatures")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("guide.smartFeaturesIntro")}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock title={`🔅 ${t("guide.wakeLock")}`}>
                    <p>{t("guide.wakeLockDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`🎯 ${t("guide.dailyGoal")}`}>
                    <p>{t("guide.dailyGoalDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`⏩ ${t("guide.quickResume")}`}>
                    <p>{t("guide.quickResumeDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`🔄 ${t("guide.sessionRecovery")}`}>
                    <p>{t("guide.sessionRecoveryDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`❄️ ${t("guide.streakFreeze")}`}>
                    <p>{t("guide.streakFreezeDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`📊 ${t("guide.weeklySummary")}`}>
                    <p>{t("guide.weeklySummaryDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`💡 ${t("guide.smartSuggestions")}`}>
                    <p>{t("guide.smartSuggestionsDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`📝 ${t("guide.journalInspiration")}`}>
                    <p>{t("guide.journalInspirationDesc")}</p>
                  </InfoBlock>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 8. Progress & Stats */}
          <AccordionItem value="progress" className="border-border rounded-lg border px-4" data-value="progress">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Trophy} label={t("guide.progress")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("guide.xpSystem")}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{t("guide.xpSystemDesc")}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { labelKey: "guide.xp.base", valueKey: "guide.xp.baseVal" },
                      { labelKey: "guide.xp.duration", valueKey: "guide.xp.durationVal" },
                      { labelKey: "guide.xp.difficulty", valueKey: "guide.xp.difficultyVal" },
                      { labelKey: "guide.xp.calmScore", valueKey: "guide.xp.calmScoreVal" },
                      { labelKey: "guide.xp.moodBoost", valueKey: "guide.xp.moodBoostVal" },
                      { labelKey: "guide.xp.streakBonus", valueKey: "guide.xp.streakBonusVal" },
                      { labelKey: "guide.xp.firstToday", valueKey: "guide.xp.firstTodayVal" },
                      { labelKey: "guide.xp.challenges", valueKey: "guide.xp.challengesVal" },
                    ].map((item) => (
                      <div key={item.labelKey} className="rounded-lg border border-border px-3 py-2">
                        <span className="font-medium text-foreground">{t(item.labelKey)}</span>
                        <span className="text-muted-foreground ml-1.5 text-xs">{t(item.valueKey)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{t("guide.xpCap")}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("guide.levelsTitle")}</h4>
                  <XPLevelTable />
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.streaks")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.streaksDesc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.moodTracking")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.moodTrackingDesc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.dailyChallenges")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.dailyChallengesDesc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.weeklyConsistency")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.weeklyConsistencyDesc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.insights")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.insightsDesc")}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("guide.allBadges")}</h4>
                  <BadgeTable />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 9. Keyboard Shortcuts */}
          <AccordionItem value="shortcuts" className="border-border rounded-lg border px-4" data-value="shortcuts">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Keyboard} label={t("guide.shortcuts")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("guide.shortcutsGlobal")}</h4>
                  <div className="divide-y divide-border">
                    {[
                      { key: "1", actionKey: "guide.sc.home" },
                      { key: "2", actionKey: "guide.sc.breathe" },
                      { key: "3", actionKey: "guide.sc.library" },
                      { key: "4", actionKey: "guide.sc.stats" },
                      { key: "?", actionKey: "guide.sc.help" },
                    ].map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-2">
                        <span className="text-sm text-foreground">{t(s.actionKey)}</span>
                        <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("guide.shortcutsSession")}</h4>
                  <div className="divide-y divide-border">
                    {[
                      { key: "Space", actionKey: "guide.sc.playPause" },
                      { key: "Esc", actionKey: "guide.sc.stop" },
                      { key: "F", actionKey: "guide.sc.zen" },
                      { key: "M", actionKey: "guide.sc.voice" },
                      { key: "S", actionKey: "guide.sc.sound" },
                    ].map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-2">
                        <span className="text-sm text-foreground">{t(s.actionKey)}</span>
                        <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 10. NEW — Data & Backup */}
          <AccordionItem value="data-backup" className="border-border rounded-lg border px-4" data-value="data-backup">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Database} label={t("guide.dataBackup")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("guide.dataBackupIntro")}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock title={`📤 ${t("guide.exportImport")}`}>
                    <p>{t("guide.exportImportDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`📋 ${t("guide.clipboardBackup")}`}>
                    <p>{t("guide.clipboardBackupDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`📊 ${t("guide.csvExport")}`}>
                    <p>{t("guide.csvExportDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`🔔 ${t("guide.backupReminder")}`}>
                    <p>{t("guide.backupReminderDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`🛡️ ${t("guide.importValidation")}`}>
                    <p>{t("guide.importValidationDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`🔍 ${t("guide.duplicateDetection")}`}>
                    <p>{t("guide.duplicateDetectionDesc")}</p>
                  </InfoBlock>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 11. Data & Privacy */}
          <AccordionItem value="privacy" className="border-border rounded-lg border px-4" data-value="privacy">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Shield} label={t("guide.privacy")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock title={`🔒 ${t("guide.localStorage")}`}>
                    <p>{t("guide.localStorageDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`📶 ${t("guide.offline")}`}>
                    <p>{t("guide.offlineDesc")}</p>
                  </InfoBlock>
                </div>
                <p className="text-sm text-muted-foreground">{t("guide.privacyFooter")}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 12. Accessibility */}
          <AccordionItem value="accessibility" className="border-border rounded-lg border px-4" data-value="accessibility">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Accessibility} label={t("guide.accessibility")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("guide.accessibilityIntro")}</p>
                <div className="space-y-2">
                  {[
                    { labelKey: "guide.a11y.highContrast", descKey: "guide.a11y.highContrastDesc" },
                    { labelKey: "guide.a11y.largeText", descKey: "guide.a11y.largeTextDesc" },
                    { labelKey: "guide.a11y.reducedMotion", descKey: "guide.a11y.reducedMotionDesc" },
                  ].map((a) => (
                    <div key={a.labelKey} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{t(a.labelKey)}</Badge>
                      <span className="text-sm text-muted-foreground">{t(a.descKey)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{t("guide.accessibilityFooter")}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 13. FAQ — expanded to 12 */}
          <AccordionItem value="faq" className="border-border rounded-lg border px-4" data-value="faq">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={HelpCircle} label={t("guide.faq")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <div key={i}>
                    <h4 className="font-semibold text-foreground text-sm mb-1">{t(`guide.faq${i}.q`)}</h4>
                    <p className="text-sm text-muted-foreground">{t(`guide.faq${i}.a`)}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground pb-4">
          <p>{t("guide.footer1")}</p>
          <p className="mt-1">{t("guide.footer2")}</p>
        </div>
      </div>
    </div>
  );
}
