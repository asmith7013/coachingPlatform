"use client";

import { useRouter } from "next/navigation";
import { Title, Text, Divider, Stack } from "@mantine/core";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";

export default function ActiveSkillsLandingPage() {
  const router = useRouter();

  const handleTeacherChange = (teacherId: string | null) => {
    if (teacherId) {
      router.push(`/skillsHub/coach/active-skills/${teacherId}`);
    }
  };

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Stack gap="lg">
        <CoachTeacherSelector
          noCard
          selectedTeacherId={null}
          onTeacherChange={handleTeacherChange}
        />
        <Title order={2}>Active Skills</Title>
        <Divider />
        <Text c="dimmed" ta="center" py="xl">
          Select a teacher to view their active skills
        </Text>
      </Stack>
    </div>
  );
}
