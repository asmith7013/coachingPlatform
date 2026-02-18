import type { Cycle } from "@zod-schema/core/cycle";

// Helper function
export function getCycleDisplayString(cycle: Cycle): string {
  const parts = [`Cycle ${cycle.cycleNum}`];

  if (cycle.ipgIndicator) {
    parts.push(`- ${cycle.ipgIndicator}`);
  }

  if (cycle.supportCycle) {
    parts.push(`(${cycle.supportCycle})`);
  }

  return parts.join(" ");
}

// Helper function
export function getImplementationIndicatorClass(cycle: Cycle): string {
  const indicator = cycle.implementationIndicator?.toLowerCase();
  if (indicator?.includes("level 3")) return "bg-green-100 text-green-800";
  if (indicator?.includes("level 2")) return "bg-yellow-100 text-yellow-800";
  if (indicator?.includes("level 1")) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

// Helper function
export function getImplementationLevel(indicator: string): string {
  const level = indicator.toLowerCase();
  if (level.includes("level 3")) return "Level 3";
  if (level.includes("level 2")) return "Level 2";
  if (level.includes("level 1")) return "Level 1";
  return "Unknown";
}

// Helper function
export function getActiveLookForsCount(cycle: Cycle): number {
  return cycle.lookFors?.filter((lf) => lf.active)?.length || 0;
}
