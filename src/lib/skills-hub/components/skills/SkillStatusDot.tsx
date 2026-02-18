"use client";

import { Box } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import type { SkillStatus } from "../../core/skill-status.types";

const DOT_COLORS: Record<SkillStatus, string> = {
  not_started: "var(--mantine-color-gray-4)",
  active: "var(--mantine-color-blue-5)",
  developing: "var(--mantine-color-yellow-5)",
  proficient: "var(--mantine-color-green-6)",
};

interface SkillStatusDotProps {
  status: SkillStatus;
  size?: number;
}

export function SkillStatusDot({ status, size = 14 }: SkillStatusDotProps) {
  const color = DOT_COLORS[status];

  if (status === "proficient") {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconCheck size={size - 4} color="white" stroke={3} />
      </Box>
    );
  }

  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: status === "not_started" ? "transparent" : color,
        border:
          status === "not_started"
            ? `2px solid ${color}`
            : `2px solid ${color}`,
      }}
    />
  );
}
