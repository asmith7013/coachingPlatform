"use client";

import { Box } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { SKILL_STATUS_CONFIG } from "../../core/skill-status-colors";
import type { SkillStatus } from "../../core/skill-status.types";

interface SkillStatusDotProps {
  status: SkillStatus;
  size?: number;
}

export function SkillStatusDot({ status, size = 14 }: SkillStatusDotProps) {
  const color = SKILL_STATUS_CONFIG[status].dotColor;

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
        border: `2px solid ${color}`,
      }}
    />
  );
}
