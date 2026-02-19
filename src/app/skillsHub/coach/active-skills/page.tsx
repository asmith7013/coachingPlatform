"use client";

import { useRouter } from "next/navigation";
import { Title, Text, Card } from "@mantine/core";
import { useSkillsHubFilters } from "@/lib/skills-hub/hooks/useSkillsHubFilters";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";

export default function ActiveSkillsLandingPage() {
  const router = useRouter();
  const { selectedTeacherId, setSelectedTeacherId } = useSkillsHubFilters();

  const handleTeacherChange = (teacherId: string | null) => {
    setSelectedTeacherId(teacherId);
    if (teacherId) {
      router.push(`/skillsHub/coach/active-skills/${teacherId}`);
    }
  };

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>Active Skills</Title>
        <Text size="sm" c="dimmed">
          Teacher skill progression and observations
        </Text>
      </Card>

      <CoachTeacherSelector
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={handleTeacherChange}
      />

      <Card shadow="sm" p="lg">
        <Text c="dimmed" ta="center" py="xl">
          Select a teacher to view their active skills
        </Text>
      </Card>
    </div>
  );
}
