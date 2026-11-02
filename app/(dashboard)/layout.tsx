import { AppShell } from "@/features/dashboard/components/app-shell";
import { CommandPaletteProvider } from "@/features/dashboard/components/create-command-menu";
import { DashboardProviders } from "./dashboard-providers";
import { getSettings } from "@/features/settings/actions/settings.actions";
import { getActiveSession } from "@/features/study-sessions/actions/study-sessions.actions";
import { getClusters } from "@/features/clusters/actions/clusters.actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ data: settings }, { data: clusters }, { data: activeSession }] =
    await Promise.all([getSettings(), getClusters(), getActiveSession()]);

  return (
    <DashboardProviders
      initialSession={activeSession}
      initialPlan={settings?.plan ?? "free"}
    >
      <CommandPaletteProvider>
        <AppShell settings={settings} initialClusters={clusters ?? []}>
          {children}
        </AppShell>
      </CommandPaletteProvider>
    </DashboardProviders>
  );
}
