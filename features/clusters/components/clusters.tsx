"use client";

import { useState } from "react";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createCluster,
  deleteCluster,
  updateCluster,
} from "@/features/clusters/actions/clusters.actions";
import { CLUSTER_COLORS, DEFAULT_CLUSTER_COLOR } from "@/features/clusters/constants";
import type { Cluster } from "@/features/clusters/types";
import { formatStudyHours } from "@/features/study-sessions/utils/format-study-hours";
import { useClusters } from "@/providers/clusters-provider";
import { useAIDrawer } from "@/providers/ai-drawer-provider";

const DEFAULT_COLOR = DEFAULT_CLUSTER_COLOR;

interface ClustersClientProps {
  initialClusters: Cluster[];
  studyMinutesByCluster: Record<string, number>;
}

export function ClustersClient({
  initialClusters,
  studyMinutesByCluster,
}: ClustersClientProps) {
  const {
    addCluster,
    updateCluster: updateClusterCtx,
    removeCluster,
  } = useClusters();
  const { openDrawer } = useAIDrawer();
  const [clusters, setClusters] = useState<Cluster[]>(initialClusters);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [loading, setLoading] = useState(false);

  const handleCreateOpen = () => {
    setName("");
    setColor(DEFAULT_COLOR);
    setIsCreateOpen(true);
  };

  const handleEdit = (cluster: Cluster) => {
    setSelectedCluster(cluster);
    setName(cluster.name);
    setColor(cluster.color);
    setIsEditOpen(true);
  };

  const handleDelete = (cluster: Cluster) => {
    setSelectedCluster(cluster);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    const { data, error } = await createCluster(trimmed, color);
    setLoading(false);

    if (error || !data) {
      toast.error(error ?? "Failed to create cluster");
      return;
    }

    setClusters((prev) => [...prev, data]);
    addCluster(data);
    setIsCreateOpen(false);
    setName("");
    setColor(DEFAULT_COLOR);
    toast.success("Cluster created");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !selectedCluster || loading) return;

    setLoading(true);
    const { data, error } = await updateCluster(
      selectedCluster.id,
      trimmed,
      color,
    );
    setLoading(false);

    if (error || !data) {
      toast.error(error ?? "Failed to update cluster");
      return;
    }

    setClusters((prev) => prev.map((c) => (c.id === data.id ? data : c)));
    updateClusterCtx(data);
    setIsEditOpen(false);
    setSelectedCluster(null);
    toast.success("Cluster updated");
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCluster || loading) return;

    setLoading(true);
    const { error } = await deleteCluster(selectedCluster.id);
    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    setClusters((prev) => prev.filter((c) => c.id !== selectedCluster.id));
    removeCluster(selectedCluster.id);
    setIsDeleteOpen(false);
    setSelectedCluster(null);
    toast.success("Cluster deleted");
  };

  return (
    <div className="min-h-full w-full bg-[#0a0a0f]">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white/95 sm:text-[28px]">
              Clusters
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your workspaces
            </p>
          </div>
          <Button
            onClick={handleCreateOpen}
            className="bg-[#7c5cfc] text-white hover:bg-[#7c5cfc]/90"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Cluster
          </Button>
        </div>

        {clusters.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No clusters yet. Create one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cluster.color }}
                    />
                    <span className="truncate text-sm font-medium text-white/95">
                      {cluster.name}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-mono tabular-nums text-muted-foreground">
                      {formatStudyHours(studyMinutesByCluster[cluster.id] ?? 0)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDrawer({
                          type: "cluster",
                          clusterIds: [cluster.id],
                          clusterNames: [cluster.name],
                        });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-400 border border-[#7c5cfc30] bg-[#7c5cfc08] hover:bg-[#7c5cfc15] transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Autopilot
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(cluster)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                      aria-label={`Edit ${cluster.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cluster)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Delete ${cluster.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Cluster</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-cluster-name">Name</Label>
              <Input
                id="create-cluster-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Calculus, Exam prep"
                className="w-full"
                disabled={loading}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {CLUSTER_COLORS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={loading}
                    onClick={() => setColor(preset)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all",
                      color === preset &&
                        "ring-2 ring-offset-2 ring-offset-background",
                    )}
                    style={
                      {
                        backgroundColor: preset,
                        ...(color === preset
                          ? { "--tw-ring-color": preset }
                          : {}),
                      } as React.CSSProperties
                    }
                    aria-label={`Select color ${preset}`}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="bg-[#7c5cfc] text-white hover:bg-[#7c5cfc]/90"
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setSelectedCluster(null);
        }}
      >
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Cluster</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cluster-name">Name</Label>
              <Input
                id="edit-cluster-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Calculus, Exam prep"
                className="w-full"
                disabled={loading}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {CLUSTER_COLORS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={loading}
                    onClick={() => setColor(preset)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all",
                      color === preset &&
                        "ring-2 ring-offset-2 ring-offset-background",
                    )}
                    style={
                      {
                        backgroundColor: preset,
                        ...(color === preset
                          ? { "--tw-ring-color": preset }
                          : {}),
                      } as React.CSSProperties
                    }
                    aria-label={`Select color ${preset}`}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="bg-[#7c5cfc] text-white hover:bg-[#7c5cfc]/90"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setSelectedCluster(null);
        }}
      >
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Cluster</DialogTitle>
            <DialogDescription>
              All items in this cluster will move to General. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
