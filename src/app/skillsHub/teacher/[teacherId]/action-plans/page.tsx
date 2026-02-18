"use client";

import { Title, Text, Card } from "@mantine/core";
import { useSkillsHubFilters } from "@/lib/skills-hub/hooks/useSkillsHubFilters";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";
import { useActionPlans } from "@/lib/skills-hub/hooks/useActionPlans";
import { ActionPlanList } from "@/lib/skills-hub/components/action-plans/ActionPlanList";

export default function TeacherActionPlansPage() {
  const { selectedTeacherId, setSelectedTeacherId } = useSkillsHubFilters();
  const { plans, loading, error } = useActionPlans(selectedTeacherId ?? "");

  return (
    <div className="mx-auto" style={{ maxWidth: "1200px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>My Action Plans</Title>
        <Text size="sm" c="dimmed">
          Your coaching action plans and progress
        </Text>
      </Card>

      <CoachTeacherSelector
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={setSelectedTeacherId}
      />

      {!selectedTeacherId ? (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            Select a teacher to view their action plans
          </Text>
        </Card>
      ) : error ? (
        <Text c="red">{error}</Text>
      ) : (
        <ActionPlanList
          plans={plans}
          loading={loading}
          teacherStaffId={selectedTeacherId}
        />
      )}
    </div>
  );
}
