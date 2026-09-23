import { AppShell } from "@/features/dashboard/components/app-shell";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-center py-3">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppShell showAI={false}>
      <div className="px-6 lg:px-8 py-6 mx-auto w-full max-w-3xl">
        <PageHeader
          title="Settings"
          description="Profile, study preferences, and plan."
          actions={<Button size="sm">Save changes</Button>}
        />

        <section className="rounded-xl border border-border bg-card px-5 py-2 mb-4">
          <h2 className="text-sm font-semibold tracking-tight pt-3">Profile</h2>
          <Field label="Name">
            <Input defaultValue="Zara Ahmed" className="text-[13px]" />
          </Field>
          <Separator />
          <Field label="Email">
            <Input defaultValue="zara@nucleus.ai" className="text-[13px]" />
          </Field>
          <Separator />
          <Field label="Exam period">
            <Input defaultValue="May 2026 — finals" className="text-[13px]" />
          </Field>
        </section>

        <section className="rounded-xl border border-border bg-card px-5 py-2 mb-4">
          <h2 className="text-sm font-semibold tracking-tight pt-3">
            Study preferences
          </h2>
          <Field label="Daily goal">
            <Input defaultValue="3 hours" className="text-[13px]" />
          </Field>
          <Separator />
          <Field label="Focus length">
            <Input defaultValue="45 minutes" className="text-[13px]" />
          </Field>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-[13px] font-medium">Spaced reminders</div>
              <div className="text-xs text-muted-foreground">
                Nudge reviews before you forget
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-[13px] font-medium">Weekly report</div>
              <div className="text-xs text-muted-foreground">
                Hours, streaks, and mastery every Sunday
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Pro plan</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Unlimited AI summaries · 100 GB storage · priority reviews
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
