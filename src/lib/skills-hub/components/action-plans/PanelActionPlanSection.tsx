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
  TextInput,
  Textarea,
  UnstyledButton,
  Progress,
  Divider,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { getActionSteps } from "../../coach/action-plans/action-step.actions";
import { completeActionStep } from "../../coach/action-plans/action-step.actions";
import { closeActionPlan } from "../../coach/action-plans/action-plan.actions";
import { createActionPlanWithSteps } from "../../coach/action-plans/action-plan.actions";
import { actionPlanKeys } from "../../hooks/useActionPlans";
import type { ActionPlanDocument } from "../../coach/action-plans/action-plan.types";
import type { ActionStepDocument } from "../../coach/action-plans/action-step.types";

interface PanelActionPlanSectionProps {
  plans: ActionPlanDocument[];
  skillUuid: string;
  skillDomainName: string;
  teacherStaffId: string;
  isCoach: boolean;
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
  plan: ActionPlanDocument;
  teacherStaffId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [steps, setSteps] = useState<ActionStepDocument[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [closing, setClosing] = useState(false);
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
    setClosing(true);
    await closeActionPlan(plan._id);
    queryClient.invalidateQueries({
      queryKey: actionPlanKeys.byTeacher(teacherStaffId),
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

          {plan.actionStep && (
            <div>
              <Text size="xs" fw={500} c="dimmed">
                Action Step
              </Text>
              <Text size="sm">{plan.actionStep}</Text>
            </div>
          )}

          {(plan.why || plan.actionStep) && steps.length > 0 && <Divider />}

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
                    disabled={step.completed}
                    size="xs"
                    mt={2}
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
                      <Text size="xs" c="dimmed">
                        Due: {new Date(step.dueDate).toLocaleDateString()}
                      </Text>
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

function CreatePlanForm({
  skillUuid,
  skillDomainName,
  teacherStaffId,
  onCancel,
  onCreated,
}: {
  skillUuid: string;
  skillDomainName: string;
  teacherStaffId: string;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState(skillDomainName);
  const [why, setWhy] = useState("");
  const [actionStep, setActionStep] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const result = await createActionPlanWithSteps({
      plan: {
        teacherStaffId,
        title: title.trim(),
        skillIds: [skillUuid],
        why: why.trim() || undefined,
        actionStep: actionStep.trim() || undefined,
      },
      steps: [],
    });
    setSubmitting(false);
    if (result.success) {
      onCreated();
    }
  };

  return (
    <Card withBorder p="sm" radius="sm">
      <Stack gap="xs">
        <Text size="xs" fw={600}>
          New Action Plan
        </Text>
        <TextInput
          size="xs"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="Plan title"
        />
        <Textarea
          size="xs"
          label="Why"
          value={why}
          onChange={(e) => setWhy(e.currentTarget.value)}
          placeholder="Why should this teacher develop this skill?"
          autosize
          minRows={2}
        />
        <Textarea
          size="xs"
          label="Action Step"
          value={actionStep}
          onChange={(e) => setActionStep(e.currentTarget.value)}
          placeholder="How should the teacher implement this?"
          autosize
          minRows={2}
        />
        <Group justify="flex-end" gap="xs">
          <Button
            size="xs"
            variant="default"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            size="xs"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!title.trim()}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

export function PanelActionPlanSection({
  plans,
  skillUuid,
  skillDomainName,
  teacherStaffId,
  isCoach,
}: PanelActionPlanSectionProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const handleCreated = () => {
    setShowCreateForm(false);
    queryClient.invalidateQueries({
      queryKey: actionPlanKeys.byTeacher(teacherStaffId),
    });
  };

  return (
    <div>
      <Group justify="space-between" mb="xs">
        <Text fw={600} size="sm">
          Action Plans
        </Text>
        {isCoach && !showCreateForm && (
          <UnstyledButton onClick={() => setShowCreateForm(true)}>
            <Group gap={4}>
              <IconPlus size={14} />
              <Text size="xs" c="blue">
                New
              </Text>
            </Group>
          </UnstyledButton>
        )}
      </Group>

      <Stack gap="xs">
        {showCreateForm && (
          <CreatePlanForm
            skillUuid={skillUuid}
            skillDomainName={skillDomainName}
            teacherStaffId={teacherStaffId}
            onCancel={() => setShowCreateForm(false)}
            onCreated={handleCreated}
          />
        )}

        {plans.length > 0 ? (
          plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              teacherStaffId={teacherStaffId}
            />
          ))
        ) : !showCreateForm ? (
          <Text size="xs" c="dimmed">
            No action plans for this skill
          </Text>
        ) : null}
      </Stack>
    </div>
  );
}
