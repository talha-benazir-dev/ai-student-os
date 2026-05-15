"use client";

import { ReactNode, useState } from "react";
import { AppSidebar, MobileSidebar } from "./app-sidebar";
import { AIPanel, AIPanelSheet } from "./ai-panel";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
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
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Nucleus
            </span>
          </div>

          {showAI ? (
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

      {showAI && <AIPanel />}
      {showAI && <AIPanelSheet open={aiOpen} onOpenChange={setAiOpen} />}
    </div>
  );
}
