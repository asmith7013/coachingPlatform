"use client";

import {
  SimpleGrid,
  Card,
  Text,
  Stack,
  Group,
  Box,
  Divider,
  RingProgress,
} from "@mantine/core";
import { useSkillProgressions } from "../../hooks/useSkillProgressions";
import { useProgressionSteps } from "../../hooks/useProgressionSteps";
import { StepChecklist } from "../skill-progressions/StepChecklist";
import { SkillSoloCard } from "./SkillSoloCard";
import { collectActiveSkills } from "../../core/active-skills";
import type { TeacherSkillsIndex } from "../../core/taxonomy.types";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";

interface ProgressStatsRowProps {
  taxonomy: TeacherSkillsIndex;
  statusMap: Map<string, TeacherSkillStatusDocument>;
  teacherStaffId: string;
  onSkillClick?: (skillId: string) => void;
}

const STATUS_RING_COLORS = {
  proficient: "green.6",
  developing: "yellow.5",
  active: "blue.5",
  not_started: "gray.4",
};

const STATUS_LEGEND = [
  {
    key: "proficient",
    label: "Proficient",
    color: "var(--mantine-color-green-6)",
  },
  {
    key: "developing",
    label: "Developing",
    color: "var(--mantine-color-yellow-5)",
  },
  { key: "active", label: "Active", color: "var(--mantine-color-blue-5)" },
  {
    key: "not_started",
    label: "Not Started",
    color: "var(--mantine-color-gray-4)",
  },
] as const;

function computeStats(
  taxonomy: TeacherSkillsIndex,
  statusMap: Map<string, TeacherSkillStatusDocument>,
) {
  let totalSkills = 0;
  let proficientCount = 0;
  let activeCount = 0;
  let developingCount = 0;
  taxonomy.domains.forEach((domain) => {
    for (const subDomain of domain.subDomains) {
      for (const skill of subDomain.skills) {
        totalSkills++;
        const status = statusMap.get(skill.uuid)?.status ?? "not_started";
        if (status === "proficient") proficientCount++;
        else if (status === "active") activeCount++;
        else if (status === "developing") developingCount++;
      }
    }
  });

  const notStartedCount =
    totalSkills - proficientCount - activeCount - developingCount;

  return {
    totalSkills,
    proficientCount,
    activeCount,
    developingCount,
    notStartedCount,
  };
}

export function SkillProgressRing({
  taxonomy,
  statusMap,
}: {
  taxonomy: TeacherSkillsIndex;
  statusMap: Map<string, TeacherSkillStatusDocument>;
}) {
  const stats = computeStats(taxonomy, statusMap);
  const total = stats.totalSkills || 1;

  const sections = [
    {
      value: (stats.proficientCount / total) * 100,
      color: STATUS_RING_COLORS.proficient,
    },
    {
      value: (stats.developingCount / total) * 100,
      color: STATUS_RING_COLORS.developing,
    },
    {
      value: (stats.activeCount / total) * 100,
      color: STATUS_RING_COLORS.active,
    },
    {
      value: (stats.notStartedCount / total) * 100,
      color: STATUS_RING_COLORS.not_started,
    },
  ].filter((s) => s.value > 0);

  const legendItems = STATUS_LEGEND.map(({ key, label, color }) => {
    const count =
      key === "proficient"
        ? stats.proficientCount
        : key === "developing"
          ? stats.developingCount
          : key === "active"
            ? stats.activeCount
            : stats.notStartedCount;
    return { key, label, color, count };
  });

  return (
    <Group gap="md" wrap="nowrap">
      <RingProgress
        size={100}
        thickness={10}
        roundCaps
        sections={sections}
        label={
          <Text ta="center" size="sm" fw={700}>
            {stats.proficientCount}/{stats.totalSkills}
          </Text>
        }
      />
      <SimpleGrid cols={2} spacing={4} verticalSpacing={4}>
        {legendItems.map(({ key, label, color, count }) => (
          <Group key={key} gap={6} wrap="nowrap">
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            <Text size="xs" c="dimmed">
              {label} ({count})
            </Text>
          </Group>
        ))}
      </SimpleGrid>
    </Group>
  );
}

export function ProgressionOverviewContent({
  taxonomy,
  statusMap,
  teacherStaffId,
  onSkillClick,
}: ProgressStatsRowProps) {
  const { plans } = useSkillProgressions(teacherStaffId);
  const openPlan = plans.find((p) => p.status === "open") ?? null;

  const {
    steps,
    loadingSteps,
    handleToggleStep,
    completedCount,
    totalSteps,
    progress,
  } = useProgressionSteps(openPlan?._id ?? null);

  const activeSkills = collectActiveSkills(taxonomy, statusMap);
  const activeCount = activeSkills.length;

  if (!openPlan) {
    return null;
  }

  return (
    <Stack gap="md">
      <SkillProgressRing taxonomy={taxonomy} statusMap={statusMap} />

      <Divider size="md" />

      <Group gap="sm" align="center">
        {activeCount > 0 && (
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "var(--mantine-color-blue-5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text size="xs" fw={700} c="white">
              {activeCount}
            </Text>
          </Box>
        )}
        <Text fw={700} size="lg">
          Active Skills
        </Text>
      </Group>

      {activeSkills.length > 0 && (
        <Stack gap="xs">
          {activeSkills.map(({ skill }) => (
            <SkillSoloCard
              key={skill.uuid}
              skillId={skill.uuid}
              skillName={skill.name}
              description={skill.description}
              level={skill.level}
              status="active"
              isLocked={false}
              compact
              onSkillClick={onSkillClick}
            />
          ))}
        </Stack>
      )}

      {openPlan.why && (
        <div>
          <Text size="xs" fw={600} c="dimmed" tt="uppercase">
            Why
          </Text>
          <Text size="sm">{openPlan.why}</Text>
        </div>
      )}

      <Divider />

      <StepChecklist
        steps={steps}
        completedCount={completedCount}
        totalSteps={totalSteps}
        progress={progress}
        loadingSteps={loadingSteps}
        onToggleStep={handleToggleStep}
        emptyMessage={null}
      />
    </Stack>
  );
}

export function ProgressStatsRow(props: ProgressStatsRowProps) {
  return (
    <Card shadow="sm" withBorder p="lg">
      <ProgressionOverviewContent {...props} />
    </Card>
  );
}
