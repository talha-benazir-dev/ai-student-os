"use client";

import { WorkspacePageHeader } from "@/features/dashboard/components/workspace-page";
import Link from "next/link";
import { WorkspaceIcon } from "@/components/workspace-icon";
import { useRouter } from "next/navigation";
import { useRequestedDialog } from "@/hooks/use-requested-dialog";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  CLUSTER_COLORS,
  DEFAULT_CLUSTER_COLOR,
} from "@/features/clusters/constants";
import type { Cluster } from "@/features/clusters/types";
import { formatStudyHours } from "@/features/study-sessions/utils/format-study-hours";
import { useClusters } from "@/providers/clusters-provider";
import { useAIDrawer } from "@/providers/ai-drawer-provider";

const DEFAULT_COLOR = DEFAULT_CLUSTER_COLOR;

interface ClustersClientProps {
  initialClusters: Cluster[];
  studyMinutesByCluster: Record<string, number>;
  autoOpenCreate?: boolean;
}

export function ClustersClient({
  initialClusters,
  studyMinutesByCluster,
  autoOpenCreate = false,
}: ClustersClientProps) {
  const {
    addCluster,
    updateCluster: updateClusterCtx,
    removeCluster,
  } = useClusters();
  const { openDrawer } = useAIDrawer();
  const [clusters, setClusters] = useState<Cluster[]>(initialClusters);
  const [isCreateOpen, setIsCreateOpen] = useRequestedDialog(autoOpenCreate);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  useEffect(() => {
    if (autoOpenCreate) router.replace("/clusters", { scroll: false });
  }, [autoOpenCreate, router]);

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
    <div className="min-h-full w-full bg-background">
      <div className="workspace-page">
        <WorkspacePageHeader
          icon="clusters"
          title="Clusters"
          description="A home for each area of learning. Connect its notes, tasks, reading, and recall cards."
          actions={
            <Button onClick={handleCreateOpen}>
              <Plus className="size-4" />
              New cluster
            </Button>
          }
        />
        <div className="workspace-summary">
          <span>
            <strong>{clusters.length}</strong>
            {clusters.length === 1 ? "cluster" : "clusters"}
          </span>
          <span>Organize by course, topic, or project.</span>
        </div>

        {clusters.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Give one cluster a home. Add Biology, History, or anything you’re
            learning.
          </p>
        ) : (
          <div className="cluster-collection">
            {clusters.map((cluster) => (
              <div key={cluster.id} className="cluster-collection-item">
                <Link href={`/clusters/${cluster.id}`} className="cluster-open">
                  <span
                    className="cluster-tile-icon"
                    style={{ color: cluster.color }}
                  >
                    <WorkspaceIcon name="clusters" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate">{cluster.name}</h2>
                    <p>Notes, tasks & study material</p>
                  </div>
                </Link>
                <span className="hidden sm:block text-xs tabular-nums text-muted-foreground mr-4">
                  {formatStudyHours(studyMinutesByCluster[cluster.id] ?? 0)}{" "}
                  studied
                </span>
                <div className="cluster-tools">
                  <button
                    type="button"
                    onClick={() =>
                      openDrawer({
                        type: "cluster",
                        clusterIds: [cluster.id],
                        clusterNames: [cluster.name],
                      })
                    }
                    className="p-2 text-muted-foreground hover:text-foreground"
                    aria-label={`Study assistant for ${cluster.name}`}
                  >
                    <WorkspaceIcon name="assistant" className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(cluster)}
                    className="p-2 text-muted-foreground hover:text-foreground"
                    aria-label={`Edit ${cluster.name}`}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cluster)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${cluster.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New cluster</DialogTitle>
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
                className="bg-primary text-primary-foreground hover:bg-primary/90"
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
            <DialogTitle>Edit cluster</DialogTitle>
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
                className="bg-primary text-primary-foreground hover:bg-primary/90"
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
            <DialogTitle>Delete cluster</DialogTitle>
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
