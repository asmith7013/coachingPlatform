"use client";

import { useParams } from "next/navigation";
import { Title, Text, Container } from "@mantine/core";
import { SkillProgressionView } from "@/lib/skills-hub/components/skills/SkillProgressionView";

export default function TeacherDashboardPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  return (
    <Container size="xl" py="lg">
      <div>
        <Title order={2}>My Skills</Title>
        <Text size="sm" c="dimmed" mb="lg">
          Your skill progression across all domains
        </Text>
      </div>
      <SkillProgressionView teacherStaffId={teacherId} />
    </Container>
  );
}
