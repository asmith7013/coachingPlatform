"use client";

import { useState } from "react";
import { Stack, SegmentedControl, Text } from "@mantine/core";
import { SkillProgressionCard } from "./SkillProgressionCard";
import { ActionPlanListSkeleton } from "../core/SkillsHubSkeletons";
import type { SkillProgressionDocument } from "../../coach/skill-progressions/skill-progression.types";

interface SkillProgressionListProps {
  plans: SkillProgressionDocument[];
  loading: boolean;
  teacherStaffId: string;
}

export function SkillProgressionList({
  plans,
  loading,
  teacherStaffId,
}: SkillProgressionListProps) {
  const [filter, setFilter] = useState("open");

  if (loading) {
    return <ActionPlanListSkeleton />;
  }

  const filtered =
    filter === "all" ? plans : plans.filter((p) => p.status === filter);

  return (
    <Stack gap="md">
      <SegmentedControl
        data={[
          { label: "Open", value: "open" },
          { label: "Closed", value: "closed" },
          { label: "All", value: "all" },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {filtered.length === 0 ? (
        <Text c="dimmed" ta="center" py="lg">
          No {filter === "all" ? "" : filter} skill progressions yet
        </Text>
      ) : (
        filtered.map((plan) => (
          <SkillProgressionCard
            key={plan._id}
            plan={plan}
            teacherStaffId={teacherStaffId}
          />
        ))
      )}
    </Stack>
  );
}
