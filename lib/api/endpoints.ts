import { apiFetch } from "./client";
import type {
  CreateRunRequest,
  DashboardResponse,
  Document,
  DocumentType,
  OnboardingRequest,
  Run,
  User,
} from "./types";

/** POST /onboarding → create a user profile. */
export function onboard(body: OnboardingRequest): Promise<User> {
  return apiFetch<User>("/onboarding", { method: "POST", json: body });
}

/** GET /onboarding/{user_id} */
export function getUser(userId: string): Promise<User> {
  return apiFetch<User>(`/onboarding/${userId}`);
}

/** POST /documents → upload ONE file (multipart). Call once per file. */
export function uploadDocument(input: {
  userId: string;
  docType: DocumentType;
  file: File;
}): Promise<Document> {
  const form = new FormData();
  form.append("user_id", input.userId);
  form.append("doc_type", input.docType);
  form.append("file", input.file);
  return apiFetch<Document>("/documents", { method: "POST", body: form });
}

/** GET /documents?user_id=... → list a user's uploaded documents. */
export function listDocuments(userId: string): Promise<Document[]> {
  return apiFetch<Document[]>(
    `/documents?user_id=${encodeURIComponent(userId)}`
  );
}

/** POST /pipeline/runs → kick off the pipeline over all uploaded docs. */
export function createRun(body: CreateRunRequest): Promise<Run> {
  return apiFetch<Run>("/pipeline/runs", { method: "POST", json: body });
}

/** GET /pipeline/runs/{run_id} → poll run status (status only, no results). */
export function getRun(runId: string): Promise<Run> {
  return apiFetch<Run>(`/pipeline/runs/${runId}`);
}

/** GET /dashboard/{user_id} → composed dashboard from the latest analysis. */
export function getDashboard(userId: string): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>(`/dashboard/${userId}`);
}
