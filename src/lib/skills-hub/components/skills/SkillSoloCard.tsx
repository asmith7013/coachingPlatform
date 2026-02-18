"use client";

import Link from "next/link";
import { Card, Text, Box, Group, UnstyledButton } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { SkillStatusDot } from "./SkillStatusDot";
import { getSkillIcon } from "../../core/skill-icons";
import type { SkillStatus } from "../../core/skill-status.types";

interface SkillSoloCardProps {
  skillId: string;
  skillName: string;
  status: SkillStatus;
  isLocked: boolean;
  teacherStaffId: string;
}

export function SkillSoloCard({
  skillId,
  skillName,
  status,
  isLocked,
  teacherStaffId,
}: SkillSoloCardProps) {
  const Icon = getSkillIcon(skillId);

  const content = (
    <Card
      shadow="xs"
      withBorder
      p="sm"
      style={{
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? "default" : "pointer",
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
                status === "proficient"
                  ? "var(--mantine-color-teal-1)"
                  : "var(--mantine-color-gray-1)",
              border:
                status === "active" || status === "developing"
                  ? "2px solid var(--mantine-color-teal-5)"
                  : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isLocked ? (
              <IconLock size={18} color="var(--mantine-color-gray-5)" />
            ) : (
              <Icon size={18} stroke={1.5} />
            )}
          </Box>
          <Text size="sm" fw={500} lineClamp={2}>
            {skillName}
          </Text>
        </Group>
        {!isLocked && <SkillStatusDot status={status} />}
      </Group>
    </Card>
  );

  if (isLocked) {
    return content;
  }

  return (
    <UnstyledButton
      component={Link}
      href={`/skillsHub/skill/${skillId}?teacherId=${teacherStaffId}`}
      w="100%"
    >
      {content}
    </UnstyledButton>
  );
}
