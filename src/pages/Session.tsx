import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Pause, Play, Square, Volume2, VolumeX } from "lucide-react";
import BreathingCircle from "@/components/BreathingCircle";
import MoodPicker from "@/components/MoodPicker";
import { PRESET_TECHNIQUES, getTechniqueById, getCycleDuration, BreathingPhase } from "@/lib/techniques";
import { getCustomTechniques, addSession, getSettings } from "@/lib/storage";
import { useSettings } from "@/contexts/SettingsContext";
import { speak, stopSpeaking } from "@/lib/voice";
import { vibratePhaseChange, vibrateDone } from "@/lib/haptics";
import { saveMoodRecord, getMoodEmoji } from "@/lib/mood";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SessionState = "idle" | "running" | "paused" | "done";

export default function Session() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const techniqueId = params.get("technique") || "box-breathing";
  const technique = getTechniqueById(techniqueId, getCustomTechniques()) || PRESET_TECHNIQUES[0];
  const cycleDuration = getCycleDuration(technique);

  const [state, setState] = useState<SessionState>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(technique.phases[0].duration);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [voiceOn, setVoiceOn] = useState(settings.voiceEnabled);
  const [durationMin, setDurationMin] = useState(settings.defaultDurationMinutes);

  // Mood state
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const sessionIdRef = useRef(crypto.randomUUID());

  // Check if mood was passed from home page
  useEffect(() => {
    const moodParam = params.get("mood");
    if (moodParam) setMoodBefore(Number(moodParam));
  }, [params]);

  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef(0);

  const currentPhase: BreathingPhase = technique.phases[phaseIndex];

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    stopSpeaking();
    if (totalElapsed > 10) {
      addSession({
        id: sessionIdRef.current,
        techniqueId: technique.id,
        techniqueName: technique.name,
        date: new Date().toISOString(),
        durationSeconds: totalElapsed,
        completedCycles,
        moodBefore: moodBefore ?? undefined,
      });
    }
    setState("done");
    vibrateDone();
  }, [totalElapsed, completedCycles, technique, moodBefore]);

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        setPhaseIndex((pi) => {
          const next = (pi + 1) % technique.phases.length;
          if (next === 0) {
            setCompletedCycles((c) => c + 1);
          }
          const nextPhase = technique.phases[next];
          setSecondsLeft(nextPhase.duration);
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
      if (newT >= durationMin * 60) {
        stop();
      }
      return newT;
    });
  }, [technique, voiceOn, settings, durationMin, stop]);

  const start = () => {
    sessionIdRef.current = crypto.randomUUID();
    setPhaseIndex(0);
    setSecondsLeft(technique.phases[0].duration);
    setTotalElapsed(0);
    setCompletedCycles(0);
    setMoodAfter(null);
    setMoodSaved(false);
    setState("running");
    startTimeRef.current = Date.now();
    if (voiceOn) speak(technique.phases[0].label, settings.voiceSpeed);
    if (settings.vibrationEnabled) vibratePhaseChange();
  };

  const pause = () => {
    clearInterval(intervalRef.current);
    setState("paused");
    stopSpeaking();
  };

  const resume = () => {
    setState("running");
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
        <div className="text-center">
          <div className="mb-4 text-5xl">🙏</div>
          <h2 className="text-2xl font-bold text-foreground">Well Done!</h2>
          <p className="mt-2 text-muted-foreground">
            {Math.round(totalElapsed / 60)} min · {completedCycles} cycles
          </p>
          <p className="text-sm text-muted-foreground">{technique.name}</p>

          {/* Post-session mood check-in */}
          <div className="mt-6">
            {!moodSaved ? (
              <MoodPicker
                selected={moodAfter}
                onSelect={handleMoodAfter}
                label="How do you feel now?"
              />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">{getMoodEmoji(moodAfter!)}</span>
                {moodImprovement !== null && moodImprovement > 0 && (
                  <span className="text-sm font-medium text-primary">
                    +{moodImprovement} mood boost!
                  </span>
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

          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => { setState("idle"); setMoodBefore(null); setMoodAfter(null); setMoodSaved(false); }}>Again</Button>
            <Button onClick={() => navigate("/")}>Done</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-24">
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-lg font-semibold text-foreground">{technique.name}</h2>

        {/* Pre-session mood (idle only) */}
        {state === "idle" && (
          <MoodPicker
            selected={moodBefore}
            onSelect={setMoodBefore}
            label="How are you feeling?"
            compact
          />
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
