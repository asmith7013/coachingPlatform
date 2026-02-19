"use client";

import { useState } from "react";
import {
  Stack,
  Card,
  Text,
  Badge,
  Group,
  Button,
  Collapse,
  Checkbox,
  UnstyledButton,
  Progress,
  Divider,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getProgressionSteps,
  completeProgressionStep,
  uncompleteProgressionStep,
} from "../../coach/skill-progressions/progression-step.actions";
import { closeSkillProgression } from "../../coach/skill-progressions/skill-progression.actions";
import { skillProgressionKeys } from "../../hooks/useSkillProgressions";
import type { SkillProgressionDocument } from "../../coach/skill-progressions/skill-progression.types";
import type { ProgressionStepDocument } from "../../coach/skill-progressions/progression-step.types";
import { formatDueDate } from "../../core/format-due-date";

interface PanelSkillProgressionSectionProps {
  plans: SkillProgressionDocument[];
  teacherStaffId: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "blue",
  closed: "gray",
  archived: "dimmed",
};

function PlanCard({
  plan,
  teacherStaffId,
}: {
  plan: SkillProgressionDocument;
  teacherStaffId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [steps, setSteps] = useState<ProgressionStepDocument[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [closing, setClosing] = useState(false);
  const queryClient = useQueryClient();

  const handleExpand = async () => {
    if (!expanded && steps.length === 0) {
      setLoadingSteps(true);
      const result = await getProgressionSteps(plan._id);
      if (result.success && result.data) {
        setSteps(result.data);
      }
      setLoadingSteps(false);
    }
    setExpanded(!expanded);
  };

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

  const handleClosePlan = async () => {
    setClosing(true);
    await closeSkillProgression(plan._id);
    queryClient.invalidateQueries({
      queryKey: skillProgressionKeys.byTeacher(teacherStaffId),
    });
    setClosing(false);
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  return (
    <Card withBorder p="sm" radius="sm">
      <UnstyledButton onClick={handleExpand} w="100%">
        <Group justify="space-between" wrap="nowrap">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" align="center">
              <Text size="sm" fw={500} lineClamp={1}>
                {plan.title}
              </Text>
              <Badge
                color={STATUS_COLORS[plan.status]}
                size="xs"
                variant="light"
              >
                {plan.status}
              </Badge>
            </Group>
          </div>
          {expanded ? (
            <IconChevronUp size={14} />
          ) : (
            <IconChevronDown size={14} />
          )}
        </Group>
        {totalSteps > 0 && (
          <Group gap="xs" mt={4} align="center">
            <Progress
              value={progress}
              size="xs"
              color="teal"
              style={{ flex: 1 }}
            />
            <Text size="xs" c="dimmed">
              {completedCount}/{totalSteps}
            </Text>
          </Group>
        )}
      </UnstyledButton>

      <Collapse in={expanded}>
        <Stack gap="xs" mt="sm">
          {plan.why && (
            <div>
              <Text size="xs" fw={500} c="dimmed">
                Why
              </Text>
              <Text size="sm">{plan.why}</Text>
            </div>
          )}

          {plan.why && steps.length > 0 && <Divider />}

          {loadingSteps ? (
            <Text size="xs" c="dimmed">
              Loading steps...
            </Text>
          ) : steps.length > 0 ? (
            <>
              <Text size="xs" fw={500} c="dimmed" tt="uppercase">
                Steps
              </Text>
              {steps.map((step) => (
                <Group key={step._id} gap="xs" wrap="nowrap" align="flex-start">
                  <Checkbox
                    checked={step.completed}
                    onChange={() => handleToggleStep(step._id, step.completed)}
                    size="xs"
                    mt={2}
                    styles={{ input: { cursor: "pointer" } }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text
                      size="xs"
                      td={step.completed ? "line-through" : undefined}
                      c={step.completed ? "dimmed" : undefined}
                    >
                      {step.description}
                    </Text>
                    {step.dueDate && (
                      <Badge size="xs" variant="light">
                        {formatDueDate(step.dueDate)}
                      </Badge>
                    )}
                  </div>
                </Group>
              ))}
            </>
          ) : null}

          {plan.status === "open" && (
            <Group justify="flex-end" mt={4}>
              <Button
                size="xs"
                variant="light"
                color="gray"
                onClick={handleClosePlan}
                loading={closing}
              >
                Close Plan
              </Button>
            </Group>
          )}
        </Stack>
      </Collapse>
    </Card>
  );
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
            <PlanCard
              key={plan._id}
              plan={plan}
              teacherStaffId={teacherStaffId}
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
