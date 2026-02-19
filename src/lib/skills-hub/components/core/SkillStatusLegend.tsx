"use client";

import { Group, Text } from "@mantine/core";
import { SkillStatusDot } from "../skills/SkillStatusDot";
import { SKILL_STATUS_LABELS } from "../../core/skill-status-colors";

export function SkillStatusLegend() {
  return (
    <Group
      gap="lg"
      py="sm"
      px="md"
      style={{ maxWidth: 1320, margin: "0 auto" }}
    >
      {SKILL_STATUS_LABELS.map(({ status, label }) => (
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
