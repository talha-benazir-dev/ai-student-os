"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logout } from "@/features/auth/actions/auth";
import {
  getSettings,
  updateSettings,
} from "@/features/settings/actions/settings.actions";
import type { UserSettings } from "@/features/settings/types";
import type { DashboardStudyPeriod, WeekStartsOn } from "@/features/analytics/types/period";
import {
  PERIOD_LABELS,
  WEEK_STARTS_ON_OPTIONS,
  WEEK_STARTS_ON_LABELS,
} from "@/features/analytics/types/period";
import { Button } from "@/components/ui/button";
import { LogOut, Edit2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [isSavingPeriod, setIsSavingPeriod] = useState(false);
  const [studyHoursPeriod, setStudyHoursPeriod] =
    useState<DashboardStudyPeriod>("week");
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(1);
  const [isSavingWeekStart, setIsSavingWeekStart] = useState(false);

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
          setStudyHoursPeriod(result.data.study_hours_period);
          setWeekStartsOn(result.data.week_starts_on);
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

  async function handlePeriodChange(period: DashboardStudyPeriod) {
    setStudyHoursPeriod(period);
    setIsSavingPeriod(true);
    try {
      const result = await updateSettings({ study_hours_period: period });
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setSettings(result.data);
        toast.success("Study hours period updated");
      }
    } catch {
      toast.error("Failed to update study hours period");
    } finally {
      setIsSavingPeriod(false);
    }
  }

  async function handleWeekStartChange(day: WeekStartsOn) {
    setWeekStartsOn(day);
    setIsSavingWeekStart(true);
    try {
      const result = await updateSettings({ week_starts_on: day });
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setSettings(result.data);
        toast.success("Week start day updated");
      }
    } catch {
      toast.error("Failed to update week start day");
    } finally {
      setIsSavingWeekStart(false);
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

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium">Analytics</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Calendar-based periods for dashboard stats and charts. Week runs
              from your chosen start day through today; month runs from the 1st.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Study hours on dashboard</p>
            <div className="flex flex-wrap gap-1.5">
              {(["today", "week", "month"] as DashboardStudyPeriod[]).map(
                (period) => (
                  <button
                    key={period}
                    type="button"
                    disabled={isSavingPeriod}
                    onClick={() => handlePeriodChange(period)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-lg border transition",
                      studyHoursPeriod === period
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-border/80",
                    )}
                  >
                    {PERIOD_LABELS[period]}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Week starts on</p>
            <div className="flex flex-wrap gap-1.5">
              {WEEK_STARTS_ON_OPTIONS.map((day) => (
                <button
                  key={day}
                  type="button"
                  disabled={isSavingWeekStart}
                  onClick={() => handleWeekStartChange(day)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border transition",
                    weekStartsOn === day
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border/80",
                  )}
                >
                  {WEEK_STARTS_ON_LABELS[day].slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
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
