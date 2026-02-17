"use client";

import { DashboardAuthGuard } from "@components/features/dashboard/DashboardAuthGuard";
import { SummerProgramAppShell } from "./SummerProgramAppShell";

export function SummerProgramShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGuard>
      <SummerProgramAppShell>{children}</SummerProgramAppShell>
    </DashboardAuthGuard>
  );
}

{
  /* <DashboardAuthGuard>
<SummerProgramAppShell>
  {children}
</SummerProgramAppShell>
</DashboardAuthGuard> */
}
