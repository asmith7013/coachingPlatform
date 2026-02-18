"use client";

import { Group, Text } from "@mantine/core";
import { SkillStatusDot } from "../skills/SkillStatusDot";
import type { SkillStatus } from "../../core/skill-status.types";

const STATUS_LABELS: { status: SkillStatus; label: string }[] = [
  { status: "not_started", label: "Not Started" },
  { status: "active", label: "Active" },
  { status: "developing", label: "Developing" },
  { status: "proficient", label: "Proficient" },
];

export function SkillStatusLegend() {
  return (
    <Group gap="lg" justify="center" py="md">
      {STATUS_LABELS.map(({ status, label }) => (
        <Group key={status} gap={6}>
          <SkillStatusDot status={status} size={12} />
          <Text size="xs" c="dimmed">
            {label}
          </Text>
        </Group>
      ))}
    </Group>
  );
}
