"use client";

import { useState } from "react";
import Link from "next/link";
import { Group, Text, Badge, Select, UnstyledButton, Box } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { SkillStatusBadge } from "./SkillStatusBadge";
import { updateSkillStatus } from "../_actions/skill-status.actions";
import type { SkillStatus } from "../_types/skill-status.types";
import type { TeacherSkillFlat } from "../_types/taxonomy.types";

interface SkillCardProps {
  skill: TeacherSkillFlat;
  status: SkillStatus;
  isLocked: boolean;
  teacherStaffId: string;
  isCoachView: boolean;
  onStatusChanged?: () => void;
}

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started" },
  { value: "active", label: "Active" },
  { value: "developing", label: "Developing" },
  { value: "proficient", label: "Proficient" },
];

export function SkillCard({
  skill,
  status,
  isLocked,
  teacherStaffId,
  isCoachView,
  onStatusChanged,
}: SkillCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const isActive = status === "active";

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus) return;
    setSaving(true);
    await updateSkillStatus(
      teacherStaffId,
      skill.uuid,
      newStatus as SkillStatus,
    );
    setSaving(false);
    setEditing(false);
    onStatusChanged?.();
  };

  if (isLocked) {
    return (
      <Box
        py="xs"
        px="sm"
        style={{
          opacity: 0.5,
          borderLeft: "3px solid transparent",
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Text size="sm">{skill.name}</Text>
            <Badge size="xs" variant="light" color="gray">
              Locked
            </Badge>
          </Group>
        </Group>
      </Box>
    );
  }

  if (isCoachView && editing) {
    return (
      <Box
        py="xs"
        px="sm"
        style={{
          borderLeft: isActive
            ? "3px solid var(--mantine-color-blue-5)"
            : "3px solid transparent",
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" fw={500}>
            {skill.name}
          </Text>
          <Select
            size="xs"
            data={STATUS_OPTIONS}
            value={status}
            onChange={handleStatusChange}
            disabled={saving}
            w={140}
            onBlur={() => setEditing(false)}
          />
        </Group>
      </Box>
    );
  }

  const content = (
    <Group justify="space-between" wrap="nowrap">
      <Group gap="xs" wrap="nowrap">
        <Text size="sm">{skill.name}</Text>
        <SkillStatusBadge status={status} />
      </Group>
      <IconChevronRight size={14} color="gray" />
    </Group>
  );

  if (isCoachView) {
    return (
      <UnstyledButton
        onClick={() => setEditing(true)}
        py="xs"
        px="sm"
        w="100%"
        style={{
          borderLeft: isActive
            ? "3px solid var(--mantine-color-blue-5)"
            : "3px solid transparent",
          borderRadius: "4px",
        }}
      >
        {content}
      </UnstyledButton>
    );
  }

  return (
    <UnstyledButton
      component={Link}
      href={`/skillsHub/skill/${skill.id}?teacherId=${teacherStaffId}`}
      py="xs"
      px="sm"
      w="100%"
      style={{
        borderLeft: isActive
          ? "3px solid var(--mantine-color-blue-5)"
          : "3px solid transparent",
        borderRadius: "4px",
      }}
    >
      {content}
    </UnstyledButton>
  );
}
