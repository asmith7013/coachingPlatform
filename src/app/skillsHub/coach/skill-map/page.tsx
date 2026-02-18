"use client";

import { Title, Text, Card } from "@mantine/core";
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";
import { useSkillsHubFilters } from "../_hooks/useSkillsHubFilters";
import { CoachTeacherSelector } from "../_components/CoachTeacherSelector";
import { SkillMap } from "../_components/SkillMap";

export default function SkillMapPage() {
  const { hasRole } = useAuthenticatedUser();
  const isCoach =
    hasRole("coach") || hasRole("super_admin") || hasRole("director");

  const {
    selectedCoachId,
    selectedTeacherId,
    setSelectedCoachId,
    setSelectedTeacherId,
  } = useSkillsHubFilters();

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>Skill Map</Title>
        <Text size="sm" c="dimmed">
          Teacher skill progression across all domains
        </Text>
      </Card>

      <CoachTeacherSelector
        selectedCoachId={selectedCoachId}
        onCoachChange={setSelectedCoachId}
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={setSelectedTeacherId}
      />

      {selectedTeacherId ? (
        <SkillMap teacherStaffId={selectedTeacherId} isCoachView={isCoach} />
      ) : (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            Select a teacher to view their skill map
          </Text>
        </Card>
      )}
    </div>
  );
}
