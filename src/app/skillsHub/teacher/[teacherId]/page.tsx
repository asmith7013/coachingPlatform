"use client";

import { useParams } from "next/navigation";
import { Container } from "@mantine/core";
import { ActiveSkillsView } from "@/lib/skills-hub/components/skills/ActiveSkillsView";

export default function TeacherDashboardPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  return (
    <Container size="xl" py="lg">
      <ActiveSkillsView teacherStaffId={teacherId} />
    </Container>
  );
}
