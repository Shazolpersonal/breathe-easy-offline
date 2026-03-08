import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Pause, Play, Square, Volume2, VolumeX, TrendingUp, Sparkles, Circle, Waves, BarChart3, Flower2, Share2, SkipForward, Mic, MicOff, Heart, Maximize2, Minimize2 } from "lucide-react";
import BreathingVisualizer, { VisualizationType } from "@/components/BreathingVisualizer";
import ParticleBackground from "@/components/ParticleBackground";
import ScreenColorBreathing from "@/components/ScreenColorBreathing";
import MoodPicker from "@/components/MoodPicker";
import BreathingFeedback from "@/components/BreathingFeedback";
import HeartRateMonitorOverlay from "@/components/HeartRateMonitor";
import { PRESET_TECHNIQUES, getTechniqueById, BreathingPhase, getPyramidPhasesForRound } from "@/lib/techniques";
import { getCustomTechniques, addSession, getSessions } from "@/lib/storage";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSessionContext } from "@/contexts/SessionContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { speak, stopSpeaking, speakSessionStart, speakSessionEnd, speakCycleMilestone, speakCountdown, speakEncouragement, type SpeakOptions } from "@/lib/voice";
import { vibratePhaseChange, vibrateDone } from "@/lib/haptics";
import { saveMoodRecord, getMoodEmoji } from "@/lib/mood";
import { getProgression, getScaledPhases, updateProgression, getLevelName, getLevelProgress } from "@/lib/progression";
import { calculateCalmScore, PhaseTimestamp, CalmScoreResult } from "@/lib/coherence";
import { getNewlyUnlocked } from "@/lib/achievements";
import { calculateSessionXP, addXP, getXPState, XPBreakdown } from "@/lib/xp";
import { getCompletedChallengeCount } from "@/lib/challenges";
import { getPlaylists } from "@/lib/playlists";
import { completeDay } from "@/lib/programs";
import { shareOrDownloadCard } from "@/lib/shareCard";
import { BreathDetector, RhythmUpdate } from "@/lib/breathDetector";
import { getSoundscapeEngine, SoundscapeType } from "@/lib/soundscapes";
import SoundscapePicker from "@/components/SoundscapePicker";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SessionState = "idle" | "running" | "paused" | "done" | "playlist-transition";

const calmColorMap: Record<string, string> = {
  "primary": "text-primary",
  "accent": "text-accent",
  "muted-foreground": "text-muted-foreground",
};

function CalmScoreDisplay({ result, label, t }: { result: CalmScoreResult; label: string; t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle cx="40" cy="40" r="34" fill="none" stroke={`hsl(var(--${result.color}))`} strokeWidth="6" strokeDasharray={`${(result.score / 100) * 213.6} 213.6`} strokeLinecap="round" />
        </svg>
        <span className="absolute text-lg font-bold text-foreground">{result.score}</span>
      </div>
      <span className={`text-sm font-medium ${calmColorMap[result.color] || "text-foreground"}`}>{t(result.labelKey)}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function LevelUpBanner({ level, techniqueName, label }: { level: number; techniqueName: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-primary/10 px-4 py-3">
      <TrendingUp className="h-5 w-5 text-primary" />
      <span className="text-sm font-semibold text-primary">{label}</span>
      <span className="text-xs text-muted-foreground">{techniqueName} → {getLevelName(level)}</span>
    </div>
  );
}

function XPEarnedDisplay({ breakdown, leveledUp, newTitle, t }: { breakdown: XPBreakdown; leveledUp: boolean; newTitle?: string; t: (key: string, vars?: Record<string, unknown>) => string }) {
  const lines: { label: string; value: number }[] = [
    { label: t("xp.base"), value: breakdown.base },
    { label: t("xp.duration"), value: breakdown.duration },
  ];
  if (breakdown.difficulty > 0) lines.push({ label: t("xp.difficulty"), value: breakdown.difficulty });
  if (breakdown.calmBonus > 0) lines.push({ label: t("xp.calmBonus"), value: breakdown.calmBonus });
  if (breakdown.moodBonus > 0) lines.push({ label: t("xp.moodBonus"), value: breakdown.moodBonus });
  if (breakdown.streakBonus > 0) lines.push({ label: t("xp.streakBonus"), value: breakdown.streakBonus });
  if (breakdown.firstOfDay > 0) lines.push({ label: t("xp.firstOfDay"), value: breakdown.firstOfDay });
  if (breakdown.challengeBonus > 0) lines.push({ label: t("xp.challengeBonus"), value: breakdown.challengeBonus });

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-accent/50 px-5 py-3 w-full max-w-[220px]">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold text-primary">+{breakdown.total} XP</span>
      </div>
      <div className="w-full space-y-0.5">
        {lines.map((l) => (
          <div key={l.label} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{l.label}</span>
            <span className="tabular-nums text-foreground">+{l.value}</span>
          </div>
        ))}
        <div className="border-t border-border my-1" />
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-foreground">{t("xp.total")}</span>
          <span className="tabular-nums text-primary">+{breakdown.total}</span>
        </div>
      </div>
      {leveledUp && newTitle && <span className="text-xs font-medium text-primary">🎉 {newTitle}</span>}
    </div>
  );
}

export default function Session() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const { t, language } = useLanguage();
  const { miniSession, startMiniMode, updateMiniSession, stopMiniSession } = useSessionContext();

  // Playlist support
  const playlistId = params.get("playlist");
  const playlist = useMemo(() => playlistId ? getPlaylists().find(p => p.id === playlistId) : null, [playlistId]);
  const [playlistStepIdx, setPlaylistStepIdx] = useState(0);

  // Program support
  const programId = params.get("program");
  const programDay = params.get("day") ? Number(params.get("day")) : null;
  const paramDuration = params.get("duration") ? Number(params.get("duration")) : null;

  const currentPlaylistStep = playlist?.steps[playlistStepIdx];
  const techniqueId = currentPlaylistStep?.techniqueId || params.get("technique") || "box-breathing";
  const customTechniques = useMemo(() => getCustomTechniques(), [techniqueId]);
  const technique = getTechniqueById(techniqueId, customTechniques) || PRESET_TECHNIQUES[0];

  const techniqueName = useMemo(() => {
    const key = `technique.${technique.id}.name`;
    const translated = t(key);
    return translated !== key ? translated : technique.name;
  }, [technique.id, technique.name, t]);

  const [progressionState, setProgressionState] = useState(() => getProgression(techniqueId));
  const progression = progressionState;
  const basePhases = useMemo(() => getScaledPhases(technique, progression.level), [technique, progression.level]);

  const [state, setState] = useState<SessionState>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [voiceOn, setVoiceOn] = useState(settings.voiceEnabled);
  const [durationMin, setDurationMin] = useState(
    paramDuration || currentPlaylistStep?.durationMinutes || settings.defaultDurationMinutes
  );

  const [currentRound, setCurrentRound] = useState(0);
  const currentPhases = useMemo(() => {
    if (technique.pyramid) return getPyramidPhasesForRound(technique, currentRound);
    return basePhases;
  }, [technique, currentRound, basePhases]);

  const [secondsLeft, setSecondsLeft] = useState(currentPhases[0].duration);

  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const sessionIdRef = useRef(crypto.randomUUID());

  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number } | null>(null);
  const [earnedXP, setEarnedXP] = useState<{ breakdown: XPBreakdown; leveledUp: boolean; newTitle?: string } | null>(null);
  const [journalNote, setJournalNote] = useState("");

  const phaseStartRef = useRef(Date.now());
  const phaseTimestampsRef = useRef<PhaseTimestamp[]>([]);
  const [calmResult, setCalmResult] = useState<CalmScoreResult | null>(null);

  const [nextTechniqueName, setNextTechniqueName] = useState("");

  // ─── Breath Detection State ───
  const [micActive, setMicActive] = useState(false);
  const breathDetectorRef = useRef<BreathDetector | null>(null);
  const [breathFeedback, setBreathFeedback] = useState<RhythmUpdate | null>(null);
  const breathAccuracySamplesRef = useRef<number[]>([]);

  // ─── Heart Rate State ───
  const [hrOpen, setHrOpen] = useState(false);
  const hrBpmSamplesRef = useRef<number[]>([]);
  const hrCoherenceSamplesRef = useRef<number[]>([]);

  // ─── Soundscape State ───
  const [soundscapeType, setSoundscapeType] = useState<SoundscapeType>(
    (settings.soundscapeType as SoundscapeType) || "off"
  );
  const soundscapeEngineRef = useRef(getSoundscapeEngine());

  // ─── Zen Mode State ───
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    const moodParam = params.get("mood");
    if (moodParam) setMoodBefore(Number(moodParam));
  }, [params]);

  const intervalRef = useRef<ReturnType<typeof setTimeout>>();
  const durationMinRef = useRef(durationMin);
  durationMinRef.current = durationMin;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const currentPhasesRef = useRef(currentPhases);
  currentPhasesRef.current = currentPhases;
  const techniqueRef = useRef(technique);
  techniqueRef.current = technique;
  const tRef = useRef(t);
  tRef.current = t;
  const languageRef = useRef(language);
  languageRef.current = language;
  const currentPhase: BreathingPhase = currentPhases[phaseIndex];

  const getPhaseLabel = (phase: BreathingPhase) => t(`phase.${phase.type}`);

  // ─── Breath Detection Controls ───
  const toggleMic = useCallback(async () => {
    if (micActive) {
      breathDetectorRef.current?.stop();
      breathDetectorRef.current = null;
      setMicActive(false);
      setBreathFeedback(null);
      return;
    }

    const detector = new BreathDetector();
    detector.setExpectedPhases(currentPhases.map(p => p.duration));
    detector.onRhythmUpdate((update) => {
      setBreathFeedback(update);
      breathAccuracySamplesRef.current.push(update.accuracy);
    });

    const success = await detector.start();
    if (success) {
      breathDetectorRef.current = detector;
      setMicActive(true);
    } else {
      toast(t("breath.micError"));
    }
  }, [micActive, currentPhases, t]);

  // Cleanup breath detector on unmount
  useEffect(() => {
    return () => {
      breathDetectorRef.current?.stop();
      breathDetectorRef.current = null;
    };
  }, []);

  // ─── Heart Rate Data Handler ───
  const handleHRData = useCallback((bpm: number | null, coherence: number) => {
    if (bpm !== null) hrBpmSamplesRef.current.push(bpm);
    hrCoherenceSamplesRef.current.push(coherence);
  }, []);

  const saveJournal = useCallback(() => {
    if (journalNote.trim()) {
      const allSessions = getSessions();
      const idx = allSessions.findIndex(s => s.id === sessionIdRef.current);
      if (idx >= 0) {
        allSessions[idx].journal = journalNote.trim();
        localStorage.setItem("breathe_sessions", JSON.stringify(allSessions));
      }
    }
  }, [journalNote]);

  const finishSession = useCallback(() => {
    clearTimeout(intervalRef.current);
    stopSpeaking();

    // Stop soundscape
    soundscapeEngineRef.current.stop();

    // Exit zen mode
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setZenMode(false);

    // Stop breath detector
    breathDetectorRef.current?.stop();
    breathDetectorRef.current = null;
    setMicActive(false);

    const now = Date.now();
    const actualDuration = (now - phaseStartRef.current) / 1000;
    phaseTimestampsRef.current.push({ phaseIndex, expectedDuration: currentPhases[phaseIndex].duration, actualDuration });

    const calm = calculateCalmScore(phaseTimestampsRef.current);
    setCalmResult(calm);

    const result = updateProgression(technique.id, completedCycles);
    if (result.leveledUp) setLevelUpInfo({ level: result.newLevel });

    // Calculate breath accuracy average
    const breathSamples = breathAccuracySamplesRef.current;
    const avgBreathAccuracy = breathSamples.length > 0
      ? Math.round(breathSamples.reduce((a, b) => a + b, 0) / breathSamples.length)
      : undefined;

    // Calculate HR averages
    const hrSamples = hrBpmSamplesRef.current;
    const avgHR = hrSamples.length > 0
      ? Math.round(hrSamples.reduce((a, b) => a + b, 0) / hrSamples.length)
      : undefined;
    const hrCoherenceSamples = hrCoherenceSamplesRef.current;
    const avgCoherence = hrCoherenceSamples.length > 0
      ? Math.round(hrCoherenceSamples.reduce((a, b) => a + b, 0) / hrCoherenceSamples.length)
      : undefined;

    const elapsed = elapsedRef.current;

    // Re-read progression after update
    setProgressionState(getProgression(technique.id));

    if (elapsed > 10) {
      addSession({
        id: sessionIdRef.current,
        techniqueId: technique.id,
        techniqueName: techniqueName,
        date: new Date().toISOString(),
        durationSeconds: elapsed,
        completedCycles,
        moodBefore: moodBefore ?? undefined,
        moodAfter: undefined,
        calmScore: calm.score,
        breathAccuracy: avgBreathAccuracy,
        avgHeartRate: avgHR,
        heartCoherence: avgCoherence,
      });

      const challengesCompleted = getCompletedChallengeCount();
      const breakdown = calculateSessionXP(elapsed, technique, calm.score, challengesCompleted, undefined, moodBefore ?? undefined, undefined);
      const xpResult = addXP(breakdown.total, techniqueName);
      const xpState = getXPState();
      setEarnedXP({
        breakdown,
        leveledUp: xpResult.newLevel > xpResult.previousLevel,
        newTitle: xpResult.newLevel > xpResult.previousLevel ? t(`xp.${xpState.title}`) : undefined,
      });

      const newBadges = getNewlyUnlocked();
      newBadges.forEach((badge) => {
        toast(`${badge.emoji} ${t(`badge.${badge.id}.name`)} ${t("session.badgeUnlocked")}`, {
          description: t(`badge.${badge.id}.description`),
        });
      });
    }

    if (programId && programDay) {
      completeDay(programId, programDay);
    }

    vibrateDone();
  }, [completedCycles, technique, moodBefore, phaseIndex, currentPhases, programId, programDay, t, techniqueName]);

  const stop = useCallback(() => {
    finishSession();

    if (playlist && playlistStepIdx < playlist.steps.length - 1) {
      const nextStep = playlist.steps[playlistStepIdx + 1];
      const nextTech = getTechniqueById(nextStep.techniqueId, getCustomTechniques());
      const nextKey = `technique.${nextStep.techniqueId}.name`;
      const nextTranslated = t(nextKey);
      setNextTechniqueName(nextTranslated !== nextKey ? nextTranslated : (nextTech?.name || nextStep.techniqueId));
      setState("playlist-transition");
      return;
    }

    setState("done");
  }, [finishSession, playlist, playlistStepIdx, t]);

  const advancePlaylist = () => {
    if (!playlist) return;
    const nextIdx = playlistStepIdx + 1;
    const nextStep = playlist.steps[nextIdx];
    setPlaylistStepIdx(nextIdx);
    setDurationMin(nextStep.durationMinutes);

    sessionIdRef.current = crypto.randomUUID();
    setPhaseIndex(0);
    setTotalElapsed(0);
    setCompletedCycles(0);
    setCurrentRound(0);
    phaseTimestampsRef.current = [];
    phaseStartRef.current = Date.now();
    setCalmResult(null);
    setLevelUpInfo(null);
    setEarnedXP(null);
    breathAccuracySamplesRef.current = [];
    hrBpmSamplesRef.current = [];
    hrCoherenceSamplesRef.current = [];

    const nextTech = getTechniqueById(nextStep.techniqueId, getCustomTechniques()) || PRESET_TECHNIQUES[0];
    const nextPhases = getScaledPhases(nextTech, getProgression(nextStep.techniqueId).level);
    setSecondsLeft(nextPhases[0].duration);

    setState("running");
    if (voiceOn) speak(t(`phase.${nextPhases[0].type}`), settings.voiceSpeed, language);
    if (settings.vibrationEnabled) vibratePhaseChange();
  };

  const tick = useCallback(() => {
    const phases = currentPhasesRef.current;
    const techObj = techniqueRef.current;
    const voice = voiceOnRef.current;
    const setts = settingsRef.current;
    const round = currentRoundRef.current;
    const lang = languageRef.current;
    const tFn = tRef.current;

    // Read current values from refs (synchronous, no closures)
    let sl = secondsLeftRef.current;
    let pi = phaseIndexRef.current;

    if (sl <= 1) {
      // Phase transition
      const now = Date.now();
      const actualDuration = (now - phaseStartRef.current) / 1000;
      phaseTimestampsRef.current.push({ phaseIndex: pi, expectedDuration: phases[pi].duration, actualDuration });

      const next = (pi + 1) % phases.length;
      let newCycles = completedCyclesRef.current;
      let newRound = round;

      if (next === 0) {
        newCycles += 1;
        if (techObj.pyramid) newRound = round + 1;
      }

      const nextRoundPhases = techObj.pyramid && next === 0
        ? getPyramidPhasesForRound(techObj, newRound)
        : phases;
      const nextPhase = nextRoundPhases[next];

      // Update refs immediately for consistency
      secondsLeftRef.current = nextPhase.duration;
      phaseIndexRef.current = next;
      phaseStartRef.current = Date.now();

      // Flat setState calls (no nesting)
      setSecondsLeft(nextPhase.duration);
      setPhaseIndex(next);
      setCompletedCycles(newCycles);
      if (next === 0 && techObj.pyramid) setCurrentRound(newRound);

      breathDetectorRef.current?.notifyPhaseChange(next);
      soundscapeEngineRef.current.syncToPhase(nextPhase.type);

      if (setts.vibrationEnabled) vibratePhaseChange();
      if (voice) speak(tFn(`phase.${nextPhase.type}`), setts.voiceSpeed, lang);
    } else {
      // Normal countdown
      secondsLeftRef.current = sl - 1;
      setSecondsLeft(sl - 1);
    }

    setTotalElapsed((te) => te + 1);
  }, []);

  const start = () => {
    sessionIdRef.current = crypto.randomUUID();
    setPhaseIndex(0);
    setSecondsLeft(currentPhases[0].duration);
    setTotalElapsed(0);
    setCompletedCycles(0);
    setCurrentRound(0);
    setMoodAfter(null);
    setMoodSaved(false);
    setLevelUpInfo(null);
    setEarnedXP(null);
    setCalmResult(null);
    setJournalNote("");
    phaseTimestampsRef.current = [];
    phaseStartRef.current = Date.now();
    breathAccuracySamplesRef.current = [];
    hrBpmSamplesRef.current = [];
    hrCoherenceSamplesRef.current = [];
    setBreathFeedback(null);
    setState("running");
    // Start soundscape
    if (soundscapeType !== "off") {
      soundscapeEngineRef.current.start(soundscapeType, settings.soundscapeVolume ?? 0.5);
    }
    if (voiceOn) speak(t(`phase.${currentPhases[0].type}`), settings.voiceSpeed, language);
    if (settings.vibrationEnabled) vibratePhaseChange();
  };

  const pause = () => {
    clearTimeout(intervalRef.current);
    setState("paused");
    stopSpeaking();
    // Mute soundscape on pause
    soundscapeEngineRef.current.setVolume(0);
  };

  const resume = () => {
    setState("running");
    phaseStartRef.current = Date.now();
    // Restore soundscape volume on resume
    soundscapeEngineRef.current.setVolume(settings.soundscapeVolume ?? 0.5);
    if (voiceOn) speak(getPhaseLabel(currentPhase), settings.voiceSpeed, language);
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
    // Also update the session record with moodAfter
    const allSessions = getSessions();
    const idx = allSessions.findIndex(s => s.id === sessionIdRef.current);
    if (idx >= 0) {
      allSessions[idx].moodAfter = mood;
      localStorage.setItem("breathe_sessions", JSON.stringify(allSessions));
    }
    setMoodSaved(true);
  };

  const handleShare = async () => {
    await shareOrDownloadCard({
      techniqueName,
      durationMinutes: Math.round(totalElapsed / 60),
      cycles: completedCycles,
      calmScore: calmResult?.score,
      date: new Date().toISOString(),
    }, language);
  };

  // ─── Zen Mode Controls ───
  const toggleZenMode = useCallback(() => {
    if (zenMode) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setZenMode(false);
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
      setZenMode(true);
    }
  }, [zenMode]);

  // Listen for fullscreen exit (e.g. pressing Escape)
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setZenMode(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Soundscape cleanup is handled in the mini-mode unmount handler below

  // Add/remove zen-mode class on body for BottomNav hiding
  useEffect(() => {
    document.body.classList.toggle("zen-mode", zenMode);
    return () => { document.body.classList.remove("zen-mode"); };
  }, [zenMode]);

  useEffect(() => {
    if (state === "running") {
      let expected = Date.now() + 1000;
      const run = () => {
        tick();
        const drift = Date.now() - expected;
        expected += 1000;
        intervalRef.current = setTimeout(run, Math.max(0, 1000 - drift));
      };
      intervalRef.current = setTimeout(run, 1000);
    }
    return () => clearTimeout(intervalRef.current);
  }, [state, tick]);

  // Auto-stop when duration reached (moved out of setState callback)
  useEffect(() => {
    if (state === "running" && totalElapsed >= durationMin * 60) {
      stop();
    }
  }, [totalElapsed, state, durationMin, stop]);

  // ─── Keyboard Shortcuts ───
  useKeyboardShortcuts({
    sessionActive: state === "running" || state === "paused",
    onSpace: () => {
      if (state === "idle") start();
      else if (state === "running") pause();
      else if (state === "paused") resume();
    },
    onEscape: () => {
      if (zenMode) toggleZenMode();
      else if (state === "running" || state === "paused") stop();
    },
    onF: () => {
      if (state === "running" || state === "paused") toggleZenMode();
    },
    onM: () => {
      setVoiceOn((v) => { if (v) stopSpeaking(); return !v; });
    },
    onS: () => {
      setSoundscapeType((prev) => {
        if (prev !== "off") {
          soundscapeEngineRef.current.stop();
          return "off";
        }
        // Restore to the settings default
        const restored = (settings.soundscapeType as SoundscapeType) || "rain";
        if (restored !== "off" && (state === "running" || state === "paused")) {
          soundscapeEngineRef.current.start(restored, settings.soundscapeVolume ?? 0.5);
        }
        return restored;
      });
    },
    onNavigate: (path) => navigate(path),
  });

  // ─── Mini-Player Sync ───
  // On mount, restore from mini session if running
  useEffect(() => {
    if (miniSession?.isActive && miniSession.techniqueId === techniqueId) {
      setTotalElapsed(miniSession.elapsed);
      setPhaseIndex(miniSession.phaseIndex);
      setSecondsLeft(miniSession.secondsLeft);
      setCompletedCycles(miniSession.completedCycles);
      setCurrentRound(miniSession.currentRound);
      setDurationMin(miniSession.durationMin);
      setMoodBefore(miniSession.moodBefore);
      setVoiceOn(miniSession.voiceOn);
      setSoundscapeType(miniSession.soundscapeType as SoundscapeType);
      phaseStartRef.current = Date.now();
      if (miniSession.isPaused) {
        setState("paused");
      } else {
        setState("running");
        // Restart soundscape if it was playing
        if (miniSession.soundscapeType !== "off") {
          soundscapeEngineRef.current.start(miniSession.soundscapeType as SoundscapeType, settings.soundscapeVolume ?? 0.5);
        }
      }
      stopMiniSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to mini-player context when navigating away
  useEffect(() => {
    return () => {
      // This runs on unmount — if session is running/paused, start mini mode
    };
  }, []);

  // We use refs to track current state for the unmount effect
  const stateRef = useRef(state);
  stateRef.current = state;
  const elapsedRef = useRef(totalElapsed);
  elapsedRef.current = totalElapsed;
  const phaseRef = useRef(currentPhase);
  phaseRef.current = currentPhase;
  const phaseIndexRef = useRef(phaseIndex);
  phaseIndexRef.current = phaseIndex;
  const secondsLeftRef = useRef(secondsLeft);
  secondsLeftRef.current = secondsLeft;
  const completedCyclesRef = useRef(completedCycles);
  completedCyclesRef.current = completedCycles;
  const currentRoundRef = useRef(currentRound);
  currentRoundRef.current = currentRound;
  // durationMinRef already declared above
  const moodBeforeRef = useRef(moodBefore);
  moodBeforeRef.current = moodBefore;
  const voiceOnRef = useRef(voiceOn);
  voiceOnRef.current = voiceOn;
  const soundscapeTypeRef = useRef(soundscapeType);
  soundscapeTypeRef.current = soundscapeType;

  useEffect(() => {
    return () => {
      if (stateRef.current === "running" || stateRef.current === "paused") {
        // Entering mini mode — keep soundscape alive for restore
        startMiniMode({
          isActive: true,
          isPaused: stateRef.current === "paused",
          techniqueId: technique.id,
          techniqueName: technique.name,
          currentPhase: phaseRef.current.type,
          elapsed: elapsedRef.current,
          totalDuration: durationMinRef.current,
          phaseIndex: phaseIndexRef.current,
          secondsLeft: secondsLeftRef.current,
          completedCycles: completedCyclesRef.current,
          currentRound: currentRoundRef.current,
          durationMin: durationMinRef.current,
          moodBefore: moodBeforeRef.current,
          voiceOn: voiceOnRef.current,
          soundscapeType: soundscapeTypeRef.current,
        });
      } else {
        // Not entering mini mode — clean up soundscape
        soundscapeEngineRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [technique.id, technique.name]);

  const elapsedDisplay = `${Math.floor(totalElapsed / 60)}:${String(totalElapsed % 60).padStart(2, "0")}`;
  const targetDisplay = `${durationMin}:00`;
  const moodImprovement = moodBefore !== null && moodAfter !== null ? moodAfter - moodBefore : null;
  const activePhase = state === "idle" ? "idle" as const : currentPhase.type;

  // Done screen extra data
  const avgBreathAccuracy = breathAccuracySamplesRef.current.length > 0
    ? Math.round(breathAccuracySamplesRef.current.reduce((a, b) => a + b, 0) / breathAccuracySamplesRef.current.length)
    : null;
  const avgHR = hrBpmSamplesRef.current.length > 0
    ? Math.round(hrBpmSamplesRef.current.reduce((a, b) => a + b, 0) / hrBpmSamplesRef.current.length)
    : null;
  const avgHRCoherence = hrCoherenceSamplesRef.current.length > 0
    ? Math.round(hrCoherenceSamplesRef.current.reduce((a, b) => a + b, 0) / hrCoherenceSamplesRef.current.length)
    : null;

  const VIZ_OPTIONS: { id: VisualizationType; icon: typeof Circle; labelKey: string }[] = [
    { id: "circle", icon: Circle, labelKey: "viz.circle" },
    { id: "wave", icon: Waves, labelKey: "viz.wave" },
    { id: "bars", icon: BarChart3, labelKey: "viz.bars" },
    { id: "mandala", icon: Flower2, labelKey: "viz.mandala" },
  ];

  // Playlist transition screen
  if (state === "playlist-transition") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-24">
        <div className="text-center space-y-6">
          <SkipForward className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <div>
            <p className="text-sm text-muted-foreground">{t("session.nextUp")}</p>
            <h2 className="text-2xl font-bold text-foreground">{nextTechniqueName}</h2>
            <p className="text-sm text-muted-foreground">
              {t("session.step", { current: playlistStepIdx + 2, total: playlist!.steps.length })}
            </p>
          </div>
          <Button size="lg" className="rounded-full px-8 gap-2" onClick={advancePlaylist}>
            <Play className="h-5 w-5" /> {t("session.continue")}
          </Button>
        </div>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-24">
        <div className="text-center space-y-5">
          <div className="text-5xl">🙏</div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t("session.done.title")}</h2>
            <p className="mt-1 text-muted-foreground">{t(completedCycles === 1 ? "session.done.stats_one" : "session.done.stats", { min: Math.round(totalElapsed / 60), cycles: completedCycles })}</p>
            <p className="text-sm text-muted-foreground">{techniqueName}</p>
            {playlist && <p className="text-xs text-primary mt-1">{t("session.done.playlistComplete")}</p>}
            {programId && programDay && <p className="text-xs text-primary mt-1">{t("session.done.dayComplete", { day: programDay })}</p>}
            <span className="inline-block mt-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
              {t("common.levelShort", { level: levelUpInfo ? levelUpInfo.level : progression.level })} {t(`level.${getLevelName(levelUpInfo ? levelUpInfo.level : progression.level)}`)}
            </span>
          </div>

          {levelUpInfo && <LevelUpBanner level={levelUpInfo.level} techniqueName={techniqueName} label={t("session.levelUp")} />}
          {calmResult && <CalmScoreDisplay result={calmResult} label={t("session.calmScore")} t={t} />}
          {earnedXP && <XPEarnedDisplay breakdown={earnedXP.breakdown} leveledUp={earnedXP.leveledUp} newTitle={earnedXP.newTitle} t={t} />}

          {/* Breath accuracy in done screen */}
          {avgBreathAccuracy !== null && (
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{t("breath.rhythmAccuracy")}</span>
              </div>
              <div className="text-2xl font-bold text-primary">{avgBreathAccuracy}%</div>
            </div>
          )}

          {/* Heart rate in done screen */}
          {avgHR !== null && (
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Heart className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-foreground">{t("heart.avgBPM")}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{avgHR} <span className="text-sm font-normal text-muted-foreground">BPM</span></div>
              {avgHRCoherence !== null && (
                <p className="text-xs text-muted-foreground">{t("heart.coherence")}: {avgHRCoherence}%</p>
              )}
            </div>
          )}

          <div>
            {!moodSaved ? (
              <MoodPicker selected={moodAfter} onSelect={handleMoodAfter} label={t("session.moodAfter")} />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">{getMoodEmoji(moodAfter!)}</span>
                {moodImprovement !== null && moodImprovement > 0 && <span className="text-sm font-medium text-primary">{t("session.moodBoost", { improvement: moodImprovement })}</span>}
                {moodImprovement !== null && moodImprovement === 0 && <span className="text-sm text-muted-foreground">{t("session.moodMaintained")}</span>}
                {moodImprovement !== null && moodImprovement < 0 && <span className="text-sm text-muted-foreground">{t("session.keepPracticing")}</span>}
              </div>
            )}
          </div>

          <div className="w-full max-w-xs">
            <Textarea
              placeholder={t("session.journal.placeholder")}
              value={journalNote}
              onChange={(e) => setJournalNote(e.target.value)}
              className="min-h-[60px] resize-none bg-secondary/50 border-border text-sm"
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" size="sm" className="gap-1" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> {t("session.share")}
            </Button>
            <Button variant="secondary" onClick={() => {
              saveJournal();
              sessionIdRef.current = crypto.randomUUID();
              setState("idle"); setMoodBefore(null); setMoodAfter(null); setMoodSaved(false); setLevelUpInfo(null); setEarnedXP(null); setCalmResult(null); setJournalNote("");
            }}>{t("session.again")}</Button>
            <Button onClick={() => {
              saveJournal();
              if (programId) navigate("/programs");
              else navigate("/");
            }}>{t("session.done.button")}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 pb-24 overflow-hidden">
      <ScreenColorBreathing phase={activePhase} phaseDuration={currentPhase.duration} />
      <ParticleBackground phase={activePhase} phaseDuration={currentPhase.duration} />

      {/* Heart Rate Overlay */}
      <HeartRateMonitorOverlay
        open={hrOpen}
        onClose={() => setHrOpen(false)}
        onData={handleHRData}
        currentPhase={currentPhase.type}
      />

      {/* Zen mode exit button */}
      {zenMode && (
        <button
          onClick={toggleZenMode}
          className="fixed top-4 right-4 z-50 rounded-full bg-card/50 p-2 text-muted-foreground backdrop-blur-sm hover:text-foreground transition-opacity opacity-30 hover:opacity-100"
          aria-label={t("session.exitZen")}
        >
          <Minimize2 className="h-5 w-5" />
        </button>
      )}

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Playlist progress bar */}
        {!zenMode && playlist && state !== "idle" && (
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{t("session.step", { current: playlistStepIdx + 1, total: playlist.steps.length })}</span>
              <span className="text-xs text-primary font-medium">{techniqueName}</span>
            </div>
            <div className="flex gap-1">
              {playlist.steps.map((_, i) => (
                <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= playlistStepIdx ? "bg-primary" : "bg-muted")} />
              ))}
            </div>
          </div>
        )}

        {!zenMode && (
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">{techniqueName}</h2>
            <span className="text-xs text-muted-foreground">
              {t("common.levelShort", { level: progression.level })} {t(`level.${getLevelName(progression.level)}`)}
            </span>
            {technique.pyramid && state !== "idle" && (
              <p className="text-xs text-primary mt-0.5">{t("session.round", { round: currentRound + 1 })}</p>
            )}
            {progression.level < 5 && (
              <div className="mx-auto mt-1 w-32">
                <Progress value={getLevelProgress(progression)} className="h-1.5" />
              </div>
            )}
          </div>
        )}

        {state === "idle" && (
          <MoodPicker selected={moodBefore} onSelect={setMoodBefore} label={t("mood.howFeeling")} compact />
        )}

        <BreathingVisualizer
          key={`${phaseIndex}-${completedCycles}`}
          phase={activePhase}
          phaseDuration={currentPhase.duration}
          label={state === "idle" ? t("session.ready") : getPhaseLabel(currentPhase)}
          secondsLeft={state === "idle" ? 0 : secondsLeft}
        />

        {/* Phase label in zen mode */}
        {zenMode && state !== "idle" && (
          <p className="text-lg font-medium text-foreground/80">{getPhaseLabel(currentPhase)}</p>
        )}

        {/* Breathing feedback overlay */}
        {micActive && breathFeedback && state === "running" && (
          <BreathingFeedback
            volume={breathFeedback.volume}
            accuracy={breathFeedback.accuracy}
            isBreathing={breathFeedback.isBreathing}
          />
        )}

        {!zenMode && (
          <div className="text-center" aria-live="polite" aria-atomic="true">
            <span className="text-sm tabular-nums text-muted-foreground">{elapsedDisplay} / {targetDisplay}</span>
            {state !== "idle" && <p className="text-xs text-muted-foreground">{t("session.cycles", { count: completedCycles })}</p>}
          </div>
        )}

        {state === "idle" && (
          <>
            <div className="flex gap-2 items-center flex-wrap justify-center">
              {[2, 3, 5, 10, 15, 20].map((m) => (
                <button
                  key={m}
                  onClick={() => setDurationMin(m)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    durationMin === m ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {m} {t("common.min")}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={60}
                value={![2, 3, 5, 10, 15, 20].includes(durationMin) ? durationMin : ""}
                placeholder="+"
                onChange={(e) => {
                  const v = Math.max(1, Math.min(60, Number(e.target.value) || 1));
                  setDurationMin(v);
                }}
                className="w-10 h-7 rounded-full text-center text-xs font-medium bg-secondary text-secondary-foreground border-0 focus:ring-1 focus:ring-primary"
                aria-label={t("session.customDuration")}
              />
            </div>

            <div className="flex gap-1.5">
              {VIZ_OPTIONS.map(({ id, icon: Icon, labelKey }) => (
                <button
                  key={id}
                  onClick={() => update({ visualizationType: id })}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    settings.visualizationType === id
                      ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                      : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                  )}
                  title={t(labelKey)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t(labelKey)}</span>
                </button>
              ))}
            </div>

            {/* Soundscape picker (idle only - no volume slider needed) */}
            <SoundscapePicker
              value={soundscapeType}
              onChange={(type) => setSoundscapeType(type)}
              compact
            />
          </>
        )}

        {/* Soundscape controls during active session */}
        {(state === "running" || state === "paused") && !zenMode && (
          <div className="flex items-center gap-2">
            <SoundscapePicker
              value={soundscapeType}
              onChange={(type) => {
                setSoundscapeType(type);
                soundscapeEngineRef.current.stop();
                if (type !== "off") {
                  soundscapeEngineRef.current.start(type, settings.soundscapeVolume ?? 0.5);
                }
              }}
              compact
            />
            {soundscapeType !== "off" && (
              <div className="flex items-center gap-1.5 min-w-[80px]">
                <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={[settings.soundscapeVolume ?? 0.5]}
                  onValueChange={([v]) => {
                    soundscapeEngineRef.current.setVolume(v);
                  }}
                  onValueCommit={([v]) => {
                    update({ soundscapeVolume: v });
                  }}
                  className="w-16"
                />
              </div>
            )}
          </div>
        )}

        {!zenMode && (
          <div className="flex items-center gap-4">
            {state === "idle" ? (
              <Button size="lg" onClick={start} className="gap-2 rounded-full px-8">
                <Play className="h-5 w-5" /> {t("session.start")}
              </Button>
            ) : state === "running" ? (
              <>
                <Button size="icon" variant="secondary" onClick={pause} className="h-12 w-12 rounded-full" aria-label={t("session.pause")}>
                  <Pause className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="destructive" onClick={stop} className="h-12 w-12 rounded-full" aria-label={t("session.stop")}>
                  <Square className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button size="icon" variant="secondary" onClick={resume} className="h-12 w-12 rounded-full" aria-label={t("session.resume")}>
                  <Play className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="destructive" onClick={stop} className="h-12 w-12 rounded-full" aria-label={t("session.stop")}>
                  <Square className="h-5 w-5" />
                </Button>
              </>
            )}

            <button
              onClick={() => { setVoiceOn(!voiceOn); if (voiceOn) stopSpeaking(); }}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground"
              aria-label={voiceOn ? t("session.voiceMute") : t("session.voiceUnmute")}
            >
              {voiceOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            {/* Mic toggle */}
            <button
              onClick={toggleMic}
              className={cn(
                "rounded-full p-2 transition-colors",
                micActive ? "text-primary bg-primary/15" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={micActive ? t("breath.micOn") : t("breath.micOff")}
            >
              {micActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>

            {/* Heart rate toggle */}
            <button
              onClick={() => setHrOpen(true)}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground"
              aria-label={t("heart.monitor")}
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* Zen mode toggle */}
            {state !== "idle" && (
              <button
                onClick={toggleZenMode}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground"
                aria-label={t("session.zenMode")}
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
