// Typed localStorage for the two values that must survive navigation.
// No auth (MVP): user_id is the identity we send on every request.

const KEYS = {
  userId: "fac.user_id",
  runId: "fac.run_id",
} as const;

function get(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // storage disabled / full — best effort
  }
}

export const storage = {
  getUserId: () => get(KEYS.userId),
  setUserId: (id: string | null) => set(KEYS.userId, id),
  getRunId: () => get(KEYS.runId),
  setRunId: (id: string | null) => set(KEYS.runId, id),
  clear: () => {
    set(KEYS.userId, null);
    set(KEYS.runId, null);
  },
};
