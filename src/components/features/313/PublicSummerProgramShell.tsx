"use client";

import { SummerProgramAppShell } from "./SummerProgramAppShell";

/**
 * Public version of the Summer Program Shell that doesn't require Clerk authentication.
 * Used specifically for student dashboard routes that have their own authentication system.
 */
export function PublicSummerProgramShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SummerProgramAppShell>{children}</SummerProgramAppShell>;
}
