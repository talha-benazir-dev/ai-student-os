"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  startSession,
  endSession,
  getActiveSession,
} from "@/features/study-sessions/actions/study-sessions.actions";

const STORAGE_KEY = "nucleus-active-study-session";

type StoredSession = {
  sessionId: string;
  startedAt: string;
  clusterId: string | null;
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

const StudySessionContext = createContext<StudySessionContextValue | null>(null);

function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function writeStoredSession(session: StoredSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

function applySession(
  session: StoredSession,
  setSessionId: (id: string) => void,
  setStartedAt: (at: string) => void,
  setRunningClusterId: (id: string | null) => void,
) {
  setSessionId(session.sessionId);
  setStartedAt(session.startedAt);
  setRunningClusterId(session.clusterId);
}

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [runningClusterId, setRunningClusterId] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isRunning = sessionId !== null && startedAt !== null;

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const stored = readStoredSession();
      if (stored) {
        applySession(stored, setSessionId, setStartedAt, setRunningClusterId);
      }

      const result = await getActiveSession();
      if (cancelled) return;

      if (result.data) {
        const session: StoredSession = {
          sessionId: result.data.id,
          startedAt: result.data.started_at,
          clusterId: result.data.cluster_id,
        };
        applySession(session, setSessionId, setStartedAt, setRunningClusterId);
        writeStoredSession(session);
      } else {
        setSessionId(null);
        setStartedAt(null);
        setRunningClusterId(null);
        writeStoredSession(null);
      }

      setIsHydrating(false);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isRunning || !startedAt) {
      setElapsedSeconds(0);
      return;
    }

    const tick = () => {
      setElapsedSeconds(
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
      );
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, startedAt]);

  const start = useCallback(async () => {
    if (isRunning || isLoading) return false;

    setIsLoading(true);
    const result = await startSession(selectedCluster);
    setIsLoading(false);

    if (result.error || !result.data) return false;

    const session: StoredSession = {
      sessionId: result.data.id,
      startedAt: result.data.started_at,
      clusterId: selectedCluster,
    };

    applySession(session, setSessionId, setStartedAt, setRunningClusterId);
    writeStoredSession(session);
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
    writeStoredSession(null);

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
