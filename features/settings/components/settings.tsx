import { AppShell } from "@/features/dashboard/components/app-shell";

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm ${highlight ? "text-primary-soft" : ""}`}>{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppShell showAI={false}>
      <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-10 mx-auto w-full max-w-[900px]">
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-8">Profile, plan, and preferences.</p>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <Row label="Name" value="Zara Ahmed" />
          <Row label="Email" value="zara@nucleus.ai" />
          <Row label="Plan" value="Pro" highlight />
          <Row label="Theme" value="Obsidian (default)" />
        </div>
      </div>
    </AppShell>
  );
}
