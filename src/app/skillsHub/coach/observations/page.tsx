"use client";

import { Title, Text, Card } from "@mantine/core";
import { useSkillsHubFilters } from "@/lib/skills-hub/hooks/useSkillsHubFilters";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";
import { ObservationGuide } from "@/lib/skills-hub/components/observations/ObservationGuide";

export default function ObservationsPage() {
  const {
    selectedCoachId,
    selectedTeacherId,
    setSelectedCoachId,
    setSelectedTeacherId,
  } = useSkillsHubFilters();

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>Observations</Title>
        <Text size="sm" c="dimmed">
          Record classroom observations using the coaching guide
        </Text>
      </Card>

      <CoachTeacherSelector
        selectedCoachId={selectedCoachId}
        onCoachChange={setSelectedCoachId}
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={setSelectedTeacherId}
      />

      {selectedTeacherId ? (
        <ObservationGuide teacherStaffId={selectedTeacherId} />
      ) : (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            Select a teacher to begin an observation
          </Text>
        </Card>
      )}
    </div>
  );
}
