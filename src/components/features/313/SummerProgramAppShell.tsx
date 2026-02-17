"use client";

import { AppShell } from "@/components/composed/layouts/AppShell";
import { navigationItems, teamItems, pageMetadata } from "@/app/313/config";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function SummerProgramAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if this is a student dashboard route
  const isStudentRoute = useMemo(() => {
    // Pattern: /313/[studentId] where studentId is numeric
    const studentRoutePattern = /^\/313student\/[^/]+/;
    return studentRoutePattern.test(pathname);
  }, [pathname]);

  // Use 313 config directly since useAuthorizedNavigation might not support config path yet
  const { navigation, breadcrumbs } = useMemo(() => {
    // Mark current navigation item
    const currentNavigation = navigationItems.map((item) => ({
      ...item,
      current: item.href === pathname,
    }));

    // Generate breadcrumbs
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const meta = pageMetadata[href];
      return {
        name: meta?.title || segment,
        href,
        current: index === pathSegments.length - 1,
      };
    });

    return {
      navigation: currentNavigation,
      breadcrumbs,
    };
  }, [pathname]);

  // If student route, render without shell for clean, distraction-free experience
  if (isStudentRoute) {
    return <>{children}</>;
  }

  return (
    <AppShell
      navigation={navigation}
      teams={teamItems}
      breadcrumbs={breadcrumbs}
      showTeams={true}
    >
      {children}
    </AppShell>
  );
}
