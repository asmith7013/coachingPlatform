"use client";

import { PublicSummerProgramShell } from "@components/features/313/PublicSummerProgramShell";

export default function SummerProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicSummerProgramShell>{children}</PublicSummerProgramShell>;
}
