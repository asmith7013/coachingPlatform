"use client";

import { useRouter } from "next/navigation";
import { Table, Text, Skeleton, Stack } from "@mantine/core";
import type { CoachTeacherAssignmentDocument } from "../_types/assignment.types";

interface CaseloadTableProps {
  teachers: CoachTeacherAssignmentDocument[];
  loading: boolean;
}

export function CaseloadTable({ teachers, loading }: CaseloadTableProps) {
  const router = useRouter();

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
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {teachers.map((assignment) => {
          const teacher = assignment.teacherStaffId as unknown as
            | { _id: string; staffName: string }
            | string;
          const teacherName =
            typeof teacher === "object" ? teacher.staffName : "Unknown";
          const teacherId =
            typeof teacher === "object" ? teacher._id : String(teacher);

          return (
          <Table.Tr
            key={assignment._id}
            style={{ cursor: "pointer" }}
            onClick={() =>
              router.push(`/skillsHub/teacher/${teacherId}`)
            }
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
          </Table.Tr>
        );
        })}
      </Table.Tbody>
    </Table>
  );
}
