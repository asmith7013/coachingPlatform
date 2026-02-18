"use client";

import { Badge } from "@mantine/core";
import type { SkillStatus } from "../../core/skill-status.types";

const STATUS_CONFIG: Record<SkillStatus, { color: string; label: string }> = {
  not_started: { color: "gray", label: "Not Started" },
  active: { color: "blue", label: "Active" },
  developing: { color: "yellow", label: "Developing" },
  proficient: { color: "green", label: "Proficient" },
};

export function SkillStatusBadge({ status }: { status: SkillStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge size="sm" variant="light" color={config.color}>
      {config.label}
    </Badge>
  );
}
