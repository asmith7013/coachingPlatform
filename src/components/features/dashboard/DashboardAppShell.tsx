"use client";

import { AppShell } from "@/components/composed/layouts/AppShell";
import { useAuthorizedNavigation } from "@/hooks/ui/useAuthorizedNavigation";
import { teamItems } from "@/app/dashboard/config";

export function DashboardAppShell({ children }: { children: React.ReactNode }) {
  const { navigation, pageInfo, breadcrumbs } = useAuthorizedNavigation();

  return (
    <AppShell
      navigation={navigation}
      teams={teamItems}
      pageTitle={pageInfo.title}
      pageDescription={pageInfo.description}
      breadcrumbs={breadcrumbs}
      showTeams={true}
    >
      {children}
    </AppShell>
  );
}
