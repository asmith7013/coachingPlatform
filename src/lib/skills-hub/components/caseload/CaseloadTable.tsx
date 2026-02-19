"use client";

import Link from "next/link";
import {
  Table,
  Text,
  Skeleton,
  Stack,
  Group,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconEye, IconClipboardPlus, IconMap } from "@tabler/icons-react";
import type { PopulatedAssignment } from "../../admin/coaching-assignments/coaching-assignment.types";

interface CaseloadTableProps {
  teachers: PopulatedAssignment[];
  loading: boolean;
  selectedTeacherId?: string | null;
  onSelectTeacher?: (teacherId: string | null) => void;
}

export function CaseloadTable({
  teachers,
  loading,
  selectedTeacherId,
  onSelectTeacher,
}: CaseloadTableProps) {
  if (loading) {
    return (
      <Stack gap="xs">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={48} />
        ))}
      </Stack>
    );
  }

  if (teachers.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No teachers assigned. Contact your admin to get started.
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Teacher Name</Table.Th>
          <Table.Th>School</Table.Th>
          <Table.Th>Assigned</Table.Th>
          <Table.Th ta="center">Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {teachers.map((assignment) => {
          const teacher = assignment.teacherStaffId;
          const teacherName =
            typeof teacher === "object" ? teacher.staffName : "Unknown";
          const teacherId =
            typeof teacher === "object" ? teacher._id : String(teacher);
          const isSelected = teacherId === selectedTeacherId;

          return (
            <Table.Tr
              key={assignment._id}
              onClick={() => onSelectTeacher?.(isSelected ? null : teacherId)}
              style={{
                cursor: onSelectTeacher ? "pointer" : undefined,
                backgroundColor: isSelected
                  ? "var(--mantine-color-blue-0)"
                  : undefined,
              }}
            >
              <Table.Td>
                <Text size="sm" fw={500}>
                  {teacherName}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{assignment.schoolId}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {new Date(assignment.assignedAt).toLocaleDateString()}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group
                  gap="xs"
                  justify="center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip label="Skill Map">
                    <ActionIcon
                      component={Link}
                      href={`/skillsHub/teacher/${teacherId}`}
                      variant="light"
                      color="blue"
                      size="sm"
                    >
                      <IconMap size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Observe">
                    <ActionIcon
                      component={Link}
                      href={`/skillsHub/coach/teacher/${teacherId}/observe`}
                      variant="light"
                      color="green"
                      size="sm"
                    >
                      <IconEye size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Skill Progressions">
                    <ActionIcon
                      component={Link}
                      href={`/skillsHub/coach/teacher/${teacherId}/skill-progressions`}
                      variant="light"
                      color="violet"
                      size="sm"
                    >
                      <IconClipboardPlus size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
