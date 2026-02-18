"use client";

import { Title, Text, Card } from "@mantine/core";
import { useSkillsHubFilters } from "@/lib/skills-hub/hooks/useSkillsHubFilters";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";
import { SkillMap } from "@/lib/skills-hub/components/skills/SkillMap";

export default function TeacherDashboardPage() {
  const { selectedTeacherId, setSelectedTeacherId } = useSkillsHubFilters();

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>My Skills</Title>
        <Text size="sm" c="dimmed">
          Your skill progression across all domains
        </Text>
      </Card>

      <CoachTeacherSelector
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={setSelectedTeacherId}
      />

      {selectedTeacherId ? (
        <SkillMap teacherStaffId={selectedTeacherId} isCoachView={false} />
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
