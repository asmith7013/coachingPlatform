"use client";

import Link from "next/link";
import { Title, Text, Card, Group, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useSkillsHubFilters } from "@/lib/skills-hub/hooks/useSkillsHubFilters";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";
import { ActionPlanList } from "@/lib/skills-hub/components/action-plans/ActionPlanList";
import { useActionPlans } from "@/lib/skills-hub/hooks/useActionPlans";

export default function ActionPlansPage() {
  const {
    selectedCoachId,
    selectedTeacherId,
    setSelectedCoachId,
    setSelectedTeacherId,
  } = useSkillsHubFilters();

  const { plans, loading, error } = useActionPlans(selectedTeacherId ?? "");

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
          {selectedTeacherId && (
            <Button
              component={Link}
              href={`/skillsHub/teacher/${selectedTeacherId}/action-plans/new`}
              leftSection={<IconPlus size={16} />}
            >
              New Plan
            </Button>
          )}
        </Group>
      </Card>

      <CoachTeacherSelector
        selectedCoachId={selectedCoachId}
        onCoachChange={setSelectedCoachId}
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={setSelectedTeacherId}
      />

      {error ? (
        <Text c="red">{error}</Text>
      ) : selectedTeacherId ? (
        <ActionPlanList
          plans={plans}
          loading={loading}
          teacherStaffId={selectedTeacherId}
        />
      ) : (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            Select a teacher to view their action plans
          </Text>
        </Card>
      )}
    </div>
  );
}
