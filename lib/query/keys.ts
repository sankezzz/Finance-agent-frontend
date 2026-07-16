// Centralized query-key factory so keys stay consistent across the app.

export const queryKeys = {
  user: (userId: string) => ["user", userId] as const,
  documents: (userId: string) => ["documents", userId] as const,
  run: (runId: string) => ["run", runId] as const,
  dashboard: (userId: string) => ["dashboard", userId] as const,
};
