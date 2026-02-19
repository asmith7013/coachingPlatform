"use client";

import { useParams } from "next/navigation";
import { Title, Text, Card } from "@mantine/core";
import { SkillProgressionForm } from "@/lib/skills-hub/components/skill-progressions/SkillProgressionForm";

export default function NewSkillProgressionPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  return (
    <div className="mx-auto" style={{ maxWidth: "900px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>Create Skill Progression</Title>
        <Text size="sm" c="dimmed">
          Define goals, skills, and steps for this teacher
        </Text>
      </Card>

      <Card shadow="sm" p="lg">
        <SkillProgressionForm teacherStaffId={teacherId} />
      </Card>
    </div>
  );
}
