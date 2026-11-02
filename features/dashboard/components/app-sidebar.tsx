"use client";

import Link, { useLinkStatus } from "next/link";
import { NucleusMark } from "@/components/nucleus-mark";
import { usePathname } from "next/navigation";
import { memo, useState } from "react";
import { useStoredPreference } from "@/hooks/use-stored-preference";
import { Loader2, ChevronRight } from "lucide-react";
import {
  WorkspaceIcon,
  type WorkspaceIconName,
} from "@/components/workspace-icon";
import { WorkspaceQuickCreate } from "./create-command-menu";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { UserSettings } from "@/features/settings/types";
import { useClusters } from "@/providers/clusters-provider";

type NavItem = {
  to: string;
  label: string;
  icon: WorkspaceIconName;
  badge?: string;
};

const nav: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: "home" },
  { to: "/clusters", label: "Clusters", icon: "clusters" },
  { to: "/notes", label: "Notes", icon: "notes" },
  { to: "/tasks", label: "Tasks", icon: "tasks" },
  { to: "/documents", label: "Documents", icon: "documents" },
  { to: "/flashcards", label: "Flashcards", icon: "review" },
  { to: "/ai", label: "Study assistant", icon: "assistant" },
  { to: "/analytics", label: "Analytics", icon: "analytics" },
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
  icon,
  badge,
  onClick,
  collapsed = false,
}: NavItem & { onClick?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();
  const active = pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link
      href={to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center transition-all duration-200",
        collapsed
          ? "justify-center h-10 w-10 p-0 mx-auto rounded-lg"
          : "gap-2.5 rounded-md px-3 py-2 text-[13px]",
        active
          ? "bg-sidebar-accent text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
      title={collapsed ? label : undefined}
    >
      <WorkspaceIcon
        name={icon}
        className={cn(
          "h-4 w-4 shrink-0 transition-colors duration-200",
          active ? "text-foreground" : "",
        )}
      />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      <NavigationProgress />
      {!collapsed && badge && (
        <span className="text-[9px] tracking-widest px-1.5 py-0.5 rounded border border-primary/30 text-primary bg-primary/10 animate-fade-in">
          {badge}
        </span>
      )}
    </Link>
  );
}

function NavigationProgress() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span role="status" aria-label="Opening page">
      <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />
    </span>
  ) : null;
}

function SidebarBody({
  settings,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  settings: UserSettings | null;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { clusters } = useClusters();
  const [clustersOpen, setClustersOpen] = useState(true);

  return (
    <>
      {collapsed ? (
        <div className="flex items-center justify-center h-14">
          <button
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-primary/20 transition-all duration-200 cursor-pointer"
            title="Expand sidebar"
          >
            <PanelRightCloseIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md text-foreground">
              <NucleusMark className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight">
                Nucleus
              </div>
              <div className="text-[11px] text-muted-foreground">
                Personal workspace
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
          "min-h-0 flex-1 overflow-y-auto overscroll-contain pt-3",
          collapsed ? "px-1.5" : "px-3",
        )}
      >
        {!collapsed && <WorkspaceQuickCreate onOpen={onNavigate} />}
        {!collapsed && (
          <div className="px-3 pb-2 pt-4 text-[11px] text-muted-foreground">
            Your library
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
              className="w-full flex items-center justify-between px-3 pb-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
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
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-sm shrink-0"
                      style={{ backgroundColor: cluster.color }}
                    />
                    <span className="flex-1 truncate">{cluster.name}</span>
                  </Link>
                ))}
                <Link
                  href="/clusters"
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
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
          onClick={onNavigate}
          className={cn(
            "flex items-center text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200",
            collapsed
              ? "justify-center h-10 w-10 p-0 mx-auto rounded-lg"
              : "gap-3 rounded-lg px-3 py-2",
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <WorkspaceIcon name="settings" className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <div
          className={cn(
            "transition-all duration-250",
            collapsed
              ? "flex justify-center py-2 bg-transparent border-transparent"
              : "p-3 flex items-center gap-3",
          )}
          title={collapsed ? settings?.name || "Your workspace" : undefined}
        >
          <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-xs font-medium text-foreground shrink-0">
            {settings?.name?.[0]?.toUpperCase() || "N"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 animate-fade-in">
              <div className="text-sm font-medium truncate">
                {settings?.name || "Your workspace"}
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                {settings?.plan === "pro"
                  ? "Pro plan"
                  : settings?.plan === "enterprise"
                    ? "Enterprise plan"
                    : "Free plan"}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const AppSidebar = memo(function AppSidebar({
  settings,
}: {
  settings: UserSettings | null;
}) {
  const [storedCollapsed, setStoredCollapsed] = useStoredPreference(
    "sidebar-collapsed",
    "false",
  );
  const collapsed = storedCollapsed === "true";

  const handleToggle = () => {
    const next = !collapsed;
    setStoredCollapsed(String(next));
  };

  return (
    <aside
      className={cn(
        "workspace-sidebar hidden lg:flex shrink-0 flex-col border-r border-border bg-sidebar sticky top-0 h-screen",
        collapsed ? "w-[68px]" : "w-[216px]",
      )}
    >
      <SidebarBody
        settings={settings}
        collapsed={collapsed}
        onToggleCollapse={handleToggle}
      />
    </aside>
  );
});

export function MobileSidebar({
  settings,
  open,
  onOpenChange,
}: {
  settings: UserSettings | null;
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
        <SidebarBody
          settings={settings}
          onNavigate={() => onOpenChange(false)}
          collapsed={false}
        />
      </SheetContent>
    </Sheet>
  );
}
