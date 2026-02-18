"use client";

import { SimpleGrid, Loader, Text, Center } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { DomainSection } from "./DomainSection";
import { useTaxonomy } from "../_hooks/useTaxonomy";
import {
  useTeacherSkillStatuses,
  skillStatusKeys,
} from "../_hooks/useTeacherSkillStatuses";
import { unlockLevel2 } from "../_actions/skill-status.actions";
import type { TeacherSkillStatusDocument } from "../_types/skill-status.types";

interface SkillMapProps {
  teacherStaffId: string;
  isCoachView: boolean;
}

export function SkillMap({ teacherStaffId, isCoachView }: SkillMapProps) {
  const { taxonomy, loading: taxLoading, error: taxError } = useTaxonomy();
  const {
    statuses,
    loading: statusLoading,
    error: statusError,
  } = useTeacherSkillStatuses(teacherStaffId);
  const queryClient = useQueryClient();

  if (taxLoading || statusLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (taxError || statusError) {
    return (
      <Center py="xl">
        <Text c="red">Error: {taxError || statusError}</Text>
      </Center>
    );
  }

  if (!taxonomy) {
    return (
      <Center py="xl">
        <Text c="dimmed">No taxonomy data available</Text>
      </Center>
    );
  }

  const statusMap = new Map<string, TeacherSkillStatusDocument>();
  for (const s of statuses) {
    statusMap.set(s.skillId, s);
  }

  const handleStatusChanged = () => {
    queryClient.invalidateQueries({
      queryKey: skillStatusKeys.byTeacher(teacherStaffId),
    });
  };

  const handleUnlockLevel2 = async (skillIds: string[]) => {
    await unlockLevel2(teacherStaffId, skillIds);
    handleStatusChanged();
  };

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      {taxonomy.domains.map((domain) => (
        <DomainSection
          key={domain.id}
          domain={domain}
          statusMap={statusMap}
          teacherStaffId={teacherStaffId}
          isCoachView={isCoachView}
          onStatusChanged={handleStatusChanged}
          onUnlockLevel2={handleUnlockLevel2}
        />
      ))}
    </SimpleGrid>
  );
}
