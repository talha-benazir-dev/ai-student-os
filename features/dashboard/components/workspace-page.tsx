import type { ReactNode } from "react";
import {
  WorkspaceIcon,
  type WorkspaceIconName,
} from "@/components/workspace-icon";

export function WorkspacePageHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon: WorkspaceIconName;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="workspace-page-heading">
      <div className="min-w-0">
        <WorkspaceIcon name={icon} className="workspace-page-emblem" />
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="workspace-page-actions">{actions}</div>}
    </header>
  );
}
