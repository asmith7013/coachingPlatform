"use client";

import { SummerProgramShell } from "@components/features/313/SummerProgramShell";

export default function SummerProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SummerProgramShell>{children}</SummerProgramShell>;
}
