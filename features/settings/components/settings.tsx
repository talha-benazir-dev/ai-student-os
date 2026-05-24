"use client";

import { useEffect, useState } from "react";
import { logout } from "@/features/auth/actions/auth";
import {
  getSettings,
  updateSettings,
} from "@/features/settings/actions/settings.actions";
import type { UserSettings } from "@/features/settings/types";
import { Button } from "@/components/ui/button";
import { LogOut, Edit2, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm ${highlight ? "text-primary-soft" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const result = await getSettings();
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setSettings(result.data);
          setEditForm({
            name: result.data.name,
          });
        }
      } catch (err) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    try {
      const result = await updateSettings(editForm);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setSettings(result.data);
        setIsEditDialogOpen(false);
      }
    } catch (err) {
      setError("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-10 mx-auto w-full max-w-[900px]">
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-8">
          Profile, plan, and preferences.
        </p>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-10 mx-auto w-full max-w-[900px]">
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-8">
          Profile, plan, and preferences.
        </p>
        <div className="text-sm text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-10 mx-auto w-full max-w-[900px]">
      <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
        Settings
      </h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">
        Profile, plan, and preferences.
      </p>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <Row label="Name" value={settings?.name || ""} />
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Name</DialogTitle>
                  <DialogDescription>
                    Update your display name.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Row label="Email" value={settings?.email || ""} />
          <Row label="Plan" value={settings?.plan || ""} highlight />
          <Row label="Theme" value={settings?.theme || ""} />
        </div>

        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-destructive-foreground">
              Sign Out
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Log out of your Nucleus account on this device.
            </p>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="destructive"
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
