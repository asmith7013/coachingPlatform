"use client";

import { useParams, useRouter } from "next/navigation";
import { Title, Text, Card } from "@mantine/core";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";
import { ActiveSkillsView } from "@/lib/skills-hub/components/skills/ActiveSkillsView";

export default function ActiveSkillsTeacherPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.teacherId as string;

  const handleTeacherChange = (newTeacherId: string | null) => {
    if (newTeacherId) {
      router.push(`/skillsHub/coach/active-skills/${newTeacherId}`);
    } else {
      router.push("/skillsHub/coach/active-skills");
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
        selectedTeacherId={teacherId}
        onTeacherChange={handleTeacherChange}
      />

      <ActiveSkillsView
        key={teacherId}
        teacherStaffId={teacherId}
        showObservations
      />
    </div>
  );
}
