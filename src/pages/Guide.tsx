import { BookOpen, Wind, Zap, Trophy, Keyboard, Shield, Accessibility, HelpCircle, ListMusic, GraduationCap, Palette, Heart } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function SectionIcon({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary shrink-0" />
      <span>{label}</span>
    </span>
  );
}

function TechniqueTable() {
  const techniques = [
    { name: "Box Breathing", pattern: "4s → 4s → 4s → 4s", difficulty: "Beginner", best: "Stress, focus" },
    { name: "4-7-8 Relaxation", pattern: "4s → 7s → 8s", difficulty: "Beginner", best: "Sleep, anxiety" },
    { name: "Calm Breath", pattern: "4s → 6s", difficulty: "Beginner", best: "Quick calm" },
    { name: "Equal Breathing", pattern: "5s → 5s", difficulty: "Beginner", best: "Balance, presence" },
    { name: "Wim Hof Method", pattern: "2s → 2s (×3 rounds)", difficulty: "Advanced", best: "Energy, immunity" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 pr-4 font-semibold text-foreground">Technique</th>
            <th className="pb-2 pr-4 font-semibold text-foreground">Pattern</th>
            <th className="pb-2 pr-4 font-semibold text-foreground">Level</th>
            <th className="pb-2 font-semibold text-foreground">Best For</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {techniques.map((t) => (
            <tr key={t.name}>
              <td className="py-2 pr-4 font-medium text-foreground">{t.name}</td>
              <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{t.pattern}</td>
              <td className="py-2 pr-4">
                <Badge variant={t.difficulty === "Advanced" ? "destructive" : "secondary"} className="text-xs">
                  {t.difficulty}
                </Badge>
              </td>
              <td className="py-2 text-muted-foreground">{t.best}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BadgeTable() {
  const badges = [
    { emoji: "🌱", name: "First Breath", criteria: "Complete your first session" },
    { emoji: "🔥", name: "Week Warrior", criteria: "7-day streak" },
    { emoji: "🦉", name: "Night Owl", criteria: "Session after 11 PM" },
    { emoji: "🐦", name: "Early Bird", criteria: "Session before 7 AM" },
    { emoji: "💯", name: "Century", criteria: "100 total minutes" },
    { emoji: "🏃", name: "Marathon", criteria: "Single session ≥ 10 min" },
    { emoji: "🎨", name: "Creator", criteria: "Create a custom technique" },
    { emoji: "🧘", name: "Zen Master", criteria: "Level 5 on any technique" },
    { emoji: "🧠", name: "Calm Mind", criteria: "Calm score ≥ 90" },
    { emoji: "🧭", name: "Explorer", criteria: "Try 3 different techniques" },
    { emoji: "📅", name: "Consistent", criteria: "30-day streak" },
    { emoji: "🌊", name: "Deep Diver", criteria: "50 total sessions" },
    { emoji: "🌈", name: "Mood Lifter", criteria: "Mood improves +3 in one session" },
    { emoji: "⭐", name: "Dedicated", criteria: "500 total minutes" },
    { emoji: "🏆", name: "Perfect Week", criteria: "7 consecutive days with ≥ 5 min each" },
  ];

  return (
    <div className="grid gap-2">
      {badges.map((b) => (
        <div key={b.name} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
          <span className="text-lg">{b.emoji}</span>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-foreground text-sm">{b.name}</span>
            <span className="text-muted-foreground text-xs ml-2">— {b.criteria}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function XPLevelTable() {
  const levels = [
    { level: 1, xp: 0, title: "Beginner Breather" },
    { level: 2, xp: 50, title: "Mindful Starter" },
    { level: 3, xp: 150, title: "Breath Apprentice" },
    { level: 4, xp: 350, title: "Calm Practitioner" },
    { level: 5, xp: 600, title: "Focus Adept" },
    { level: 6, xp: 1000, title: "Serenity Seeker" },
    { level: 7, xp: 1500, title: "Breath Master" },
    { level: 8, xp: 2200, title: "Calm Master" },
    { level: 9, xp: 3000, title: "Zen Sage" },
    { level: 10, xp: 4000, title: "Enlightened" },
    { level: 11, xp: 5000, title: "Breath Sage" },
    { level: 12, xp: 6500, title: "Inner Peace" },
    { level: 13, xp: 8500, title: "Transcendent" },
    { level: 14, xp: 11000, title: "Eternal Calm" },
    { level: 15, xp: 14000, title: "Ascended" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 pr-4 font-semibold text-foreground">Level</th>
            <th className="pb-2 pr-4 font-semibold text-foreground">XP Required</th>
            <th className="pb-2 font-semibold text-foreground">Title</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {levels.map((l) => (
            <tr key={l.level}>
              <td className="py-1.5 pr-4 font-mono text-muted-foreground">{l.level}</td>
              <td className="py-1.5 pr-4 font-mono text-muted-foreground">{l.xp.toLocaleString()}</td>
              <td className="py-1.5 font-medium text-foreground">{l.title}</td>
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
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Guide</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Everything you need to know about Muhurto Breath — your mindful breathing companion.
        </p>
      </div>

      <Separator className="max-w-2xl mx-auto" />

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        <Accordion type="multiple" className="space-y-1">

          {/* 1. Getting Started */}
          <AccordionItem value="getting-started" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Zap} label="Getting Started" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">What is Muhurto Breath?</h4>
                  <p className="text-sm text-muted-foreground">
                    Muhurto Breath is a free, privacy-first breathing exercise app. It guides you through science-backed
                    breathing techniques with visual, audio, and haptic cues. All your data stays on your device — no
                    account needed.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Your First Session</h4>
                  <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>Tap <Badge variant="secondary" className="text-xs mx-1">Breathe</Badge> in the bottom nav</li>
                    <li>Choose a technique (start with <strong>Box Breathing</strong> or <strong>Calm Breath</strong>)</li>
                    <li>Set your duration and tap <Badge variant="secondary" className="text-xs mx-1">Start</Badge></li>
                    <li>Follow the breathing circle — inhale, hold, exhale</li>
                    <li>When done, rate your mood and optionally journal how you feel</li>
                  </ol>
                </div>
                <InfoBlock title="Install as App (PWA)">
                  <p>
                    For the best experience, install Muhurto Breath on your device. On your phone, open the app in Chrome
                    or Safari, tap the Share/Menu button, and select <strong>"Add to Home Screen"</strong>. The app works
                    fully offline once installed.
                  </p>
                </InfoBlock>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Breathing Techniques */}
          <AccordionItem value="techniques" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Wind} label="Breathing Techniques" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Muhurto Breath includes 5 scientifically-backed preset techniques. Each has a unique rhythm designed for
                  specific outcomes.
                </p>
                <TechniqueTable />
                <Separator />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Understanding Phases</h4>
                  <p className="text-sm text-muted-foreground">
                    Each technique is a cycle of <strong>phases</strong>: Inhale, Hold, Exhale, and sometimes
                    Hold-After-Exhale. The duration of each phase is measured in seconds. One complete pass through all
                    phases = one <strong>cycle</strong>.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Difficulty Levels & Unlocking</h4>
                  <p className="text-sm text-muted-foreground">
                    Techniques are tagged as <Badge variant="secondary" className="text-xs">Beginner</Badge>,{" "}
                    <Badge variant="secondary" className="text-xs">Intermediate</Badge>, or{" "}
                    <Badge variant="destructive" className="text-xs">Advanced</Badge>. Intermediate techniques unlock
                    after 10 total sessions, and advanced after 25 sessions.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Sessions */}
          <AccordionItem value="sessions" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Heart} label="Sessions & Features" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Session Flow</h4>
                  <p className="text-sm text-muted-foreground">
                    Select a technique → set duration → Start → follow the visual breathing guide → session completes →
                    see your calm score, XP earned, and mood change.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock title="🧘 Zen Mode">
                    <p>Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">F</kbd> or
                    tap the Zen button to hide all UI and focus purely on the breathing visualization. Press{" "}
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">Esc</kbd> to exit.</p>
                  </InfoBlock>
                  <InfoBlock title="🗣️ Voice Guidance">
                    <p>Enable spoken cues in Settings. The voice announces phase names, countdowns, milestones, and
                    encouragement. Speed, pitch, and volume are customizable.</p>
                  </InfoBlock>
                  <InfoBlock title="🎵 Ambient Soundscapes">
                    <p>Choose from procedurally-generated Rain, Ocean, or Wind sounds during sessions. Volume is
                    adjustable independently from voice.</p>
                  </InfoBlock>
                  <InfoBlock title="🎤 Breathing Detection">
                    <p>Enable microphone-based breathing detection to measure your rhythm accuracy. All processing happens
                    on-device — no audio is ever recorded or sent anywhere.</p>
                  </InfoBlock>
                  <InfoBlock title="❤️ Heart Rate Monitor">
                    <p>Place your fingertip over the rear camera to estimate your heart rate. The app measures breathing
                    coherence — how well your heart rate syncs with your breathing rhythm.</p>
                  </InfoBlock>
                  <InfoBlock title="📊 Calm Score">
                    <p>After each session, you receive a calm score (0-100%) based on your breathing consistency,
                    duration, and rhythm accuracy. Higher scores indicate deeper relaxation.</p>
                  </InfoBlock>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Visualizations</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose between 4 breathing visualizations in Settings: <strong>Circle</strong> (default),{" "}
                    <strong>Wave</strong>, <strong>Bars</strong>, and <strong>Mandala</strong>. Each provides a unique
                    visual rhythm to follow.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Custom Techniques */}
          <AccordionItem value="custom" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Palette} label="Custom Techniques" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Create your own breathing patterns from the <strong>Library</strong> tab → <strong>Custom</strong> section.
                </p>
                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>Name your technique and optionally add a description and benefits</li>
                  <li>Set durations for Inhale, Hold, Exhale, and Hold-After-Exhale (1-30 seconds each)</li>
                  <li>Optionally enable <strong>Pyramid Mode</strong> — durations scale up then back down each cycle</li>
                  <li>Tap <Badge variant="secondary" className="text-xs mx-1">Create Technique</Badge></li>
                </ol>
                <InfoBlock title="🔺 Pyramid Mode">
                  <p>In pyramid mode, phase durations gradually increase from a start multiplier to a peak multiplier
                  over a set number of steps, then decrease back. This creates a progressive challenge within each session.</p>
                </InfoBlock>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Playlists */}
          <AccordionItem value="playlists" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={ListMusic} label="Playlists" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Chain multiple techniques into a single continuous session. Each step in a playlist has its own technique
                  and duration.
                </p>
                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>Go to <strong>More → Playlists</strong></li>
                  <li>Tap <Badge variant="secondary" className="text-xs mx-1">New</Badge></li>
                  <li>Name your playlist and add steps (technique + duration for each)</li>
                  <li>Start the playlist — the app transitions seamlessly between techniques</li>
                </ol>
                <p className="text-sm text-muted-foreground">
                  Example: Start with 3 min of Calm Breath to warm up, then 5 min of Box Breathing for focus, then 2 min
                  of 4-7-8 to wind down.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Guided Programs */}
          <AccordionItem value="programs" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={GraduationCap} label="Guided Programs" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Structured multi-day programs that guide you through progressive breathing practices with daily tips.
                </p>
                <div className="space-y-3">
                  <InfoBlock title="🧘 7-Day Stress Relief">
                    <p>Progressive relaxation techniques starting with simple patterns and building to the 4-7-8.
                    Designed to build a lasting stress-relief habit in one week.</p>
                  </InfoBlock>
                  <InfoBlock title="😴 Sleep Better in 14 Days">
                    <p>Evening breathing routines designed for bedtime. Starts with gentle patterns and builds to
                    longer, more calming sessions over two weeks.</p>
                  </InfoBlock>
                  <InfoBlock title="🎯 Focus Training (10 Days)">
                    <p>Energizing breath patterns to sharpen concentration. Includes precision counting exercises and
                    power breathing for mental clarity.</p>
                  </InfoBlock>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enroll in a program from <strong>More → Programs</strong>. Complete one day at a time — each day includes
                  a specific technique, duration, and a motivational tip.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 7. Progress & Stats */}
          <AccordionItem value="progress" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Trophy} label="Progress & Stats" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* XP System */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">XP System</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Earn XP after every session. XP is calculated from multiple factors:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: "Base", value: "10 XP" },
                      { label: "Duration", value: "+1/min (max 15)" },
                      { label: "Difficulty", value: "×1.5 intermediate, ×2 advanced" },
                      { label: "Calm Score", value: "score ÷ 10" },
                      { label: "Mood Boost", value: "+3 to +8" },
                      { label: "Streak Bonus", value: "+2/day (max 20)" },
                      { label: "First Today", value: "+5" },
                      { label: "Challenges", value: "+15 each" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-border px-3 py-2">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-muted-foreground ml-1.5 text-xs">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Daily XP cap: <strong>150 XP</strong>. This encourages consistent daily practice over marathon sessions.
                  </p>
                </div>

                <Separator />

                {/* Level Table */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Levels & Titles</h4>
                  <XPLevelTable />
                </div>

                <Separator />

                {/* Streaks & Mood */}
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Streaks</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete at least one session per day to build your streak. Your current and longest streaks are
                    displayed on the Stats page. Streaks reset if you miss a day.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Mood Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Before and after each session, rate your mood from 1 (Stressed) to 5 (Calm). The app tracks your
                    mood trends over time and calculates mood improvement per session.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Daily Challenges</h4>
                  <p className="text-sm text-muted-foreground">
                    Three daily challenges appear on the Home screen (Easy, Medium, Hard). Complete all three for a
                    +25 XP bonus. Challenges refresh daily and include goals like "Breathe for 5 minutes", "Calm score
                    &gt; 70", or "Try a never-used technique".
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Weekly Consistency</h4>
                  <p className="text-sm text-muted-foreground">
                    The Stats page shows a weekly consistency score based on regularity, session completion, and streak
                    maintenance.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Personalized Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    After a few sessions, the Insights tab provides personalized observations: your best time of day,
                    most effective technique, streak progress, and week-over-week comparisons.
                  </p>
                </div>

                <Separator />

                {/* Badges */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">All 15 Badges</h4>
                  <BadgeTable />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 8. Keyboard Shortcuts */}
          <AccordionItem value="shortcuts" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Keyboard} label="Keyboard Shortcuts" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Global</h4>
                  <div className="divide-y divide-border">
                    {[
                      { key: "1", action: "Go to Home" },
                      { key: "2", action: "Go to Breathe" },
                      { key: "3", action: "Go to Library" },
                      { key: "4", action: "Go to Stats" },
                      { key: "?", action: "Show shortcuts help" },
                    ].map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-2">
                        <span className="text-sm text-foreground">{s.action}</span>
                        <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">During Session</h4>
                  <div className="divide-y divide-border">
                    {[
                      { key: "Space", action: "Start / Pause / Resume" },
                      { key: "Esc", action: "Stop session / Exit Zen Mode" },
                      { key: "F", action: "Toggle Zen Mode" },
                      { key: "M", action: "Toggle voice guidance" },
                      { key: "S", action: "Toggle ambient soundscape" },
                    ].map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-2">
                        <span className="text-sm text-foreground">{s.action}</span>
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
              <SectionIcon icon={Shield} label="Data & Privacy" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock title="🔒 100% Local Storage">
                    <p>All your sessions, moods, settings, and progress are stored in your browser's local storage.
                    Nothing is ever sent to a server.</p>
                  </InfoBlock>
                  <InfoBlock title="📤 Export & Import">
                    <p>Back up your data anytime from <strong>Settings → Data → Export</strong>. This downloads a JSON
                    file with all your data. To restore, use Import.</p>
                  </InfoBlock>
                  <InfoBlock title="📊 CSV Export">
                    <p>Export your session history as a CSV file for analysis in spreadsheets or other tools.</p>
                  </InfoBlock>
                  <InfoBlock title="📶 Works Offline">
                    <p>Muhurto Breath is a Progressive Web App. Once loaded (or installed), it works completely offline
                    with no internet connection required.</p>
                  </InfoBlock>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>No account required.</strong> No tracking. No analytics. No ads. Your breathing practice is
                  entirely private.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 10. Accessibility */}
          <AccordionItem value="accessibility" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={Accessibility} label="Accessibility" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Muhurto Breath is designed to be accessible to everyone. Find these options in <strong>Settings → Accessibility</strong>:
                </p>
                <div className="space-y-2">
                  {[
                    { label: "High Contrast", desc: "Increases text and border contrast for better visibility" },
                    { label: "Large Text", desc: "Increases the base font size for improved readability" },
                    { label: "Reduced Motion", desc: "Disables all animations and transitions for users sensitive to motion" },
                  ].map((a) => (
                    <div key={a.label} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{a.label}</Badge>
                      <span className="text-sm text-muted-foreground">{a.desc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  The app also supports multiple languages (English & Bengali) and full keyboard navigation.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 11. FAQ */}
          <AccordionItem value="faq" className="border-border rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <SectionIcon icon={HelpCircle} label="Frequently Asked Questions" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {[
                  {
                    q: "Is Muhurto Breath free?",
                    a: "Yes, completely free. No subscriptions, no hidden fees, no ads. We accept optional donations to support development.",
                  },
                  {
                    q: "Does it work offline?",
                    a: "Yes. Once you've loaded the app (or installed it as a PWA), it works fully offline. All data is stored locally on your device.",
                  },
                  {
                    q: "How is the Calm Score calculated?",
                    a: "The calm score is based on your breathing consistency (how closely you follow the rhythm), session duration, and if breathing detection is enabled, your rhythm accuracy via microphone analysis.",
                  },
                  {
                    q: "Will I lose my data if I clear my browser?",
                    a: "Yes — since all data is stored in local storage, clearing browser data will erase your progress. Use Settings → Export regularly to back up your data.",
                  },
                  {
                    q: "Can I challenge a friend?",
                    a: "Yes! From the Home page, tap 'Challenge a Friend' to create a breathing challenge with a specific technique and target. Share the generated link — when your friend opens it, they'll see your challenge and can accept it.",
                  },
                  {
                    q: "What's the daily XP cap?",
                    a: "You can earn up to 150 XP per day. This is designed to encourage consistent daily practice rather than long single sessions.",
                  },
                  {
                    q: "How do reminders work?",
                    a: "Set breathing reminders in Settings. Note: reminders only fire while the app/tab is open. For reliable reminders, install the PWA and keep it accessible.",
                  },
                  {
                    q: "Is my microphone/camera data sent anywhere?",
                    a: "Absolutely not. Breathing detection (microphone) and heart rate monitoring (camera) are processed entirely on your device. No audio or video data is ever recorded, stored, or transmitted.",
                  },
                ].map((faq) => (
                  <div key={faq.q}>
                    <h4 className="font-semibold text-foreground text-sm mb-1">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground pb-4">
          <p>Muhurto Breath — Take a moment to breathe. 🌬️</p>
          <p className="mt-1">Made with ❤️ for mindful breathing.</p>
        </div>
      </div>
    </div>
  );
}
