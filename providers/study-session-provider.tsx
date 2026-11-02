"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  startSession,
  endSession,
} from "@/features/study-sessions/actions/study-sessions.actions";

function subscribeClock(listener: () => void) {
  const timer = setInterval(listener, 1000);
  return () => clearInterval(timer);
}
const getClockSnapshot = () => Math.floor(Date.now() / 1000);
const getServerClockSnapshot = () => 0;

export type ActiveStudySession = {
  id: string;
  started_at: string;
  cluster_id: string | null;
};

type StudySessionContextValue = {
  isRunning: boolean;
  isLoading: boolean;
  isHydrating: boolean;
  sessionId: string | null;
  startedAt: string | null;
  selectedCluster: string | null;
  setSelectedCluster: (id: string | null) => void;
  elapsedSeconds: number;
  start: () => Promise<boolean>;
  stop: () => Promise<number | null>;
};

const StudySessionContext = createContext<StudySessionContextValue | null>(
  null,
);

export function StudySessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: ActiveStudySession | null;
}) {
  const [sessionId, setSessionId] = useState<string | null>(
    initialSession?.id ?? null,
  );
  const [startedAt, setStartedAt] = useState<string | null>(
    initialSession?.started_at ?? null,
  );
  const [runningClusterId, setRunningClusterId] = useState<string | null>(
    initialSession?.cluster_id ?? null,
  );
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isHydrating = false;
  const subscribe = useCallback(
    (listener: () => void) => (sessionId ? subscribeClock(listener) : () => {}),
    [sessionId],
  );
  const now = useSyncExternalStore(
    subscribe,
    getClockSnapshot,
    getServerClockSnapshot,
  );

  const isRunning = sessionId !== null && startedAt !== null;
  const elapsedSeconds = isRunning
    ? Math.max(0, now - Math.floor(new Date(startedAt!).getTime() / 1000))
    : 0;

  const start = useCallback(async () => {
    if (isRunning || isLoading) return false;

    setIsLoading(true);
    const result = await startSession(selectedCluster);
    setIsLoading(false);

    if (result.error || !result.data) return false;

    setSessionId(result.data.id);
    setStartedAt(result.data.started_at);
    setRunningClusterId(selectedCluster);
    return true;
  }, [isRunning, isLoading, selectedCluster]);

  const stop = useCallback(async () => {
    if (!sessionId || isLoading) return null;

    setIsLoading(true);
    const result = await endSession(sessionId);
    setIsLoading(false);

    if (result.error || !result.data) return null;

    setSessionId(null);
    setStartedAt(null);
    setRunningClusterId(null);

    return result.data.duration_minutes;
  }, [sessionId, isLoading]);

  return (
    <StudySessionContext.Provider
      value={{
        isRunning,
        isLoading,
        isHydrating,
        sessionId,
        startedAt,
        selectedCluster: isRunning ? runningClusterId : selectedCluster,
        setSelectedCluster,
        elapsedSeconds,
        start,
        stop,
      }}
    >
      {children}
    </StudySessionContext.Provider>
  );
}

export function useStudySession() {
  const ctx = useContext(StudySessionContext);
  if (!ctx) {
    throw new Error("useStudySession must be used within StudySessionProvider");
  }
  return ctx;
}
