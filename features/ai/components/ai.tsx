import { AppShell } from "@/features/dashboard/components/app-shell";

export default function AIWorkspacePage() {
  return (
    <AppShell showAI={false}>
      <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-10 mx-auto w-full max-w-[1100px]">
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
          AI Workspace
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-8">
          Your private research copilot.
        </p>
        <div className="rounded-2xl border border-border bg-card p-10 min-h-[420px] flex items-center justify-center text-center">
          <div>
            <div className="text-base font-medium">
              Full conversational workspace coming online
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Use the assistant panel from the dashboard meanwhile.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
