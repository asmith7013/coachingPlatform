"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Title, Text, Card, Group, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useActionPlans } from "@/lib/skills-hub/hooks/useActionPlans";
import { ActionPlanList } from "@/lib/skills-hub/components/action-plans/ActionPlanList";

export default function ActionPlansPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { plans, loading, error } = useActionPlans(teacherId);

  return (
    <div className="mx-auto" style={{ maxWidth: "1200px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Action Plans</Title>
            <Text size="sm" c="dimmed">
              Coaching action plans and steps
            </Text>
          </div>
          <Button
            component={Link}
            href={`/skillsHub/teacher/${teacherId}/action-plans/new`}
            leftSection={<IconPlus size={16} />}
          >
            New Plan
          </Button>
        </Group>
      </Card>

      {error ? (
        <Text c="red">{error}</Text>
      ) : (
        <ActionPlanList
          plans={plans}
          loading={loading}
          teacherStaffId={teacherId}
        />
      )}
    </div>
  );
}
