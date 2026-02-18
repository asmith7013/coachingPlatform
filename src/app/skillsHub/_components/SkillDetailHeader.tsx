"use client";

import {
  Title,
  Text,
  Badge,
  Group,
  SegmentedControl,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import Link from "next/link";
import { SkillStatusBadge } from "./SkillStatusBadge";
import { updateSkillStatus } from "../_actions/skill-status.actions";
import type { SkillStatus } from "../_types/skill-status.types";
import type { TeacherSkillFlat } from "../_types/taxonomy.types";

interface SkillDetailHeaderProps {
  skill: TeacherSkillFlat;
  status: SkillStatus;
  teacherStaffId: string;
  isCoachView: boolean;
  onStatusChanged: () => void;
}

const STATUS_OPTIONS = [
  { label: "Not Started", value: "not_started" },
  { label: "Active", value: "active" },
  { label: "Developing", value: "developing" },
  { label: "Proficient", value: "proficient" },
];

export function SkillDetailHeader({
  skill,
  status,
  teacherStaffId,
  isCoachView,
  onStatusChanged,
}: SkillDetailHeaderProps) {
  const handleStatusChange = async (value: string) => {
    await updateSkillStatus(teacherStaffId, skill.uuid, value as SkillStatus);
    onStatusChanged();
  };

  return (
    <div>
      <Breadcrumbs mb="sm">
        <Anchor component={Link} href="/skillsHub" size="sm">
          Skills Hub
        </Anchor>
        <Text size="sm" c="dimmed">
          {skill.domainName}
        </Text>
        <Text size="sm" c="dimmed">
          {skill.subDomainName}
        </Text>
      </Breadcrumbs>

      <Group justify="space-between" align="flex-start">
        <div>
          <Group gap="sm">
            <Title order={2}>{skill.name}</Title>
            <Badge
              variant="outline"
              color={skill.level === 1 ? "blue" : "violet"}
            >
              Level {skill.level}
            </Badge>
            <SkillStatusBadge status={status} />
          </Group>
          <Text c="dimmed" mt="xs">
            {skill.description}
          </Text>
        </div>

        {isCoachView && (
          <SegmentedControl
            data={STATUS_OPTIONS}
            value={status}
            onChange={handleStatusChange}
            size="xs"
          />
        )}
      </Group>
    </div>
  );
}
