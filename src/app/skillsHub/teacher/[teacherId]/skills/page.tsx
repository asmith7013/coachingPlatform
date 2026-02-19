"use client";

import { useParams } from "next/navigation";
import { Container } from "@mantine/core";
import { SkillProgressionView } from "@/lib/skills-hub/components/skills/SkillProgressionView";

export default function TeacherProgressPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  return (
    <Container size="xl" py="lg">
      <SkillProgressionView teacherStaffId={teacherId} />
    </Container>
  );
}
