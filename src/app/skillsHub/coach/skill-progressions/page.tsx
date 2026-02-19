"use client";

import { Title, Text, Card } from "@mantine/core";
import { useSkillsHubFilters } from "@/lib/skills-hub/hooks/useSkillsHubFilters";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";
import { SkillProgressionList } from "@/lib/skills-hub/components/skill-progressions/SkillProgressionList";
import { useSkillProgressions } from "@/lib/skills-hub/hooks/useSkillProgressions";

export default function SkillProgressionsPage() {
  const { selectedTeacherId, setSelectedTeacherId } = useSkillsHubFilters();

  const { plans, loading, error } = useSkillProgressions(
    selectedTeacherId ?? "",
  );

  return (
    <div className="mx-auto" style={{ maxWidth: "1200px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>Skill Progressions</Title>
        <Text size="sm" c="dimmed">
          Coaching skill progressions and steps
        </Text>
      </Card>

      <CoachTeacherSelector
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={setSelectedTeacherId}
      />

      {error ? (
        <Text c="red">{error}</Text>
      ) : selectedTeacherId ? (
        <SkillProgressionList
          plans={plans}
          loading={loading}
          teacherStaffId={selectedTeacherId}
        />
      ) : (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            Select a teacher to view their skill progressions
          </Text>
        </Card>
      )}
    </div>
  );
}
