"use client";

import { Card, Text, Box, Group, UnstyledButton } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { SkillStatusDot } from "./SkillStatusDot";
import { getSkillIcon } from "../../core/skill-icons";
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

  const inner = (
    <Box
      p="sm"
      style={{
        opacity: skill.isLocked ? 0.5 : 1,
        cursor: skill.isLocked ? "default" : "pointer",
        minWidth: 0,
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor:
                skill.status === "proficient"
                  ? "var(--mantine-color-teal-1)"
                  : "var(--mantine-color-gray-1)",
              border:
                skill.status === "active" || skill.status === "developing"
                  ? "2px solid var(--mantine-color-teal-5)"
                  : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {skill.isLocked ? (
              <IconLock size={18} color="var(--mantine-color-gray-5)" />
            ) : (
              <Icon size={18} stroke={1.5} />
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
        {!skill.isLocked && <SkillStatusDot status={skill.status} />}
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

export function SkillPairCard({ l1, l2, onSkillClick }: SkillPairCardProps) {
  return (
    <Card shadow="xs" withBorder p={0}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderCollapse: "collapse",
        }}
      >
        <SkillHalfContent skill={l1} onSkillClick={onSkillClick} />
        <Box
          style={{
            borderLeft: "1px solid var(--mantine-color-gray-3)",
          }}
        >
          <SkillHalfContent skill={l2} onSkillClick={onSkillClick} />
        </Box>
      </div>
    </Card>
  );
}
