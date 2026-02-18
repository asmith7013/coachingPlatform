"use client";

import { useParams } from "next/navigation";
import { Title, Text, Card } from "@mantine/core";
import { ActionPlanForm } from "@/lib/skills-hub/components/action-plans/ActionPlanForm";

export default function NewActionPlanPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  return (
    <div className="mx-auto" style={{ maxWidth: "900px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>Create Action Plan</Title>
        <Text size="sm" c="dimmed">
          Define goals, skills, and steps for this teacher
        </Text>
      </Card>

      <Card shadow="sm" p="lg">
        <ActionPlanForm teacherStaffId={teacherId} />
      </Card>
    </div>
  );
}
