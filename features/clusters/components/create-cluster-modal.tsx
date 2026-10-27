"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createCluster } from "@/features/clusters/actions/clusters.actions";
import { CLUSTER_COLORS } from "@/features/clusters/constants";

interface CreateClusterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateClusterModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateClusterModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(CLUSTER_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setColor(CLUSTER_COLORS[0]);
    setIsSubmitting(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    const { data, error } = await createCluster(trimmed, color);
    setIsSubmitting(false);

    if (error || !data) {
      toast.error(error ?? "Failed to create cluster");
      return;
    }

    toast.success("Subject created");
    handleOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#ffffff10] bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">New subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="cluster-name" className="text-white/70">
              Name
            </Label>
            <Input
              id="cluster-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Calculus, Exam prep"
              className="border-[#ffffff10] bg-background text-white"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Color</Label>
            <div className="flex gap-2">
              {CLUSTER_COLORS.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setColor(swatch)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    color === swatch
                      ? "ring-2 ring-white ring-offset-2 ring-offset-[#0f0f17]"
                      : "hover:scale-110",
                  )}
                  style={{ backgroundColor: swatch }}
                  aria-label={`Select color ${swatch}`}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? "Creating…" : "Create subject"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
