"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createRun,
  getDashboard,
  getRun,
  getUser,
  listDocuments,
  onboard,
  sendChat,
  uploadDocument,
} from "@/lib/api/endpoints";
import type {
  ChatRequest,
  CreateRunRequest,
  DocumentType,
  OnboardingRequest,
} from "@/lib/api/types";
import { queryKeys } from "./keys";
import { storage } from "@/lib/storage";

/* ------------------------------ Onboarding ------------------------------ */

export function useOnboard() {
  return useMutation({
    mutationFn: (body: OnboardingRequest) => onboard(body),
    onSuccess: (user) => storage.setUserId(user.id),
  });
}

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.user(userId ?? ""),
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  });
}

/* ------------------------------ Documents ------------------------------ */

export function useDocuments(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.documents(userId ?? ""),
    queryFn: () => listDocuments(userId!),
    enabled: !!userId,
  });
}

export function useUploadDocument(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { docType: DocumentType; file: File }) =>
      uploadDocument({ userId: userId!, ...input }),
    onSuccess: () => {
      if (userId)
        qc.invalidateQueries({ queryKey: queryKeys.documents(userId) });
    },
  });
}

/* -------------------------------- Runs -------------------------------- */

export function useCreateRun() {
  return useMutation({
    mutationFn: (body: CreateRunRequest) => createRun(body),
    onSuccess: (run) => storage.setRunId(run.id),
  });
}

/**
 * Poll a run ~every second while pending/running; auto-stop on done/failed.
 * Status-only — carries no result data.
 */
export function useRun(runId: string | null) {
  return useQuery({
    queryKey: queryKeys.run(runId ?? ""),
    queryFn: () => getRun(runId!),
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "done" || status === "failed" ? false : 1000;
    },
    // Terminal states are cheap to keep; live ones must always refetch.
    staleTime: 0,
  });
}

/* ------------------------------ Dashboard ------------------------------ */

/** Fetch exactly once after the run is done (gate with `enabled`). */
export function useDashboard(userId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.dashboard(userId ?? ""),
    queryFn: () => getDashboard(userId!),
    enabled: !!userId && enabled,
    staleTime: 5 * 60_000,
  });
}

/* -------------------------------- Chat -------------------------------- */

/** One reply per call; the client owns the conversation history. */
export function useChat() {
  return useMutation({
    mutationFn: (body: ChatRequest) => sendChat(body),
  });
}
