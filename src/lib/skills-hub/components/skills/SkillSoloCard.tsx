"use client";

import { Card, Text, Box, Group, UnstyledButton } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { getSkillIcon } from "../../core/skill-icons";
import { SKILL_STATUS_COLORS } from "../../core/skill-status-colors";
import type { SkillStatus } from "../../core/skill-status.types";

interface SkillSoloCardProps {
  skillId: string;
  skillName: string;
  description: string;
  level: 1 | 2;
  status: SkillStatus;
  isLocked: boolean;
  onSkillClick?: (skillId: string) => void;
}

export function SkillSoloCard({
  skillId,
  skillName,
  description,
  level,
  status,
  isLocked,
  onSkillClick,
}: SkillSoloCardProps) {
  const Icon = getSkillIcon(skillId);

  const colors = SKILL_STATUS_COLORS[status];

  const content = (
    <Card
      shadow="xs"
      withBorder
      p="sm"
      style={{
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? "default" : "pointer",
        borderColor: status !== "not_started" ? colors.cardBorder : undefined,
        borderWidth: status !== "not_started" ? 2 : undefined,
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
          {isLocked ? (
            <IconLock size={18} color="var(--mantine-color-gray-5)" />
          ) : (
            <Icon size={18} stroke={1.5} color={colors.iconColor} />
          )}
        </Box>
        <div style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" fw={500}>
            Level {level}
          </Text>
          <Text size="sm" fw={500} lineClamp={2}>
            {skillName}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
              {description}
            </Text>
          )}
        </div>
      </Group>
    </Card>
  );

  if (isLocked) {
    return content;
  }

  return (
    <UnstyledButton onClick={() => onSkillClick?.(skillId)} w="100%">
      {content}
    </UnstyledButton>
  );
}
