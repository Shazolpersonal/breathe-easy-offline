import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface MiniSessionState {
  isActive: boolean;
  isPaused: boolean;
  techniqueId: string;
  techniqueName: string;
  currentPhase: string;
  elapsed: number;
  totalDuration: number;
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

  const startMiniMode = useCallback((state: MiniSessionState) => {
    setMiniSession(state);
  }, []);

  const updateMiniSession = useCallback((partial: Partial<MiniSessionState>) => {
    setMiniSession((prev) => (prev ? { ...prev, ...partial } : null));
  }, []);

  const stopMiniSession = useCallback(() => {
    setMiniSession(null);
  }, []);

  return (
    <SessionContext.Provider value={{ miniSession, startMiniMode, updateMiniSession, stopMiniSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  return useContext(SessionContext);
}
