"use client";

import { Stack, Text } from "@mantine/core";
import { ProgressionPlanCard } from "./ProgressionPlanCard";
import type { SkillProgressionDocument } from "../../coach/skill-progressions/skill-progression.types";

interface PanelSkillProgressionSectionProps {
  plans: SkillProgressionDocument[];
  teacherStaffId: string;
}

export function PanelSkillProgressionSection({
  plans,
  teacherStaffId,
}: PanelSkillProgressionSectionProps) {
  return (
    <div>
      <Text fw={600} size="sm" mb="xs">
        Skill Progressions
      </Text>

      <Stack gap="xs">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <ProgressionPlanCard
              key={plan._id}
              plan={plan}
              teacherStaffId={teacherStaffId}
              compact
              canUncomplete
            />
          ))
        ) : (
          <Text size="xs" c="dimmed">
            No skill progressions for this skill
          </Text>
        )}
      </Stack>
    </div>
  );
}
