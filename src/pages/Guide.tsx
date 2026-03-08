import { BookOpen, Wind, Zap, Trophy, Keyboard, Shield, Accessibility, HelpCircle, ListMusic, GraduationCap, Palette, Heart } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

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
    { nameKey: "guide.tech.wim", patternKey: "guide.tech.wim.pattern", diffKey: "guide.tech.wim.diff", bestKey: "guide.tech.wim.best" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 pr-4 font-semibold text-foreground">{t("guide.table.technique")}</th>
            <th className="pb-2 pr-4 font-semibold text-foreground">{t("guide.table.pattern")}</th>
            <th className="pb-2 pr-4 font-semibold text-foreground">{t("guide.table.level")}</th>
            <th className="pb-2 font-semibold text-foreground">{t("guide.table.bestFor")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {techniques.map((tech) => {
            const diff = t(tech.diffKey);
            const isAdvanced = diff === "Advanced" || diff === "উন্নত";
            return (
              <tr key={tech.nameKey}>
                <td className="py-2 pr-4 font-medium text-foreground">{t(tech.nameKey)}</td>
                <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{t(tech.patternKey)}</td>
                <td className="py-2 pr-4">
                  <Badge variant={isAdvanced ? "destructive" : "secondary"} className="text-xs">
                    {diff}
                  </Badge>
                </td>
                <td className="py-2 text-muted-foreground">{t(tech.bestKey)}</td>
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

export default function Guide() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("guide.title")}</h1>
        </div>
        <p className="text-muted-foreground text-sm">{t("guide.subtitle")}</p>
      </div>

      <Separator className="max-w-2xl mx-auto" />

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        <Accordion type="multiple" className="space-y-1">

          {/* 1. Getting Started */}
          <AccordionItem value="getting-started" className="border-border rounded-lg border px-4">
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

          {/* 2. Breathing Techniques */}
          <AccordionItem value="techniques" className="border-border rounded-lg border px-4">
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
                    <Badge variant="secondary" className="text-xs">{t("guide.diffIntermediate")}</Badge>,{" "}
                    {t("guide.diffOr")}{" "}
                    <Badge variant="destructive" className="text-xs">{t("guide.diffAdvanced")}</Badge>.{" "}
                    {t("guide.difficultyDesc2")}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Sessions */}
          <AccordionItem value="sessions" className="border-border rounded-lg border px-4">
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
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("guide.visualizations")}</h4>
                  <p className="text-sm text-muted-foreground">{t("guide.visualizationsDesc")}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Custom Techniques */}
          <AccordionItem value="custom" className="border-border rounded-lg border px-4">
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
          <AccordionItem value="playlists" className="border-border rounded-lg border px-4">
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
          <AccordionItem value="programs" className="border-border rounded-lg border px-4">
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

          {/* 7. Progress & Stats */}
          <AccordionItem value="progress" className="border-border rounded-lg border px-4">
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

          {/* 8. Keyboard Shortcuts */}
          <AccordionItem value="shortcuts" className="border-border rounded-lg border px-4">
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

          {/* 9. Data & Privacy */}
          <AccordionItem value="privacy" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Shield} label={t("guide.privacy")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock title={`🔒 ${t("guide.localStorage")}`}>
                    <p>{t("guide.localStorageDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`📤 ${t("guide.exportImport")}`}>
                    <p>{t("guide.exportImportDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`📊 ${t("guide.csvExport")}`}>
                    <p>{t("guide.csvExportDesc")}</p>
                  </InfoBlock>
                  <InfoBlock title={`📶 ${t("guide.offline")}`}>
                    <p>{t("guide.offlineDesc")}</p>
                  </InfoBlock>
                </div>
                <p className="text-sm text-muted-foreground">{t("guide.privacyFooter")}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 10. Accessibility */}
          <AccordionItem value="accessibility" className="border-border rounded-lg border px-4">
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

          {/* 11. FAQ */}
          <AccordionItem value="faq" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={HelpCircle} label={t("guide.faq")} />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
