"use client";

import { Badge } from "@mantine/core";
import { SKILL_STATUS_CONFIG } from "../../core/skill-status-colors";
import type { SkillStatus } from "../../core/skill-status.types";

export function SkillStatusBadge({ status }: { status: SkillStatus }) {
  const config = SKILL_STATUS_CONFIG[status];
  return (
    <Badge size="sm" variant="light" color={config.badgeColor}>
      {config.label}
    </Badge>
  );
}
