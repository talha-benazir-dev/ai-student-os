import { AppShell } from "@/features/dashboard/components/app-shell";
import { Sparkles } from "lucide-react";

export default function DocumentsPage() {
  return (
    <AppShell showAI={false}>
      <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-10 mx-auto w-full max-w-[1400px]">
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
          Documents
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-8">
          Your AI-powered library.
        </p>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="inline-flex h-12 w-12 rounded-xl bg-primary/15 border border-primary/30 items-center justify-center mb-4">
            <Sparkles className="h-5 w-5 text-primary-soft" />
          </div>
          <div className="text-base font-medium">Drop a PDF to begin</div>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop coming online.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
