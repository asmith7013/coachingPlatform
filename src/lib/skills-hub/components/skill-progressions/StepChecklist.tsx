"use client";

import {
  Stack,
  Group,
  Text,
  Progress,
  Checkbox,
  Badge,
  Tooltip,
} from "@mantine/core";
import { formatDueDate } from "../../core/format-due-date";
import type { ProgressionStepDocument } from "../../coach/skill-progressions/progression-step.types";

interface StepChecklistProps {
  steps: ProgressionStepDocument[];
  completedCount: number;
  totalSteps: number;
  progress: number;
  loadingSteps: boolean;
  onToggleStep: (stepId: string, completed: boolean) => void;
  /** Message when no steps exist. Pass null to render nothing. */
  emptyMessage?: string | null;
}

export function StepChecklist({
  steps,
  completedCount,
  totalSteps,
  progress,
  loadingSteps,
  onToggleStep,
  emptyMessage = "No steps defined yet",
}: StepChecklistProps) {
  if (loadingSteps) {
    return (
      <Text size="sm" c="dimmed">
        Loading steps...
      </Text>
    );
  }

  if (totalSteps === 0) {
    return emptyMessage ? (
      <Text size="sm" c="dimmed">
        {emptyMessage}
      </Text>
    ) : null;
  }

  return (
    <div>
      <Group gap="xs" mb="xs" align="center">
        <Text size="xs" fw={600} c="dimmed" tt="uppercase">
          Steps
        </Text>
        <Progress value={progress} size="sm" color="blue" style={{ flex: 1 }} />
        <Text size="xs" c="dimmed" fw={500}>
          {completedCount}/{totalSteps}
        </Text>
      </Group>
      <Stack gap="xs">
        {steps.map((step) => (
          <Group key={step._id} gap="sm" wrap="nowrap" align="flex-start">
            <Checkbox
              color="blue"
              checked={step.completed}
              onChange={() => onToggleStep(step._id, step.completed)}
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
              <Tooltip label="Due date">
                <Badge
                  size="sm"
                  variant="light"
                  color="blue"
                  style={{ flexShrink: 0 }}
                >
                  {formatDueDate(step.dueDate)}
                </Badge>
              </Tooltip>
            )}
          </Group>
        ))}
      </Stack>
    </div>
  );
}
