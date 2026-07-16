"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";

/**
 * Reads the stored user_id / run_id after mount (localStorage is client-only,
 * so `ready` guards against SSR/hydration mismatch).
 */
export function useSession() {
  const [ready, setReady] = useState(false);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [runId, setRunIdState] = useState<string | null>(null);

  useEffect(() => {
    setUserIdState(storage.getUserId());
    setRunIdState(storage.getRunId());
    setReady(true);
  }, []);

  return {
    ready,
    userId,
    runId,
    setUserId: (id: string | null) => {
      storage.setUserId(id);
      setUserIdState(id);
    },
    setRunId: (id: string | null) => {
      storage.setRunId(id);
      setRunIdState(id);
    },
    reset: () => {
      storage.clear();
      setUserIdState(null);
      setRunIdState(null);
    },
  };
}

/** Redirect to `/onboarding` once we know there is no stored user. */
export function useRequireUser() {
  const router = useRouter();
  const session = useSession();
  useEffect(() => {
    if (session.ready && !session.userId) router.replace("/onboarding");
  }, [session.ready, session.userId, router]);
  return session;
}
