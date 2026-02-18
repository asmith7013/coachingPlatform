"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Card, Text, Stack, Center } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";
import { useTaxonomy } from "@/lib/skills-hub/hooks/useTaxonomy";
import {
  useTeacherSkillStatuses,
  skillStatusKeys,
} from "@/lib/skills-hub/hooks/useTeacherSkillStatuses";
import { useActionPlans } from "@/lib/skills-hub/hooks/useActionPlans";
import { useObservations } from "@/lib/skills-hub/hooks/useObservations";
import { getSkillById } from "@/lib/skills-hub/core/taxonomy";
import { SkillDetailHeader } from "@/lib/skills-hub/components/skills/SkillDetailHeader";
import { SkillObservationTimeline } from "@/lib/skills-hub/components/observations/SkillObservationTimeline";
import { SkillNotesSection } from "@/lib/skills-hub/components/notes/SkillNotesSection";
import { SkillDetailSkeleton } from "@/lib/skills-hub/components/core/SkillsHubSkeletons";
import type { SkillStatus } from "@/lib/skills-hub/core/skill-status.types";

export default function SkillDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const skillId = params.skillId as string;
  const teacherId = searchParams.get("teacherId") || "";
  const { hasRole } = useAuthenticatedUser();
  const queryClient = useQueryClient();

  const isCoach =
    hasRole("coach") || hasRole("super_admin") || hasRole("director");

  const { taxonomy, loading: taxLoading } = useTaxonomy();
  const { statuses, loading: statusLoading } =
    useTeacherSkillStatuses(teacherId);
  const { plans } = useActionPlans(teacherId);
  const { observations } = useObservations(teacherId);

  if (taxLoading || statusLoading) {
    return <SkillDetailSkeleton />;
  }

  if (!taxonomy) {
    return (
      <Center py="xl">
        <Text c="dimmed">No taxonomy data</Text>
      </Center>
    );
  }

  const skill = getSkillById(taxonomy, skillId);
  if (!skill) {
    return (
      <Center py="xl">
        <Text c="red">Skill not found: {skillId}</Text>
      </Center>
    );
  }

  const statusDoc = statuses.find((s) => s.skillId === skill.uuid);
  const currentStatus: SkillStatus =
    (statusDoc?.status as SkillStatus) || "not_started";

  const linkedPlans = plans.filter((p) => p.skillIds.includes(skill.uuid));

  const handleStatusChanged = () => {
    queryClient.invalidateQueries({
      queryKey: skillStatusKeys.byTeacher(teacherId),
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: "900px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <SkillDetailHeader
          skill={skill}
          status={currentStatus}
          teacherStaffId={teacherId}
          isCoachView={isCoach}
          onStatusChanged={handleStatusChanged}
        />
      </Card>

      <Stack gap="lg">
        {linkedPlans.length > 0 && (
          <Card shadow="sm" p="lg">
            <Text fw={600} mb="sm">
              Action Plans
            </Text>
            <Stack gap="xs">
              {linkedPlans.map((plan) => (
                <Card key={plan._id} withBorder p="sm">
                  <Text size="sm" fw={500}>
                    {plan.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Status: {plan.status}
                  </Text>
                </Card>
              ))}
            </Stack>
          </Card>
        )}

        <Card shadow="sm" p="lg">
          <Text fw={600} mb="sm">
            Observation History
          </Text>
          <SkillObservationTimeline
            observations={observations}
            skillId={skill.uuid}
          />
        </Card>

        <Card shadow="sm" p="lg">
          <Text fw={600} mb="sm">
            Notes
          </Text>
          <SkillNotesSection
            teacherStaffId={teacherId}
            skillId={skill.uuid}
            isCoachView={isCoach}
          />
        </Card>
      </Stack>
    </div>
  );
}
