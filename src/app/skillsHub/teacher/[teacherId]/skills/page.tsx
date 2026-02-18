"use client";

import { useParams } from "next/navigation";
import { Title, Text, Container } from "@mantine/core";
import { SkillProgressionView } from "@/lib/skills-hub/components/skills/SkillProgressionView";

export default function TeacherProgressPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  return (
    <Container size="xl" py="lg">
      <div>
        <Title order={2}>My Progress</Title>
        <Text size="sm" c="dimmed" mb="lg">
          Track your teaching skill development
        </Text>
      </div>
      <SkillProgressionView teacherStaffId={teacherId} />
    </Container>
  );
}
