"use client";

import { DashboardAuthGuard } from "./DashboardAuthGuard";
import { DashboardAppShell } from "./DashboardAppShell";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAuthGuard>
      <DashboardAppShell>{children}</DashboardAppShell>
    </DashboardAuthGuard>
  );
}
