"use client";

import { SkillStatusLegend } from "./SkillStatusLegend";
import { useStatusLegend } from "./StatusLegendContext";

export function StatusLegendFooter() {
  const { visible } = useStatusLegend();

  if (!visible) return null;

  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "var(--mantine-color-gray-0)",
        borderTop: "1px solid var(--mantine-color-gray-3)",
        zIndex: 100,
      }}
    >
      <SkillStatusLegend />
    </footer>
  );
}
