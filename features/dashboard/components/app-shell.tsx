"use client";

import { ReactNode, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { WorkspaceBreadcrumb, WorkspaceContext } from "./workspace-chrome";
import { AppSidebar, MobileSidebar } from "./app-sidebar";
import { DashboardCreateMenu } from "./create-command-menu";
import { Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClustersProvider } from "@/providers/clusters-provider";
import { AIDrawer } from "@/features/ai/components/ai-drawer";
import { usePlan } from "@/providers/plan-provider";
import { cn } from "@/lib/utils";
import type { UserSettings } from "@/features/settings/types";
import type { Cluster } from "@/features/clusters/types";

const AIPanelSheet = dynamic(
  () => import("./ai-panel").then((module) => module.AIPanelSheet),
  { ssr: false },
);

export function AppShell({
  children,
  showAI = true,
  settings,
  initialClusters,
}: {
  children: ReactNode;
  showAI?: boolean;
  settings: UserSettings | null;
  initialClusters: Cluster[];
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const pathname = usePathname();
  const { isPro } = usePlan();
  const showDashboardAI = showAI && isPro;

  return (
    <ClustersProvider initialClusters={initialClusters}>
      <div className="workspace-shell flex min-h-screen bg-background">
        <AppSidebar settings={settings} />
        <MobileSidebar
          settings={settings}
          open={navOpen}
          onOpenChange={setNavOpen}
        />

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col min-w-0",
            pathname.startsWith("/ai") && "h-[100dvh] overflow-hidden",
          )}
        >
          {/* Mobile top bar */}
          <header className="lg:hidden sticky top-0 z-30 flex shrink-0 items-center justify-between gap-2 h-14 px-4 border-b border-border bg-background/80 backdrop-blur-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">
                Nucleus
              </span>
            </div>

            {pathname === "/dashboard" ? (
              <DashboardCreateMenu className="sm:hidden h-8 px-2.5 text-xs" />
            ) : showDashboardAI ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAiOpen(true)}
                className="text-primary hover:bg-primary/10"
                aria-label="Open AI"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            ) : (
              <div className="w-8" />
            )}
          </header>

          <WorkspaceBreadcrumb />
          <div className="flex min-h-0 flex-1">
            <main
              className={cn(
                "min-h-0 flex-1 min-w-0 overflow-x-hidden",
                pathname.startsWith("/ai") && "flex flex-col overflow-hidden",
              )}
            >
              <div key={pathname} className="workspace-route h-full">
                {children}
              </div>
            </main>
            <WorkspaceContext />
          </div>
        </div>

        {showDashboardAI && pathname === "/dashboard" && (
          <button
            onClick={() => setAiOpen(true)}
            className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-colors hover:bg-primary/90 group cursor-pointer"
            aria-label="Open Nucleus AI"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-14 bg-card border border-border text-foreground text-xs font-medium px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
              Ask Nucleus AI
            </span>
          </button>
        )}

        {showDashboardAI && aiOpen && (
          <AIPanelSheet open={aiOpen} onOpenChange={setAiOpen} />
        )}
      </div>
      <AIDrawer />
    </ClustersProvider>
  );
}
