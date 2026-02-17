"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { PERMISSIONS } from "@core-types/auth";
import { SetupRedirect } from "./SetupRedirect";

export function DashboardAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredPermission={PERMISSIONS.DASHBOARD_VIEW}>
      <SetupRedirect>{children}</SetupRedirect>
    </AuthGuard>
  );
}
