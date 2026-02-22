"use client";

import { useState } from "react";
import {
  Card,
  Text,
  Badge,
  Group,
  Progress,
  Collapse,
  Stack,
  Checkbox,
  Button,
  UnstyledButton,
  Divider,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { getProgressionSteps } from "../../coach/skill-progressions/progression-step.actions";
import {
  completeProgressionStep,
  uncompleteProgressionStep,
} from "../../coach/skill-progressions/progression-step.actions";
import { closeSkillProgression } from "../../coach/skill-progressions/skill-progression.actions";
import { skillProgressionKeys } from "../../hooks/useSkillProgressions";
import { formatDueDate } from "../../core/format-due-date";
import type { SkillProgressionDocument } from "../../coach/skill-progressions/skill-progression.types";
import type { ProgressionStepDocument } from "../../coach/skill-progressions/progression-step.types";

const PLAN_STATUS_COLORS: Record<string, string> = {
  open: "blue",
  closed: "gray",
  archived: "dimmed",
};

interface ProgressionPlanCardProps {
  plan: SkillProgressionDocument;
  teacherStaffId: string;
  /** Compact sizing for panel/drawer contexts */
  compact?: boolean;
  /** Allow unchecking completed steps (bidirectional toggle) */
  canUncomplete?: boolean;
  /** Show skill name badges on the card */
  showSkillBadges?: boolean;
  /** Resolve skill UUID to display name */
  resolveSkillName?: (id: string) => string;
}

export function ProgressionPlanCard({
  plan,
  teacherStaffId,
  compact = false,
  canUncomplete = false,
  showSkillBadges = false,
  resolveSkillName,
}: ProgressionPlanCardProps) {
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
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to load steps",
          color: "red",
        });
      }
      setLoadingSteps(false);
    }
    setExpanded(!expanded);
  };

  const handleToggleStep = async (stepId: string, completed: boolean) => {
    if (completed && !canUncomplete) return;

    const previousSteps = steps;
    // Optimistic update
    setSteps((prev) =>
      prev.map((s) =>
        s._id === stepId
          ? completed
            ? { ...s, completed: false, completedAt: null }
            : { ...s, completed: true, completedAt: new Date().toISOString() }
          : s,
      ),
    );
    try {
      const result = completed
        ? await uncompleteProgressionStep(stepId)
        : await completeProgressionStep(stepId);
      if (!result.success) {
        setSteps(previousSteps);
        notifications.show({
          title: "Error",
          message: "Failed to update step",
          color: "red",
        });
      }
    } catch {
      setSteps(previousSteps);
      notifications.show({
        title: "Error",
        message: "Failed to update step",
        color: "red",
      });
    }
  };

  const handleClosePlan = async () => {
    setClosing(true);
    const result = await closeSkillProgression(plan._id);
    if (result.success) {
      queryClient.invalidateQueries({
        queryKey: skillProgressionKeys.byTeacher(teacherStaffId),
      });
    } else {
      notifications.show({
        title: "Error",
        message: result.error || "Failed to close plan",
        color: "red",
      });
    }
    setClosing(false);
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const textSize = compact ? "xs" : "sm";
  const titleWeight = compact ? 500 : 600;
  const badgeSize = compact ? "xs" : "sm";
  const chevronSize = compact ? 14 : 16;
  const spacing = compact ? "xs" : "sm";

  return (
    <Card
      shadow={compact ? undefined : "sm"}
      withBorder
      p={compact ? "sm" : undefined}
      radius={compact ? "sm" : undefined}
    >
      <UnstyledButton onClick={handleExpand} w="100%">
        <Group justify="space-between" wrap="nowrap">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" align="center">
              <Text size={textSize} fw={titleWeight} lineClamp={1}>
                {plan.title}
              </Text>
              <Badge
                color={PLAN_STATUS_COLORS[plan.status]}
                size={badgeSize}
                variant="light"
              >
                {plan.status}
              </Badge>
            </Group>
            {showSkillBadges &&
              plan.skillIds.length > 0 &&
              resolveSkillName && (
                <Group gap={4} mt={6} wrap="wrap">
                  <Text size="xs" c="dimmed" fw={500}>
                    Skills:
                  </Text>
                  {plan.skillIds.map((id) => (
                    <Badge key={id} variant="light" color="blue" size="xs">
                      {resolveSkillName(id)}
                    </Badge>
                  ))}
                </Group>
              )}
          </div>
          {expanded ? (
            <IconChevronUp size={chevronSize} />
          ) : (
            <IconChevronDown size={chevronSize} />
          )}
        </Group>

        {totalSteps > 0 && (
          <Group gap="xs" mt={compact ? 4 : "sm"} align="center">
            <Progress
              value={progress}
              size={compact ? "xs" : "sm"}
              color="teal"
              style={{ flex: 1 }}
            />
            <Text size="xs" c="dimmed" fw={compact ? undefined : 500}>
              {completedCount}/{totalSteps}
            </Text>
          </Group>
        )}
      </UnstyledButton>

      <Collapse in={expanded}>
        <Stack gap="xs" mt={spacing}>
          {plan.why && (
            <div>
              <Text size="xs" fw={500} c="dimmed">
                Why
              </Text>
              <Text size={textSize}>{plan.why}</Text>
            </div>
          )}

          {plan.why && steps.length > 0 && <Divider />}

          {loadingSteps ? (
            <Text size={textSize} c="dimmed">
              Loading steps...
            </Text>
          ) : steps.length === 0 && !compact ? (
            <Text size={textSize} c="dimmed">
              No steps yet
            </Text>
          ) : steps.length > 0 ? (
            <>
              <Text
                size="xs"
                fw={compact ? 500 : 600}
                c="dimmed"
                tt="uppercase"
              >
                Steps
              </Text>
              {steps.map((step) => (
                <Group
                  key={step._id}
                  gap={compact ? "xs" : "sm"}
                  wrap="nowrap"
                  align="flex-start"
                >
                  <Checkbox
                    checked={step.completed}
                    onChange={() => handleToggleStep(step._id, step.completed)}
                    disabled={!canUncomplete && step.completed}
                    size={compact ? "xs" : undefined}
                    mt={2}
                    styles={
                      canUncomplete
                        ? { input: { cursor: "pointer" } }
                        : undefined
                    }
                  />
                  <div style={{ flex: 1 }}>
                    <Text
                      size={textSize}
                      td={step.completed ? "line-through" : undefined}
                      c={step.completed ? "dimmed" : undefined}
                    >
                      {step.description}
                    </Text>
                    <Group gap={4} mt={2} wrap="wrap">
                      {step.dueDate && (
                        <Badge size={compact ? "sm" : "xs"} variant="light">
                          {compact
                            ? formatDueDate(step.dueDate)
                            : `Due: ${new Date(step.dueDate).toLocaleDateString()}`}
                        </Badge>
                      )}
                      {showSkillBadges &&
                        resolveSkillName &&
                        step.skillIds.length > 0 &&
                        step.skillIds.map((id) => (
                          <Badge key={id} size="xs" variant="dot" color="blue">
                            {resolveSkillName(id)}
                          </Badge>
                        ))}
                    </Group>
                  </div>
                </Group>
              ))}
            </>
          ) : null}

          {plan.status === "open" && (
            <Group justify="flex-end" mt={compact ? 4 : "sm"}>
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
