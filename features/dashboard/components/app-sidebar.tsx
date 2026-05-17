"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  FolderOpen,
  Layers,
  Sparkles,
  BarChart3,
  Settings,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

const nav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/notes", label: "Notes", icon: FileText },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/documents", label: "Documents", icon: FolderOpen },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/ai", label: "AI Workspace", icon: Sparkles, badge: "CORE" },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">
            Nucleus
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Study OS
          </div>
        </div>
      </div>
      <div className="px-3 pt-5">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Workspace
        </div>
        <nav className="flex flex-col gap-0.5">
          {nav.map(({ to, label, icon: Icon, badge }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                href={to}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  active
                    ? "bg-primary/12 text-foreground border border-primary/20 shadow-[inset_0_1px_0_oklch(1_0_0/6%)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-primary" />
                )}
                <Icon className={cn("h-4 w-4", active ? "text-primary" : "")} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="text-[9px] tracking-widest px-1.5 py-0.5 rounded border border-primary/30 text-primary bg-primary/10">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto px-3 pb-4 space-y-2">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <div className="rounded-xl border border-border bg-card/60 p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-violet flex items-center justify-center text-xs font-semibold text-primary-foreground shadow-[0_0_16px_-4px_oklch(0.66_0.21_295/0.8)]">
            Z
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">Zara Ahmed</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              Pro plan · <Flame className="h-3 w-3 text-orange-500" /> 7-day
              streak
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden lg:flex w-[248px] shrink-0 flex-col border-r border-border bg-sidebar">
      <SidebarBody />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="p-0 w-[270px] bg-sidebar border-r-border"
      >
        <SidebarBody onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
