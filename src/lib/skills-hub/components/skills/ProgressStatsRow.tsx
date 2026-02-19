"use client";

import { useEffect, useState } from "react";
import {
  SimpleGrid,
  Card,
  Text,
  Stack,
  Group,
  Badge,
  Box,
  Checkbox,
  Divider,
  Progress,
  RingProgress,
} from "@mantine/core";
import { SkillSoloCard } from "./SkillSoloCard";
import { useSkillProgressions } from "../../hooks/useSkillProgressions";
import {
  getProgressionSteps,
  completeProgressionStep,
  uncompleteProgressionStep,
} from "../../coach/skill-progressions/progression-step.actions";
import type {
  TeacherSkillsIndex,
  TeacherSkill,
} from "../../core/taxonomy.types";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";
import type { ProgressionStepDocument } from "../../coach/skill-progressions/progression-step.types";
import { formatDueDate } from "../../core/format-due-date";

interface ProgressStatsRowProps {
  taxonomy: TeacherSkillsIndex;
  statusMap: Map<string, TeacherSkillStatusDocument>;
  teacherStaffId: string;
  onSkillClick?: (skillId: string) => void;
}

interface ActiveSkillInfo {
  skill: TeacherSkill;
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
        size={80}
        thickness={8}
        roundCaps
        sections={sections}
        label={
          <Text ta="center" size="xs" fw={700}>
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

function collectActiveSkills(
  taxonomy: TeacherSkillsIndex,
  statusMap: Map<string, TeacherSkillStatusDocument>,
): ActiveSkillInfo[] {
  const active: ActiveSkillInfo[] = [];
  for (const domain of taxonomy.domains) {
    for (const subDomain of domain.subDomains) {
      for (const skill of subDomain.skills) {
        if (statusMap.get(skill.uuid)?.status === "active") {
          active.push({ skill });
        }
      }
    }
  }
  return active;
}

export function ProgressionOverviewContent({
  taxonomy,
  statusMap,
  teacherStaffId,
  onSkillClick,
}: ProgressStatsRowProps) {
  const { plans } = useSkillProgressions(teacherStaffId);
  const openPlan = plans.find((p) => p.status === "open") ?? null;

  const [steps, setSteps] = useState<ProgressionStepDocument[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);

  useEffect(() => {
    if (!openPlan) {
      setSteps([]);
      return;
    }
    setLoadingSteps(true);
    getProgressionSteps(openPlan._id).then((result) => {
      if (result.success && result.data) {
        setSteps(result.data);
      }
      setLoadingSteps(false);
    });
  }, [openPlan]);

  const activeSkills = collectActiveSkills(taxonomy, statusMap);

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const handleToggleStep = async (stepId: string, completed: boolean) => {
    if (completed) {
      await uncompleteProgressionStep(stepId);
      setSteps((prev) =>
        prev.map((s) =>
          s._id === stepId ? { ...s, completed: false, completedAt: null } : s,
        ),
      );
    } else {
      await completeProgressionStep(stepId);
      setSteps((prev) =>
        prev.map((s) =>
          s._id === stepId
            ? { ...s, completed: true, completedAt: new Date().toISOString() }
            : s,
        ),
      );
    }
  };

  if (!openPlan) {
    return null;
  }

  return (
    <Stack gap="md">
      <Text fw={700} size="lg">
        Current Skill Progression
      </Text>

      {openPlan.why && (
        <div>
          <Text size="xs" fw={500} c="dimmed">
            Why
          </Text>
          <Text size="sm">{openPlan.why}</Text>
        </div>
      )}

      <Divider />

      {loadingSteps ? (
        <Text size="sm" c="dimmed">
          Loading steps...
        </Text>
      ) : totalSteps > 0 ? (
        <div>
          <Group gap="xs" mb="xs" align="center">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase">
              Steps
            </Text>
            <Progress
              value={progress}
              size="sm"
              color="teal"
              style={{ flex: 1 }}
            />
            <Text size="xs" c="dimmed" fw={500}>
              {completedCount}/{totalSteps}
            </Text>
          </Group>
          <Stack gap="xs">
            {steps.map((step) => (
              <Group key={step._id} gap="sm" wrap="nowrap" align="flex-start">
                <Checkbox
                  checked={step.completed}
                  onChange={() => handleToggleStep(step._id, step.completed)}
                  mt={2}
                  styles={{ input: { cursor: "pointer" } }}
                />
                <Text
                  size="sm"
                  td={step.completed ? "line-through" : undefined}
                  c={step.completed ? "dimmed" : undefined}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {step.description}
                </Text>
                {step.dueDate && (
                  <Badge size="sm" variant="light" style={{ flexShrink: 0 }}>
                    {formatDueDate(step.dueDate)}
                  </Badge>
                )}
              </Group>
            ))}
          </Stack>
        </div>
      ) : null}

      {activeSkills.length > 0 && (
        <>
          <Divider />
          <Text size="xs" fw={600} c="dimmed" tt="uppercase">
            Active Skills
          </Text>
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
        </>
      )}
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
