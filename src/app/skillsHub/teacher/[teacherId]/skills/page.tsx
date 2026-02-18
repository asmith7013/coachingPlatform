"use client";

import { Title, Text, Card } from "@mantine/core";
import { useSkillsHubFilters } from "@/lib/skills-hub/hooks/useSkillsHubFilters";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";
import { SkillMap } from "@/lib/skills-hub/components/skills/SkillMap";

export default function TeacherProgressPage() {
  const {
    selectedCoachId,
    selectedTeacherId,
    setSelectedCoachId,
    setSelectedTeacherId,
  } = useSkillsHubFilters();

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>My Progress</Title>
        <Text size="sm" c="dimmed">
          Overall progress across all skills and resources to deepen your
          practice
        </Text>
      </Card>

      <CoachTeacherSelector
        selectedCoachId={selectedCoachId}
        onCoachChange={setSelectedCoachId}
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={setSelectedTeacherId}
      />

      {selectedTeacherId ? (
        <SkillMap teacherStaffId={selectedTeacherId} isCoachView={false} />
      ) : (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            Select a teacher to view their progress
          </Text>
        </Card>
      )}
    </div>
  );
}
