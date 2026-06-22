"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useEffect, useState } from "react";
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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getSettings } from "@/features/settings/actions/settings.actions";
import type { UserSettings } from "@/features/settings/types";
import { useClusters } from "@/providers/clusters-provider";

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

// Custom SVG Icon Components
function PanelRightOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
      <path d="m10 15-3-3 3-3" />
    </svg>
  );
}

function PanelRightCloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
      <path d="m8 9 3 3-3 3" />
    </svg>
  );
}

// Isolated NavLink: only this re-renders on pathname change, not the whole sidebar
function NavLink({
  to,
  label,
  icon: Icon,
  badge,
  onClick,
  collapsed = false,
}: NavItem & { onClick?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();
  const active = pathname === to;
  return (
    <Link
      href={to}
      prefetch={true}
      onClick={onClick}
      className={cn(
        "group relative flex items-center transition-all duration-200",
        collapsed
          ? "justify-center h-10 w-10 p-0 mx-auto rounded-lg"
          : "gap-3 rounded-lg px-3 py-2 text-sm",
        active
          ? "bg-primary/12 text-foreground border border-primary/20 shadow-[inset_0_1px_0_oklch(1_0_0/6%)]"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
      title={collapsed ? label : undefined}
    >
      {active && (
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 rounded-r bg-primary transition-all duration-200",
            collapsed ? "h-6 w-0.5" : "h-5 w-0.5",
          )}
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors duration-200",
          active ? "text-primary" : "",
        )}
      />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge && (
        <span className="text-[9px] tracking-widest px-1.5 py-0.5 rounded border border-primary/30 text-primary bg-primary/10 animate-fade-in">
          {badge}
        </span>
      )}
    </Link>
  );
}

function SidebarBody({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { clusters } = useClusters();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [logoHovered, setLogoHovered] = useState(false);
  const [clustersOpen, setClustersOpen] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const result = await getSettings();
      if (result.data) {
        setSettings(result.data);
      }
    }
    fetchSettings();
  }, []);

  return (
    <>
      {collapsed ? (
        <div className="flex items-center justify-center h-16 border-b border-border">
          <button
            onClick={onToggleCollapse}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 cursor-pointer"
            title="Expand sidebar"
          >
            {logoHovered ? (
              <PanelRightCloseIcon className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <div className="flex items-center gap-2.5">
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
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelRightOpenIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain pt-5",
          collapsed ? "px-1.5" : "px-3",
        )}
      >
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Workspace
          </div>
        )}
        <nav className="flex flex-col gap-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              {...item}
              onClick={onNavigate}
              collapsed={collapsed}
            />
          ))}
        </nav>
        {!collapsed && clusters.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setClustersOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 pb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Clusters</span>
              <ChevronRight
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  clustersOpen && "rotate-90",
                )}
              />
            </button>
            {clustersOpen && (
              <div className="flex flex-col gap-0.5">
                {clusters.map((cluster) => (
                  <Link
                    key={cluster.id}
                    href={`/clusters/${cluster.id}`}
                    prefetch={true}
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: cluster.color }}
                    />
                    <span className="flex-1 truncate">{cluster.name}</span>
                  </Link>
                ))}
                <Link
                  href="/clusters"
                  prefetch={true}
                  onClick={onNavigate}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                >
                  <span className="h-2 w-2 rounded-full shrink-0 border border-muted-foreground/40" />
                  <span className="flex-1 truncate text-muted-foreground/60">
                    Manage clusters
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={cn(
          "pb-4 space-y-2 mt-auto flex flex-col",
          collapsed ? "px-1.5" : "px-3",
        )}
      >
        <Link
          href="/settings"
          prefetch={true}
          onClick={onNavigate}
          className={cn(
            "flex items-center text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200",
            collapsed
              ? "justify-center h-10 w-10 p-0 mx-auto rounded-lg"
              : "gap-3 rounded-lg px-3 py-2",
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <div
          className={cn(
            "transition-all duration-250",
            collapsed
              ? "flex justify-center py-2 bg-transparent border-transparent"
              : "rounded-xl border border-border bg-card/60 p-3 flex items-center gap-3",
          )}
          title={collapsed ? settings?.name || "Zara Ahmed" : undefined}
        >
          <div className="h-9 w-9 rounded-full bg-gradient-violet flex items-center justify-center text-xs font-semibold text-primary-foreground shadow-[0_0_16px_-4px_oklch(0.66_0.21_295/0.8)] shrink-0">
            {settings?.name?.[0] || "Z"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 animate-fade-in">
              <div className="text-sm font-medium truncate">
                {settings?.name || "Zara Ahmed"}
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                {settings?.plan === "pro"
                  ? "Pro plan"
                  : settings?.plan === "enterprise"
                    ? "Enterprise plan"
                    : "Free plan"}{" "}
                · <Flame className="h-3 w-3 text-orange-500" /> 7-day streak
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const AppSidebar = memo(function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex shrink-0 flex-col border-r border-border bg-sidebar sticky top-0 h-screen transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      <SidebarBody collapsed={collapsed} onToggleCollapse={handleToggle} />
    </aside>
  );
});

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
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarBody onNavigate={() => onOpenChange(false)} collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
