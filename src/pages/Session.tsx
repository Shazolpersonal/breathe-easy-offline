import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Pause, Play, Square, Volume2, VolumeX, TrendingUp, Sparkles } from "lucide-react";
import BreathingCircle from "@/components/BreathingCircle";
import MoodPicker from "@/components/MoodPicker";
import { PRESET_TECHNIQUES, getTechniqueById, getCycleDuration, BreathingPhase } from "@/lib/techniques";
import { getCustomTechniques, addSession, getSettings } from "@/lib/storage";
import { useSettings } from "@/contexts/SettingsContext";
import { speak, stopSpeaking } from "@/lib/voice";
import { vibratePhaseChange, vibrateDone } from "@/lib/haptics";
import { saveMoodRecord, getMoodEmoji } from "@/lib/mood";
import { getProgression, getScaledPhases, updateProgression, getLevelName, getLevelProgress, getNextLevelThreshold } from "@/lib/progression";
import { calculateCalmScore, PhaseTimestamp, CalmScoreResult } from "@/lib/coherence";
import { getNewlyUnlocked, Badge } from "@/lib/achievements";
import { calculateSessionXP, addXP, getXPState } from "@/lib/xp";
import { getCompletedChallengeCount } from "@/lib/challenges";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SessionState = "idle" | "running" | "paused" | "done";

function CalmScoreDisplay({ result }: { result: CalmScoreResult }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke={`hsl(var(--${result.color}))`}
            strokeWidth="6"
            strokeDasharray={`${(result.score / 100) * 213.6} 213.6`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-lg font-bold text-foreground">{result.score}</span>
      </div>
      <span className={`text-sm font-medium text-${result.color}`}>{result.label}</span>
      <span className="text-xs text-muted-foreground">Calm Score</span>
    </div>
  );
}

function LevelUpBanner({ level, techniqueName }: { level: number; techniqueName: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-primary/10 px-4 py-3">
      <TrendingUp className="h-5 w-5 text-primary" />
      <span className="text-sm font-semibold text-primary">Level Up!</span>
      <span className="text-xs text-muted-foreground">
        {techniqueName} → {getLevelName(level)}
      </span>
    </div>
  );
}

function XPEarnedDisplay({ xp, leveledUp, newTitle }: { xp: number; leveledUp: boolean; newTitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-accent/50 px-4 py-3">
      <Sparkles className="h-5 w-5 text-primary" />
      <span className="text-lg font-bold text-primary">+{xp} XP</span>
      {leveledUp && newTitle && (
        <span className="text-xs font-medium text-primary">🎉 New title: {newTitle}</span>
      )}
    </div>
  );
}

export default function Session() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const techniqueId = params.get("technique") || "box-breathing";
  const technique = getTechniqueById(techniqueId, getCustomTechniques()) || PRESET_TECHNIQUES[0];

  const progression = getProgression(techniqueId);
  const scaledPhases = getScaledPhases(technique, progression.level);

  const [state, setState] = useState<SessionState>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(scaledPhases[0].duration);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [voiceOn, setVoiceOn] = useState(settings.voiceEnabled);
  const [durationMin, setDurationMin] = useState(settings.defaultDurationMinutes);

  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const sessionIdRef = useRef(crypto.randomUUID());

  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number } | null>(null);
  const [earnedXP, setEarnedXP] = useState<{ xp: number; leveledUp: boolean; newTitle?: string } | null>(null);

  const phaseStartRef = useRef(Date.now());
  const phaseTimestampsRef = useRef<PhaseTimestamp[]>([]);
  const [calmResult, setCalmResult] = useState<CalmScoreResult | null>(null);

  useEffect(() => {
    const moodParam = params.get("mood");
    if (moodParam) setMoodBefore(Number(moodParam));
  }, [params]);

  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const currentPhase: BreathingPhase = scaledPhases[phaseIndex];

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    stopSpeaking();

    const now = Date.now();
    const actualDuration = (now - phaseStartRef.current) / 1000;
    phaseTimestampsRef.current.push({
      phaseIndex,
      expectedDuration: scaledPhases[phaseIndex].duration,
      actualDuration,
    });

    const calm = calculateCalmScore(phaseTimestampsRef.current);
    setCalmResult(calm);

    const result = updateProgression(technique.id, completedCycles);
    if (result.leveledUp) setLevelUpInfo({ level: result.newLevel });

    if (totalElapsed > 10) {
      addSession({
        id: sessionIdRef.current,
        techniqueId: technique.id,
        techniqueName: technique.name,
        date: new Date().toISOString(),
        durationSeconds: totalElapsed,
        completedCycles,
        moodBefore: moodBefore ?? undefined,
        calmScore: calm.score,
      });

      // XP calculation
      const challengesCompleted = getCompletedChallengeCount();
      const xp = calculateSessionXP(totalElapsed, technique, calm.score, challengesCompleted);
      const xpResult = addXP(xp);
      const xpState = getXPState();
      setEarnedXP({
        xp,
        leveledUp: xpResult.newLevel > xpResult.previousLevel,
        newTitle: xpResult.newLevel > xpResult.previousLevel ? xpState.title : undefined,
      });

      // Check for new achievement badges
      const newBadges = getNewlyUnlocked();
      newBadges.forEach((badge) => {
        toast(`${badge.emoji} ${badge.name} unlocked!`, {
          description: badge.description,
        });
      });
    }

    setState("done");
    vibrateDone();
  }, [totalElapsed, completedCycles, technique, moodBefore, phaseIndex, scaledPhases]);

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        const now = Date.now();
        const actualDuration = (now - phaseStartRef.current) / 1000;

        setPhaseIndex((pi) => {
          phaseTimestampsRef.current.push({
            phaseIndex: pi,
            expectedDuration: scaledPhases[pi].duration,
            actualDuration,
          });

          const next = (pi + 1) % scaledPhases.length;
          if (next === 0) setCompletedCycles((c) => c + 1);

          const nextPhase = scaledPhases[next];
          setSecondsLeft(nextPhase.duration);
          phaseStartRef.current = Date.now();

          if (settings.vibrationEnabled) vibratePhaseChange();
          if (voiceOn) speak(nextPhase.label, settings.voiceSpeed);
          return next;
        });
        return prev;
      }
      return prev - 1;
    });
    setTotalElapsed((t) => {
      const newT = t + 1;
      if (newT >= durationMin * 60) stop();
      return newT;
    });
  }, [scaledPhases, voiceOn, settings, durationMin, stop]);

  const start = () => {
    sessionIdRef.current = crypto.randomUUID();
    setPhaseIndex(0);
    setSecondsLeft(scaledPhases[0].duration);
    setTotalElapsed(0);
    setCompletedCycles(0);
    setMoodAfter(null);
    setMoodSaved(false);
    setLevelUpInfo(null);
    setEarnedXP(null);
    setCalmResult(null);
    phaseTimestampsRef.current = [];
    phaseStartRef.current = Date.now();
    setState("running");
    if (voiceOn) speak(scaledPhases[0].label, settings.voiceSpeed);
    if (settings.vibrationEnabled) vibratePhaseChange();
  };

  const pause = () => {
    clearInterval(intervalRef.current);
    setState("paused");
    stopSpeaking();
  };

  const resume = () => {
    setState("running");
    phaseStartRef.current = Date.now();
    if (voiceOn) speak(currentPhase.label, settings.voiceSpeed);
  };

  const handleMoodAfter = (mood: number) => {
    setMoodAfter(mood);
    saveMoodRecord({
      sessionId: sessionIdRef.current,
      techniqueId: technique.id,
      moodBefore: moodBefore ?? 3,
      moodAfter: mood,
      date: new Date().toISOString(),
    });
    setMoodSaved(true);
  };

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [state, tick]);

  const elapsedDisplay = `${Math.floor(totalElapsed / 60)}:${String(totalElapsed % 60).padStart(2, "0")}`;
  const targetDisplay = `${durationMin}:00`;
  const moodImprovement = moodBefore !== null && moodAfter !== null ? moodAfter - moodBefore : null;

  if (state === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-24">
        <div className="text-center space-y-5">
          <div className="text-5xl">🙏</div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Well Done!</h2>
            <p className="mt-1 text-muted-foreground">
              {Math.round(totalElapsed / 60)} min · {completedCycles} cycles
            </p>
            <p className="text-sm text-muted-foreground">{technique.name}</p>
            <span className="inline-block mt-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
              Lv.{progression.level} {getLevelName(progression.level)}
            </span>
          </div>

          {levelUpInfo && <LevelUpBanner level={levelUpInfo.level} techniqueName={technique.name} />}
          {calmResult && <CalmScoreDisplay result={calmResult} />}
          {earnedXP && <XPEarnedDisplay xp={earnedXP.xp} leveledUp={earnedXP.leveledUp} newTitle={earnedXP.newTitle} />}

          <div>
            {!moodSaved ? (
              <MoodPicker selected={moodAfter} onSelect={handleMoodAfter} label="How do you feel now?" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">{getMoodEmoji(moodAfter!)}</span>
                {moodImprovement !== null && moodImprovement > 0 && (
                  <span className="text-sm font-medium text-primary">+{moodImprovement} mood boost!</span>
                )}
                {moodImprovement !== null && moodImprovement === 0 && (
                  <span className="text-sm text-muted-foreground">Mood maintained</span>
                )}
                {moodImprovement !== null && moodImprovement < 0 && (
                  <span className="text-sm text-muted-foreground">Keep practicing 💪</span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => { setState("idle"); setMoodBefore(null); setMoodAfter(null); setMoodSaved(false); setLevelUpInfo(null); setEarnedXP(null); setCalmResult(null); }}>Again</Button>
            <Button onClick={() => navigate("/")}>Done</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-24">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">{technique.name}</h2>
          <span className="text-xs text-muted-foreground">
            Lv.{progression.level} {getLevelName(progression.level)}
          </span>
          {progression.level < 5 && (
            <div className="mx-auto mt-1 w-32">
              <Progress value={getLevelProgress(progression)} className="h-1.5" />
            </div>
          )}
        </div>

        {state === "idle" && (
          <MoodPicker selected={moodBefore} onSelect={setMoodBefore} label="How are you feeling?" compact />
        )}

        <BreathingCircle
          phase={state === "idle" ? "idle" : currentPhase.type}
          phaseDuration={currentPhase.duration}
          label={state === "idle" ? "Ready" : currentPhase.label}
          secondsLeft={state === "idle" ? 0 : secondsLeft}
        />

        <div className="text-center">
          <span className="text-sm tabular-nums text-muted-foreground">
            {elapsedDisplay} / {targetDisplay}
          </span>
          {state !== "idle" && (
            <p className="text-xs text-muted-foreground">{completedCycles} cycles</p>
          )}
        </div>

        {state === "idle" && (
          <div className="flex gap-2">
            {[2, 3, 5, 10, 15].map((m) => (
              <button
                key={m}
                onClick={() => setDurationMin(m)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  durationMin === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {m} min
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {state === "idle" ? (
            <Button size="lg" onClick={start} className="gap-2 rounded-full px-8">
              <Play className="h-5 w-5" /> Start
            </Button>
          ) : state === "running" ? (
            <>
              <Button size="icon" variant="secondary" onClick={pause} className="h-12 w-12 rounded-full">
                <Pause className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="destructive" onClick={stop} className="h-12 w-12 rounded-full">
                <Square className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button size="icon" variant="secondary" onClick={resume} className="h-12 w-12 rounded-full">
                <Play className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="destructive" onClick={stop} className="h-12 w-12 rounded-full">
                <Square className="h-5 w-5" />
              </Button>
            </>
          )}

          <button
            onClick={() => { setVoiceOn(!voiceOn); if (voiceOn) stopSpeaking(); }}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground"
          >
            {voiceOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
