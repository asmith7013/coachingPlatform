"use client";

import { Card, Text, Box, Group, UnstyledButton } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { getSkillIcon } from "../../core/skill-icons";
import { SKILL_STATUS_COLORS } from "../../core/skill-status-colors";
import type { SkillStatus } from "../../core/skill-status.types";

interface SkillHalf {
  skillId: string;
  skillName: string;
  description: string;
  status: SkillStatus;
  isLocked: boolean;
  level: 1 | 2;
}

interface SkillPairCardProps {
  l1: SkillHalf;
  l2: SkillHalf;
  compact?: boolean;
  onSkillClick?: (skillId: string) => void;
}

function SkillHalfContent({
  skill,
  onSkillClick,
}: {
  skill: SkillHalf;
  onSkillClick?: (skillId: string) => void;
}) {
  const Icon = getSkillIcon(skill.skillId);
  const colors = SKILL_STATUS_COLORS[skill.status];

  const inner = (
    <Box
      p="sm"
      style={{
        opacity: skill.isLocked ? 0.5 : 1,
        cursor: skill.isLocked ? "default" : "pointer",
        minWidth: 0,
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: colors.iconBg,
            border: `2px solid ${colors.iconBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {skill.isLocked ? (
            <IconLock size={18} color="var(--mantine-color-gray-5)" />
          ) : (
            <Icon size={18} stroke={1.5} color={colors.iconColor} />
          )}
        </Box>
        <div style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" fw={500}>
            Level {skill.level}
          </Text>
          <Text size="sm" fw={500} lineClamp={2}>
            {skill.skillName}
          </Text>
          {skill.description && (
            <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
              {skill.description}
            </Text>
          )}
        </div>
      </Group>
    </Box>
  );

  if (skill.isLocked) {
    return inner;
  }

  return (
    <UnstyledButton
      onClick={() => onSkillClick?.(skill.skillId)}
      style={{ minWidth: 0, display: "block" }}
    >
      {inner}
    </UnstyledButton>
  );
}

export function SkillPairCard({
  l1,
  l2,
  compact,
  onSkillClick,
}: SkillPairCardProps) {
  return (
    <Card shadow="xs" withBorder p={0}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
          borderCollapse: "collapse",
        }}
      >
        <SkillHalfContent skill={l1} onSkillClick={onSkillClick} />
        <Box
          style={
            compact
              ? { borderTop: "1px solid var(--mantine-color-gray-3)" }
              : { borderLeft: "1px solid var(--mantine-color-gray-3)" }
          }
        >
          <SkillHalfContent skill={l2} onSkillClick={onSkillClick} />
        </Box>
      </div>
    </Card>
  );
}
