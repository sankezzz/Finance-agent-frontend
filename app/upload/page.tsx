"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  X,
  ArrowRight,
  Loader2,
  Check,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/shared/page-shell";
import { FadeIn } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";
import { uploadDocument } from "@/lib/api/endpoints";
import { useDocuments, useCreateRun } from "@/lib/query/hooks";
import { useRequireUser } from "@/lib/use-session";
import {
  ACCEPT_ATTR,
  DOC_TYPES,
  docTypeLabel,
  guessDocType,
  isAcceptedFile,
} from "@/lib/doc-types";
import type { DocumentType } from "@/lib/api/types";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

type StagedStatus = "ready" | "uploading" | "error";
interface StagedFile {
  id: string;
  file: File;
  docType: DocumentType;
  status: StagedStatus;
  error?: string;
}

let stagedSeq = 0;

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function UploadPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { ready, userId } = useRequireUser();

  const docsQuery = useDocuments(userId);
  const createRun = useCreateRun();

  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadedDocs = docsQuery.data ?? [];
  const canAnalyze =
    uploadedDocs.length > 0 && staged.length === 0 && !uploading;

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const incoming: StagedFile[] = [];
    const rejected: string[] = [];
    Array.from(fileList).forEach((file) => {
      if (!isAcceptedFile(file.name)) {
        rejected.push(file.name);
        return;
      }
      incoming.push({
        id: `staged-${++stagedSeq}`,
        file,
        docType: guessDocType(file.name),
        status: "ready",
      });
    });
    if (rejected.length)
      toast.error(
        `Unsupported file type: ${rejected.join(", ")}. Use PDF, CSV, Excel or images.`
      );
    if (incoming.length) setStaged((s) => [...s, ...incoming]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function uploadAll() {
    if (!userId || staged.length === 0) return;
    setUploading(true);
    // Upload sequentially — one file per request, per the contract.
    for (const item of staged) {
      if (item.status === "uploading") continue;
      setStaged((s) =>
        s.map((f) =>
          f.id === item.id ? { ...f, status: "uploading", error: undefined } : f
        )
      );
      try {
        await uploadDocument({
          userId,
          docType: item.docType,
          file: item.file,
        });
        // Success → drop from staging; it now lives in the server list.
        setStaged((s) => s.filter((f) => f.id !== item.id));
      } catch (err) {
        const msg =
          err instanceof ApiError ? err.message : "Upload failed.";
        setStaged((s) =>
          s.map((f) =>
            f.id === item.id ? { ...f, status: "error", error: msg } : f
          )
        );
      }
    }
    qc.invalidateQueries({ queryKey: queryKeys.documents(userId) });
    setUploading(false);
  }

  async function analyze() {
    if (!userId) return;
    try {
      const run = await createRun.mutateAsync({ user_id: userId });
      // run_id is stored by the hook; processing screen reads it.
      router.push("/processing");
      void run;
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not start the analysis. Try again."
      );
    }
  }

  if (!ready || !userId) {
    return (
      <PageShell width="lg">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-48 w-full" />
      </PageShell>
    );
  }

  return (
    <PageShell width="lg">
      <FadeIn>
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Step 2 of 3</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Upload your documents
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Add your statements one or many at a time and tag each with its type.
            Upload everything first, then analyze once.
          </p>
        </div>
      </FadeIn>

      {/* Dropzone */}
      <FadeIn delay={0.06}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
          }
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center transition-colors",
            dragging
              ? "border-foreground/50 bg-accent/40"
              : "border-border hover:border-foreground/30 hover:bg-accent/20"
          )}
        >
          <div className="mb-4 grid size-12 place-items-center rounded-full border border-border/70 bg-gradient-to-b from-white/10 to-transparent">
            <UploadCloud className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">
            Drag &amp; drop files, or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, CSV, Excel, PNG or JPG
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </FadeIn>

      {/* Staged (not yet uploaded) */}
      {staged.length > 0 && (
        <FadeIn delay={0.04} className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Ready to upload · {staged.length}
            </h2>
            <Button onClick={uploadAll} disabled={uploading} size="sm">
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <UploadCloud className="size-4" />
                  Upload {staged.length} file{staged.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
          <ul className="space-y-2">
            {staged.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/40 p-3 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(item.file.size)}
                      {item.status === "error" && item.error
                        ? ` · ${item.error}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={item.docType}
                    disabled={item.status === "uploading"}
                    onValueChange={(v) =>
                      setStaged((s) =>
                        s.map((f) =>
                          f.id === item.id
                            ? { ...f, docType: v as DocumentType }
                            : f
                        )
                      )
                    }
                  >
                    <SelectTrigger className="w-[190px]" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {item.status === "uploading" ? (
                    <span className="grid size-9 place-items-center">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      aria-label="Remove file"
                      onClick={() =>
                        setStaged((s) => s.filter((f) => f.id !== item.id))
                      }
                      className="grid size-9 place-items-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </FadeIn>
      )}

      {/* Uploaded (server) */}
      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Uploaded documents
        </h2>

        {docsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : docsQuery.isError ? (
          <div className="flex items-center justify-between rounded-lg border border-border/70 p-4 text-sm">
            <span className="text-muted-foreground">
              Couldn&apos;t load your documents.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => docsQuery.refetch()}
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        ) : uploadedDocs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
            No documents uploaded yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {uploadedDocs.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/40 p-3"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border/70">
                  <Check className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{doc.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {docTypeLabel(doc.doc_type)}
                    {doc.size_bytes ? ` · ${formatSize(doc.size_bytes)}` : ""}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {doc.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Analyze */}
      <FadeIn delay={0.05} className="mt-10">
        <div className="flex flex-col items-center gap-3 border-t border-border/70 pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {uploadedDocs.length === 0
              ? "Upload at least one document to begin."
              : staged.length > 0
                ? "Finish uploading your staged files first."
                : `${uploadedDocs.length} document${
                    uploadedDocs.length > 1 ? "s" : ""
                  } ready to analyze.`}
          </p>
          <Button
            size="lg"
            className="group w-full sm:w-auto"
            disabled={!canAnalyze || createRun.isPending}
            onClick={analyze}
          >
            {createRun.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Starting…
              </>
            ) : (
              <>
                Analyze my finances
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </FadeIn>
    </PageShell>
  );
}
