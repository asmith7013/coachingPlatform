"use client";

import { useState } from "react";
import { Stack, SegmentedControl, Text } from "@mantine/core";
import { ActionPlanCard } from "./ActionPlanCard";
import { ActionPlanListSkeleton } from "./skeletons/SkillsHubSkeletons";
import type { ActionPlanDocument } from "../_types/action-plan.types";

interface ActionPlanListProps {
  plans: ActionPlanDocument[];
  loading: boolean;
  teacherStaffId: string;
}

export function ActionPlanList({
  plans,
  loading,
  teacherStaffId,
}: ActionPlanListProps) {
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
          No {filter === "all" ? "" : filter} action plans yet
        </Text>
      ) : (
        filtered.map((plan) => (
          <ActionPlanCard
            key={plan._id}
            plan={plan}
            teacherStaffId={teacherStaffId}
          />
        ))
      )}
    </Stack>
  );
}
