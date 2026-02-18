"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  MultiSelect,
  Table,
  Button,
  Group,
  Stack,
  Text,
  Title,
  ActionIcon,
  Modal,
  SimpleGrid,
  Card,
  Loader,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconUserPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { CreateStaffModal } from "./CreateStaffModal";
import {
  getCoaches,
  getTeachers,
  getCoachTeachers,
  assignTeacher,
  removeAssignment,
} from "../_actions/assignments.actions";
import type { StaffOption } from "../_actions/assignments.actions";
import type { CoachTeacherAssignmentDocument } from "../_types/assignment.types";

export function AssignmentManager() {
  const queryClient = useQueryClient();
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [
    teacherModalOpened,
    { open: openTeacherModal, close: closeTeacherModal },
  ] = useDisclosure(false);
  const [coachModalOpened, { open: openCoachModal, close: closeCoachModal }] =
    useDisclosure(false);

  const { data: coaches, isLoading: coachesLoading } = useQuery({
    queryKey: ["skillshub-coaches"],
    queryFn: async () => {
      const result = await getCoaches();
      if (!result.success) throw new Error(result.error);
      return result.data as StaffOption[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["skillshub-teachers"],
    queryFn: async () => {
      const result = await getTeachers();
      if (!result.success) throw new Error(result.error);
      return result.data as StaffOption[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["skillshub-assignments", selectedCoachId],
    queryFn: async () => {
      if (!selectedCoachId) return [];
      const result = await getCoachTeachers(selectedCoachId);
      if (!result.success) throw new Error(result.error);
      return result.data as CoachTeacherAssignmentDocument[];
    },
    enabled: !!selectedCoachId,
    staleTime: 60 * 1000,
  });

  const assignedTeacherIds = new Set(
    (assignments || []).map((a) => {
      const t = a.teacherStaffId;
      return typeof t === "object" && t !== null
        ? (t as Record<string, string>)._id
        : t;
    }),
  );

  const availableTeachers = (teachers || []).filter(
    (t) => !assignedTeacherIds.has(t._id),
  );

  const coachOptions = (coaches || []).map((c) => ({
    value: c._id,
    label: `${c.staffName}${c.email ? ` (${c.email})` : ""}`,
  }));

  const teacherOptions = availableTeachers.map((t) => ({
    value: t._id,
    label: `${t.staffName}${t.email ? ` (${t.email})` : ""}`,
  }));

  const selectedCoach = coaches?.find((c) => c._id === selectedCoachId);

  const handleAssign = async () => {
    if (!selectedCoachId || selectedTeacherIds.length === 0) return;

    setAssigning(true);
    let successCount = 0;
    let errorCount = 0;

    for (const teacherId of selectedTeacherIds) {
      const result = await assignTeacher(selectedCoachId, teacherId);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    setAssigning(false);
    setSelectedTeacherIds([]);

    if (successCount > 0) {
      notifications.show({
        title: "Teachers assigned",
        message: `${successCount} teacher(s) assigned successfully`,
        color: "teal",
      });
    }
    if (errorCount > 0) {
      notifications.show({
        title: "Some assignments failed",
        message: `${errorCount} assignment(s) failed`,
        color: "red",
      });
    }

    queryClient.invalidateQueries({
      queryKey: ["skillshub-assignments", selectedCoachId],
    });
  };

  const handleRemove = async () => {
    if (!removeTarget) return;

    const result = await removeAssignment(removeTarget.id);
    setRemoveTarget(null);

    if (result.success) {
      notifications.show({
        title: "Assignment removed",
        message: `${removeTarget.name} has been removed from ${selectedCoach?.staffName}'s caseload`,
        color: "teal",
      });
      queryClient.invalidateQueries({
        queryKey: ["skillshub-assignments", selectedCoachId],
      });
    } else {
      notifications.show({
        title: "Error",
        message: result.error || "Failed to remove assignment",
        color: "red",
      });
    }
  };

  if (coachesLoading || teachersLoading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Coach-Teacher Assignments</Title>
          <Group>
            <Button
              variant="light"
              leftSection={<IconUserPlus size={16} />}
              onClick={openTeacherModal}
              size="sm"
            >
              Add Teacher
            </Button>
            <Button
              variant="light"
              leftSection={<IconUserPlus size={16} />}
              onClick={openCoachModal}
              size="sm"
            >
              Add Coach
            </Button>
          </Group>
        </Group>

        {(!coaches || coaches.length === 0) && (
          <Text c="dimmed" ta="center" py="xl">
            No staff members with coach role found. Use &quot;Add Coach&quot;
            above to create one.
          </Text>
        )}

        {coaches && coaches.length > 0 && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {/* Left Panel: Coach Selection + Current Caseload */}
          <Card withBorder p="lg">
            <Stack gap="md">
              <Title order={4}>Select Coach</Title>
              <Select
                placeholder="Search for a coach..."
                searchable
                data={coachOptions}
                value={selectedCoachId}
                onChange={setSelectedCoachId}
              />

              {!selectedCoachId ? (
                <Text c="dimmed" size="sm">
                  Select a coach to view their caseload
                </Text>
              ) : assignmentsLoading ? (
                <Center py="md">
                  <Loader size="sm" />
                </Center>
              ) : !assignments || assignments.length === 0 ? (
                <Text c="dimmed" size="sm">
                  No teachers assigned to this coach
                </Text>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Teacher</Table.Th>
                      <Table.Th>School</Table.Th>
                      <Table.Th>Assigned</Table.Th>
                      <Table.Th w={50} />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {assignments.map((a) => {
                      const teacher = a.teacherStaffId as unknown as {
                        _id: string;
                        staffName: string;
                        email?: string;
                      };
                      const teacherName =
                        typeof teacher === "object"
                          ? teacher.staffName
                          : "Unknown";

                      return (
                        <Table.Tr key={a._id}>
                          <Table.Td>{teacherName}</Table.Td>
                          <Table.Td>{a.schoolId ?? "—"}</Table.Td>
                          <Table.Td>
                            {new Date(a.assignedAt).toLocaleDateString()}
                          </Table.Td>
                          <Table.Td>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() =>
                                setRemoveTarget({
                                  id: a._id,
                                  name: teacherName,
                                })
                              }
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Card>

          {/* Right Panel: Add Teachers */}
          <Card withBorder p="lg">
            <Stack gap="md">
              <Title order={4}>Add Teachers</Title>

              {!selectedCoachId ? (
                <Text c="dimmed" size="sm">
                  Select a coach first to assign teachers
                </Text>
              ) : (
                <>
                  <MultiSelect
                    placeholder="Search and select teachers..."
                    searchable
                    data={teacherOptions}
                    value={selectedTeacherIds}
                    onChange={setSelectedTeacherIds}
                  />

                  <Group justify="flex-end">
                    <Button
                      onClick={handleAssign}
                      loading={assigning}
                      disabled={selectedTeacherIds.length === 0}
                    >
                      Assign Selected Teachers
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          </Card>
        </SimpleGrid>
        )}
      </Stack>

      <CreateStaffModal
        opened={teacherModalOpened}
        onClose={closeTeacherModal}
        role="Teacher"
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["skillshub-teachers"] });
        }}
      />

      <CreateStaffModal
        opened={coachModalOpened}
        onClose={closeCoachModal}
        role="Coach"
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["skillshub-coaches"] });
        }}
      />

      {/* Remove confirmation modal */}
      <Modal
        opened={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Confirm Removal"
        centered
      >
        <Stack gap="md">
          <Text>
            Remove <strong>{removeTarget?.name}</strong> from{" "}
            <strong>{selectedCoach?.staffName}</strong>&apos;s caseload?
          </Text>
          <Text size="sm" c="dimmed">
            Existing action plans and notes will remain visible as historical
            records.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleRemove}>
              Remove
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
