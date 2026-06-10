"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar, MobileSidebar } from "./app-sidebar";
import { AIPanelSheet } from "./ai-panel";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClustersProvider } from "@/providers/clusters-provider";
// import { cn } from "@/lib/utils";

export function AppShell({
  children,
  showAI = true,
}: {
  children: ReactNode;
  showAI?: boolean;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const pathname = usePathname();

  return (
    <ClustersProvider>
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <MobileSidebar open={navOpen} onOpenChange={setNavOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-2 h-14 px-4 border-b border-border bg-background/80 backdrop-blur-md">
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

          {showAI && pathname === "/dashboard" ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAiOpen(true)}
              className="text-primary hover:bg-primary/10"
              aria-label="Open AI"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          ) : (
            <div className="w-8" />
          )}
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>

      {showAI && pathname === "/dashboard" && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-gradient-violet text-white flex items-center justify-center shadow-[0_0_20px_-2px_oklch(0.66_0.21_295/0.6)] hover:shadow-[0_0_28px_0px_oklch(0.66_0.21_295/0.8)] hover:scale-105 transition-all active:scale-95 duration-200 group cursor-pointer"
          aria-label="Open Nucleus AI"
        >
          <Sparkles className="h-5 w-5" />
          <span className="absolute right-14 bg-card border border-border text-foreground text-xs font-medium px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
            Ask Nucleus AI
          </span>
        </button>
      )}

      {showAI && <AIPanelSheet open={aiOpen} onOpenChange={setAiOpen} />}
    </div>
    </ClustersProvider>
  );
}
