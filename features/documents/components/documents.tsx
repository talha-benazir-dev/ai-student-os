"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Cluster, Document } from "../types";
import {
  createDocument,
  deleteDocument,
  updateDocument,
} from "../actions/documents.actions";
import {
  FileText,
  Trash2,
  UploadCloud,
  X,
  ExternalLink,
  FileIcon,
  Sparkles,
} from "lucide-react";
import { useAIDrawer } from "@/providers/ai-drawer-provider";
import { parseAiApiError, UPGRADE_TOAST } from "@/lib/ai/constants";
import { toast } from "sonner";

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface DocumentsPageProps {
  initialDocuments: Document[];
  initialClusters: Cluster[];
}

type ClusterFilter = "all" | "general" | string;

const GENERAL_CLUSTER_VALUE = "";

type OverviewStatus =
  | "idle"
  | "loading"
  | "ready"
  | "no_text"
  | "upgrade_required"
  | "error";

function clusterIdFromSelectValue(value: string): string | null {
  return value === GENERAL_CLUSTER_VALUE ? null : value;
}

export function DocumentsPage({
  initialDocuments,
  initialClusters,
}: DocumentsPageProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [clusters] = useState<Cluster[]>(initialClusters);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [activeClusterFilter, setActiveClusterFilter] =
    useState<ClusterFilter>("all");

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [selectedCluster, setSelectedCluster] = useState(GENERAL_CLUSTER_VALUE);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [pendingStudyPack, setPendingStudyPack] = useState<{
    documentId: string;
    documentTitle: string;
    rawText: string;
  } | null>(null);
  const [overviewStatus, setOverviewStatus] = useState<OverviewStatus>("idle");
  const [overviewText, setOverviewText] = useState("");
  const [overviewRetry, setOverviewRetry] = useState(0);

  const { openDrawer } = useAIDrawer();

  const clusterMap = useMemo(
    () => new Map(clusters.map((c) => [c.id, c])),
    [clusters],
  );

  const clustersWithDocuments = useMemo(
    () =>
      clusters.filter((cluster) =>
        documents.some((d) => d.cluster_id === cluster.id),
      ),
    [clusters, documents],
  );

  const visibleDocuments = useMemo(() => {
    if (activeClusterFilter === "all") return documents;
    if (activeClusterFilter === "general")
      return documents.filter((d) => d.cluster_id === null);
    return documents.filter((d) => d.cluster_id === activeClusterFilter);
  }, [documents, activeClusterFilter]);

  const fetchOverview = useCallback(
    async (doc: Document, signal: AbortSignal) => {
      try {
        const response = await fetch(`/api/documents/${doc.id}/overview`, {
          method: "POST",
          signal,
        });

        const data = (await response.json().catch(() => ({}))) as {
          overview?: string;
          error?: string;
        };

        if (signal.aborted) return;

        if (
          parseAiApiError(response.status, data) === "upgrade_required"
        ) {
          toast.error(UPGRADE_TOAST);
          setOverviewStatus("upgrade_required");
          return;
        }

        if (response.status === 422 && data.error === "no_text") {
          setOverviewStatus("no_text");
          return;
        }

        if (!response.ok || !data.overview) {
          setOverviewStatus("error");
          return;
        }

        setOverviewText(data.overview);
        setOverviewStatus("ready");
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, ai_summary: data.overview! } : d,
          ),
        );
        setSelectedDoc((prev) =>
          prev?.id === doc.id ? { ...prev, ai_summary: data.overview! } : prev,
        );
      } catch {
        if (!signal.aborted) {
          setOverviewStatus("error");
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!selectedDoc) {
      setOverviewStatus("idle");
      setOverviewText("");
      return;
    }

    if (selectedDoc.ai_summary) {
      setOverviewText(selectedDoc.ai_summary);
      setOverviewStatus("ready");
      return;
    }

    setOverviewStatus("loading");
    setOverviewText("");

    const controller = new AbortController();
    fetchOverview(selectedDoc, controller.signal);

    return () => controller.abort();
  }, [selectedDoc?.id, selectedDoc?.ai_summary, overviewRetry, fetchOverview]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
        setUploadError("");
      } else {
        setUploadError("Only PDF files are allowed.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
        setUploadError("");
      } else {
        setUploadError("Only PDF files are allowed.");
      }
    }
  };

  const cancelUpload = () => {
    setShowUpload(false);
    setFile(null);
    setTitle("");
    setSelectedCluster(GENERAL_CLUSTER_VALUE);
    setUploadError("");
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file || !title) return;

    setIsUploading(true);
    setProgress(0);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("cluster_id", selectedCluster);

      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 300);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Upload API error:", errorData);
        throw new Error(errorData.error || "Upload failed");
      }

      setProgress(100);

      const { url, public_id, rawText } = await response.json();

      const cluster_id = clusterIdFromSelectValue(selectedCluster);
      const { data: newDoc, error: dbError } = await createDocument(
        title,
        url,
        file.size,
        cluster_id,
        public_id,
        rawText ?? "",
      );

      if (dbError) throw dbError;

      if (newDoc) {
        setDocuments([newDoc, ...documents]);

        if (rawText && rawText.length > 0) {
          setPendingStudyPack({
            documentId: newDoc.id,
            documentTitle: title,
            rawText: rawText ?? "",
          });
        }
      }

      setShowUpload(false);
      setFile(null);
      setTitle("");
      setSelectedCluster(GENERAL_CLUSTER_VALUE);
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Please try again.");
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();

    const prevDocs = [...documents];
    setDocuments(documents.filter((d) => d.id !== doc.id));
    if (selectedDoc?.id === doc.id) {
      setSelectedDoc(null);
    }

    const { error } = await deleteDocument(doc.id, doc.cloudinary_public_id);
    if (error) {
      console.error(error);
      setDocuments(prevDocs);
    }
  };

  const handleClusterChange = async (
    docId: string,
    clusterId: string | null,
  ) => {
    const oldDoc = documents.find((d) => d.id === docId);
    if (!oldDoc) return;

    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, cluster_id: clusterId } : d)),
    );

    const { error } = await updateDocument(docId, { cluster_id: clusterId });
    if (error) {
      console.error(error);
      setDocuments((prev) => prev.map((d) => (d.id === docId ? oldDoc : d)));
    }
  };

  return (
    <div className="w-full min-h-full bg-[#0a0a0f] text-zinc-100 flex relative overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* TOP BAR */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Documents</h1>
              <p className="text-zinc-400 mt-1">
                Your uploaded study materials.
              </p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-colors bg-[#7c5cfc] hover:bg-[#6b4ce6]"
            >
              <UploadCloud className="w-5 h-5" />
              <span>Upload PDF</span>
            </button>
          </div>

          {/* UPLOAD PANEL */}
          {showUpload && (
            <div className="bg-[#0f0f17] border border-[#ffffff15] rounded-2xl p-6 transition-all">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Upload Document</h2>
                <button
                  onClick={cancelUpload}
                  disabled={isUploading}
                  className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors relative
                    ${isDragActive ? "border-[#7c5cfc] bg-[#7c5cfc0a]" : "border-zinc-800 bg-zinc-900/30"}
                    ${isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer hover:bg-zinc-900/50"}
                  `}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
                  />
                  <FileIcon
                    className={`w-10 h-10 mb-4 ${isDragActive ? "text-[#7c5cfc]" : "text-zinc-500"}`}
                  />
                  <p className="text-sm font-medium text-center">
                    {file ? file.name : "Drag your PDF here or click to browse"}
                  </p>
                  {!file && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Only PDF files, up to 50MB
                    </p>
                  )}
                </div>

                {/* Form Inputs */}
                <div className="space-y-4 flex flex-col justify-center">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isUploading || !file}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#7c5cfc] disabled:opacity-50"
                      placeholder="e.g. Chapter 4 - Quantum Mechanics"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                      Cluster <span className="text-zinc-600">(Optional)</span>
                    </label>
                    <select
                      value={selectedCluster}
                      onChange={(e) => setSelectedCluster(e.target.value)}
                      disabled={isUploading || !file}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#7c5cfc] disabled:opacity-50"
                    >
                      <option value="">General</option>
                      {clusters.map((cluster) => (
                        <option key={cluster.id} value={cluster.id}>
                          {cluster.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {uploadError && (
                    <p className="text-red-400 text-sm mt-2">{uploadError}</p>
                  )}

                  {isUploading && (
                    <div className="mt-4">
                      <div className="h-2 w-full bg-[#ffffff10] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7c5cfc] transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-400 mt-2 text-right">
                        {progress}%
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={cancelUpload}
                      disabled={isUploading}
                      className="flex-1 py-2.5 px-4 rounded-lg font-medium border border-zinc-800 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!file || !title || isUploading}
                      className="flex-1 py-2.5 px-4 rounded-lg font-medium bg-[#7c5cfc] hover:bg-[#6b4ce6] text-white transition-colors disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
                    >
                      {isUploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT LIST */}
          <div className="w-full mt-8">
            {documents.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveClusterFilter("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeClusterFilter === "all"
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveClusterFilter("general")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeClusterFilter === "general"
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  General
                </button>
                {clustersWithDocuments.map((cluster) => (
                  <button
                    key={cluster.id}
                    type="button"
                    onClick={() => setActiveClusterFilter(cluster.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
                      activeClusterFilter === cluster.id
                        ? "bg-white/10 text-white"
                        : "text-white/40 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: cluster.color }}
                      aria-hidden
                    />
                    {cluster.name}
                  </button>
                ))}
              </div>
            )}
            {pendingStudyPack ? (
              <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-[#7c5cfc30] bg-[#7c5cfc08] mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-violet-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Generate a study pack?
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      Nucleus AI can create notes, flashcards and tasks from
                      &quot;{pendingStudyPack.documentTitle}&quot;
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPendingStudyPack(null)}
                    className="px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors"
                  >
                    Not now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openDrawer({
                        type: "document",
                        documentId: pendingStudyPack.documentId,
                        documentTitle: pendingStudyPack.documentTitle,
                        rawText: pendingStudyPack.rawText,
                      });
                      setPendingStudyPack(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#7c5cfc] hover:bg-[#8a6dfd] text-white text-xs font-medium transition-colors"
                  >
                    Generate →
                  </button>
                </div>
              </div>
            ) : null}
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-[#0f0f17]">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
                  <FileIcon className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">
                  No documents yet
                </h3>
                <p className="text-zinc-500 mb-6 text-center max-w-sm">
                  Upload your first PDF, then generate a study pack with notes,
                  flashcards, and tasks.
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-5 py-2.5 rounded-lg text-white font-medium transition-colors bg-zinc-800 hover:bg-zinc-700"
                >
                  Upload your first PDF
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {visibleDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="group flex items-center p-4 bg-[#0f0f17] border border-[#ffffff10] rounded-xl hover:bg-[#111118] cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mr-4">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>

                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="text-base font-semibold text-zinc-100 truncate">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        {doc.cluster_id && (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/70 inline-flex items-center gap-1.5">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  clusterMap.get(doc.cluster_id)?.color ||
                                  "#7c5cfc",
                              }}
                            />
                            {clusterMap.get(doc.cluster_id)?.name || "Unknown"}
                          </span>
                        )}
                        <span>
                          {doc.file_size
                            ? formatBytes(doc.file_size)
                            : "Unknown size"}
                        </span>
                        <span>•</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <button
                        onClick={(e) => handleDelete(e, doc)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL PANEL SLIDE-IN */}
      {selectedDoc && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedDoc(null)}
          />
          <div
            className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-[#0f0f17] border-l border-[#ffffff10] z-50 flex flex-col shadow-2xl"
            style={{
              transform: "translateX(0)",
              transition: "transform 250ms ease-in-out",
            }}
          >
            <div className="p-6 border-b border-[#ffffff10] flex items-center justify-between">
              <h3 className="font-semibold text-lg">Document Details</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-red-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
                {selectedDoc.title}
              </h2>

              <div className="flex flex-wrap gap-2 mb-8">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedDoc.cluster_id || ""}
                    onChange={(e) =>
                      handleClusterChange(
                        selectedDoc.id,
                        e.target.value || null,
                      )
                    }
                    className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#7c5cfc]"
                  >
                    <option value="">General</option>
                    {clusters.map((cluster) => (
                      <option key={cluster.id} value={cluster.id}>
                        {cluster.name}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 text-sm border border-zinc-800">
                  {selectedDoc.file_size
                    ? formatBytes(selectedDoc.file_size)
                    : "Unknown size"}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 text-sm border border-zinc-800">
                  {formatDate(selectedDoc.created_at)}
                </span>
              </div>

              <button
                onClick={() => setShowPdfModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open PDF</span>
              </button>

              {overviewStatus !== "idle" && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Quick overview
                  </h4>

                  {overviewStatus === "loading" && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-2">
                      <div className="h-3 bg-zinc-800 rounded animate-pulse w-full" />
                      <div className="h-3 bg-zinc-800 rounded animate-pulse w-5/6" />
                      <div className="h-3 bg-zinc-800 rounded animate-pulse w-4/6" />
                    </div>
                  )}

                  {overviewStatus === "ready" && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {overviewText}
                      </p>
                    </div>
                  )}

                  {overviewStatus === "no_text" && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                      <p className="text-sm text-zinc-400">
                        We couldn&apos;t extract text from this PDF, so a quick
                        overview isn&apos;t available.
                      </p>
                    </div>
                  )}

                  {overviewStatus === "upgrade_required" && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                      <p className="text-sm text-zinc-400">
                        Quick overview is a Pro feature.{" "}
                        <a
                          href="/#pricing"
                          className="text-[#7c5cfc] hover:text-[#8a6dfd] transition-colors"
                        >
                          Upgrade to Pro
                        </a>
                      </p>
                    </div>
                  )}

                  {overviewStatus === "error" && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-start gap-3">
                      <p className="text-sm text-zinc-400">
                        Couldn&apos;t generate an overview. Please try again.
                      </p>
                      <button
                        type="button"
                        onClick={() => setOverviewRetry((n) => n + 1)}
                        className="text-xs font-medium text-[#7c5cfc] hover:text-[#8a6dfd] transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#ffffff10]">
              <button
                onClick={(e) => handleDelete(e, selectedDoc)}
                className="w-full py-3 px-4 rounded-xl text-red-400 font-medium hover:bg-red-400/10 transition-colors border border-transparent hover:border-red-400/20"
              >
                Delete Document
              </button>
            </div>
          </div>
        </>
      )}

      {/* PDF MODAL */}
      {showPdfModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setShowPdfModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f17] border border-[#ffffff15] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">PDF Viewer</h3>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-zinc-300 text-sm mb-6">
                PDF viewer coming soon. You&apos;ll be able to view and annotate
                your documents directly in the app.
              </p>
              <button
                onClick={() => setShowPdfModal(false)}
                className="w-full py-2.5 px-4 rounded-lg bg-[#7c5cfc] hover:bg-[#6b4ce6] text-white font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
