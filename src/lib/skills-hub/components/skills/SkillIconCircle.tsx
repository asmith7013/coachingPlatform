"use client";

import { Box } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { getSkillIcon } from "../../core/skill-icons";
import { SKILL_STATUS_CONFIG } from "../../core/skill-status-colors";
import type { SkillStatus } from "../../core/skill-status.types";

interface SkillIconCircleProps {
  skillId: string;
  status: SkillStatus;
  isLocked: boolean;
  /** Circle diameter in px (default 40) */
  size?: number;
}

export function SkillIconCircle({
  skillId,
  status,
  isLocked,
  size = 40,
}: SkillIconCircleProps) {
  const Icon = getSkillIcon(skillId);
  const colors = SKILL_STATUS_CONFIG[status];
  const iconSize = Math.round(size * 0.45);

  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: colors.iconBg,
        border: `2px solid ${colors.iconBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {isLocked ? (
        <IconLock size={iconSize} color="var(--mantine-color-gray-5)" />
      ) : (
        <Icon size={iconSize} stroke={1.5} color={colors.iconColor} />
      )}
    </Box>
  );
}
