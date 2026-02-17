"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/composed/layouts/AppShell";
import { PERMISSIONS } from "@core-types/auth";
import { analyticsNavigation, analyticsTeams } from "./config";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredPermission={PERMISSIONS.ANALYTICS_VIEW}>
      <AppShell
        navigation={analyticsNavigation}
        teams={analyticsTeams}
        showTeams={false} // Analytics likely doesn't need team switching
      >
        {children}
      </AppShell>
    </AuthGuard>
  );
}
