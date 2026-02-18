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
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { getActionSteps } from "../_actions/action-step.actions";
import { completeActionStep } from "../_actions/action-step.actions";
import { closeActionPlan } from "../_actions/action-plan.actions";
import { actionPlanKeys } from "../_hooks/useActionPlans";
import type { ActionPlanDocument } from "../_types/action-plan.types";
import type { ActionStepDocument } from "../_types/action-step.types";

interface ActionPlanCardProps {
  plan: ActionPlanDocument;
  teacherStaffId: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "blue",
  closed: "gray",
  archived: "dimmed",
};

export function ActionPlanCard({ plan, teacherStaffId }: ActionPlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [steps, setSteps] = useState<ActionStepDocument[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const queryClient = useQueryClient();

  const handleExpand = async () => {
    if (!expanded && steps.length === 0) {
      setLoadingSteps(true);
      const result = await getActionSteps(plan._id);
      if (result.success && result.data) {
        setSteps(result.data);
      }
      setLoadingSteps(false);
    }
    setExpanded(!expanded);
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const handleToggleStep = async (stepId: string, completed: boolean) => {
    if (!completed) {
      await completeActionStep(stepId);
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
    await closeActionPlan(plan._id);
    queryClient.invalidateQueries({
      queryKey: actionPlanKeys.byTeacher(teacherStaffId),
    });
  };

  return (
    <Card shadow="sm" withBorder>
      <UnstyledButton onClick={handleExpand} w="100%">
        <Group justify="space-between">
          <div>
            <Text fw={600}>{plan.title}</Text>
            <Group gap="xs" mt={4}>
              <Badge color={STATUS_COLORS[plan.status]} size="sm">
                {plan.status}
              </Badge>
              {plan.skillIds.map((id) => (
                <Badge key={id} variant="outline" size="xs">
                  {id}
                </Badge>
              ))}
            </Group>
          </div>
          {expanded ? (
            <IconChevronUp size={16} />
          ) : (
            <IconChevronDown size={16} />
          )}
        </Group>

        {totalSteps > 0 && (
          <Progress value={progress} mt="sm" size="sm" color="teal" />
        )}
      </UnstyledButton>

      <Collapse in={expanded}>
        <Stack gap="xs" mt="md">
          {loadingSteps ? (
            <Text size="sm" c="dimmed">
              Loading steps...
            </Text>
          ) : steps.length === 0 ? (
            <Text size="sm" c="dimmed">
              No steps yet
            </Text>
          ) : (
            steps.map((step) => (
              <Group key={step._id} gap="sm" wrap="nowrap" align="flex-start">
                <Checkbox
                  checked={step.completed}
                  onChange={() => handleToggleStep(step._id, step.completed)}
                  disabled={step.completed}
                  mt={2}
                />
                <div style={{ flex: 1 }}>
                  <Text
                    size="sm"
                    td={step.completed ? "line-through" : undefined}
                    c={step.completed ? "dimmed" : undefined}
                  >
                    {step.description}
                  </Text>
                  <Group gap="xs" mt={2}>
                    {step.dueDate && (
                      <Badge size="xs" variant="light">
                        Due: {new Date(step.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                    {step.skillIds.map((id) => (
                      <Badge key={id} size="xs" variant="dot">
                        {id}
                      </Badge>
                    ))}
                  </Group>
                </div>
              </Group>
            ))
          )}

          {plan.status === "open" && (
            <Group justify="flex-end" mt="sm">
              <Button
                size="xs"
                variant="light"
                color="gray"
                onClick={handleClosePlan}
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
