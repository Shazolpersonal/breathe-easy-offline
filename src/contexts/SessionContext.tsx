import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { addSession } from "@/lib/storage";
import { updateProgression } from "@/lib/progression";

export interface MiniSessionState {
  isActive: boolean;
  isPaused: boolean;
  techniqueId: string;
  techniqueName: string;
  currentPhase: string;
  elapsed: number;
  totalDuration: number;
  // Extended state for full restore
  phaseIndex: number;
  secondsLeft: number;
  completedCycles: number;
  currentRound: number;
  durationMin: number;
  moodBefore: number | null;
  voiceOn: boolean;
  soundscapeType: string;
}

interface SessionContextType {
  miniSession: MiniSessionState | null;
  startMiniMode: (state: MiniSessionState) => void;
  updateMiniSession: (partial: Partial<MiniSessionState>) => void;
  stopMiniSession: () => void;
}

const SessionContext = createContext<SessionContextType>({
  miniSession: null,
  startMiniMode: () => {},
  updateMiniSession: () => {},
  stopMiniSession: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [miniSession, setMiniSession] = useState<MiniSessionState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const startMiniMode = useCallback((state: MiniSessionState) => {
    setMiniSession(state);
  }, []);

  const updateMiniSession = useCallback((partial: Partial<MiniSessionState>) => {
    setMiniSession((prev) => (prev ? { ...prev, ...partial } : null));
  }, []);

  const stopMiniSession = useCallback(() => {
    setMiniSession(null);
  }, []);

  // Timer: tick elapsed every second when mini session is active and not paused
  useEffect(() => {
    if (miniSession?.isActive && !miniSession.isPaused) {
      intervalRef.current = setInterval(() => {
        setMiniSession((prev) => {
          if (!prev || prev.isPaused || !prev.isActive) return prev;
          const newElapsed = prev.elapsed + 1;
          // Auto-stop if exceeded total duration — save session before clearing
          if (newElapsed >= prev.totalDuration * 60) {
            // Save the session so it isn't lost
            if (newElapsed > 10) {
              addSession({
                id: crypto.randomUUID(),
                techniqueId: prev.techniqueId,
                techniqueName: prev.techniqueName,
                date: new Date().toISOString(),
                durationSeconds: newElapsed,
                completedCycles: prev.completedCycles,
                moodBefore: prev.moodBefore ?? undefined,
              });
              updateProgression(prev.techniqueId, prev.completedCycles);
            }
            return null;
          }
          return { ...prev, elapsed: newElapsed };
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [miniSession?.isActive, miniSession?.isPaused]);

  return (
    <SessionContext.Provider value={{ miniSession, startMiniMode, updateMiniSession, stopMiniSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  return useContext(SessionContext);
}
