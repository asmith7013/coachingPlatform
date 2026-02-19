"use client";

import Link from "next/link";
import {
  Title,
  Text,
  Card,
  Select,
  Stack,
  Group,
  ActionIcon,
  Tooltip,
  Skeleton,
} from "@mantine/core";
import { IconEye, IconClipboardPlus, IconMap } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useSkillsHubAuth } from "@/lib/skills-hub/components/layout/ViewAsContext";
import { useSkillsHubFilters } from "@/lib/skills-hub/hooks/useSkillsHubFilters";
import { useCoachCaseload } from "@/lib/skills-hub/hooks/useCoachCaseload";
import { ActiveSkillsSummary } from "@/lib/skills-hub/components/skills/ActiveSkillsSummary";
import { getCoaches } from "@/lib/skills-hub/admin/coaching-assignments/coaching-assignment.actions";
import type { StaffOption } from "@/lib/skills-hub/admin/coaching-assignments/coaching-assignment.actions";

export default function CaseloadPage() {
  const { metadata, hasRole } = useSkillsHubAuth();
  const isAdmin = hasRole("super_admin") || hasRole("director");

  const { selectedCoachId, setSelectedCoachId } = useSkillsHubFilters();

  const { data: coaches } = useQuery({
    queryKey: ["skillshub-coaches"],
    queryFn: async () => {
      const result = await getCoaches();
      if (!result.success) throw new Error(result.error);
      return result.data as StaffOption[];
    },
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  const staffId = isAdmin ? (selectedCoachId ?? "") : metadata.staffId || "";
  const { teachers, loading, error } = useCoachCaseload(staffId);

  const coachOptions = (coaches ?? []).map((c) => ({
    value: c._id,
    label: `${c.staffName}${c.email ? ` (${c.email})` : ""}`,
  }));

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>{isAdmin ? "Caseload" : "My Caseload"}</Title>
        <Text size="sm" c="dimmed">
          Teachers assigned for coaching
        </Text>
      </Card>

      {isAdmin && (
        <Card shadow="sm" p="lg" mb="lg">
          <Select
            label="Select Coach"
            placeholder="Search for a coach..."
            searchable
            data={coachOptions}
            value={selectedCoachId}
            onChange={setSelectedCoachId}
          />
        </Card>
      )}

      {error ? (
        <Text c="red">{error}</Text>
      ) : isAdmin && !selectedCoachId ? (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            Select a coach to view their caseload
          </Text>
        </Card>
      ) : loading ? (
        <Stack gap="md">
          {[1, 2, 3].map((i) => (
            <Card key={i} shadow="sm" p="lg" withBorder>
              <Skeleton height={24} width="30%" mb="md" />
              <Skeleton height={80} />
            </Card>
          ))}
        </Stack>
      ) : teachers.length === 0 ? (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            No teachers assigned. Contact your admin to get started.
          </Text>
        </Card>
      ) : (
        <Stack gap="md">
          {teachers.map((assignment) => {
            const teacher = assignment.teacherStaffId;
            const teacherName =
              typeof teacher === "object" ? teacher.staffName : "Unknown";
            const teacherId =
              typeof teacher === "object" ? teacher._id : String(teacher);

            return (
              <Card key={assignment._id} shadow="sm" p="lg" withBorder>
                <Group justify="space-between" align="center" mb="md">
                  <Text fw={600} size="lg">
                    {teacherName}
                  </Text>
                  <Group gap="xs">
                    <Tooltip label="Active Skills">
                      <ActionIcon
                        component={Link}
                        href={`/skillsHub/coach/active-skills/${teacherId}`}
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
                </Group>
                <ActiveSkillsSummary
                  key={teacherId}
                  teacherStaffId={teacherId}
                />
              </Card>
            );
          })}
        </Stack>
      )}
    </div>
  );
}
