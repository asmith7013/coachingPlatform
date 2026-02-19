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
import { useQueryClient } from "@tanstack/react-query";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import { getSkillByUuid } from "../../core/taxonomy";
import { getProgressionSteps } from "../../coach/skill-progressions/progression-step.actions";
import { completeProgressionStep } from "../../coach/skill-progressions/progression-step.actions";
import { closeSkillProgression } from "../../coach/skill-progressions/skill-progression.actions";
import { skillProgressionKeys } from "../../hooks/useSkillProgressions";
import type { TeacherSkillsIndex } from "../../core/taxonomy.types";
import type { SkillProgressionDocument } from "../../coach/skill-progressions/skill-progression.types";
import type { ProgressionStepDocument } from "../../coach/skill-progressions/progression-step.types";

interface SkillProgressionCardProps {
  plan: SkillProgressionDocument;
  teacherStaffId: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "blue",
  closed: "gray",
  archived: "dimmed",
};

function resolveSkillName(
  taxonomy: TeacherSkillsIndex | null,
  id: string,
): string {
  if (!taxonomy) return id;
  const skill = getSkillByUuid(taxonomy, id);
  return skill?.name ?? id;
}

export function SkillProgressionCard({
  plan,
  teacherStaffId,
}: SkillProgressionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [steps, setSteps] = useState<ProgressionStepDocument[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const queryClient = useQueryClient();
  const { taxonomy } = useTaxonomy();

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

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const handleToggleStep = async (stepId: string, completed: boolean) => {
    if (!completed) {
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
    await closeSkillProgression(plan._id);
    queryClient.invalidateQueries({
      queryKey: skillProgressionKeys.byTeacher(teacherStaffId),
    });
  };

  return (
    <Card shadow="sm" withBorder>
      <UnstyledButton onClick={handleExpand} w="100%">
        <Group justify="space-between" wrap="nowrap">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" align="center">
              <Text fw={600}>{plan.title}</Text>
              <Badge
                color={STATUS_COLORS[plan.status]}
                size="sm"
                variant="light"
              >
                {plan.status}
              </Badge>
            </Group>
            {plan.skillIds.length > 0 && (
              <Group gap={4} mt={6} wrap="wrap">
                <Text size="xs" c="dimmed" fw={500}>
                  Skills:
                </Text>
                {plan.skillIds.map((id) => (
                  <Badge key={id} variant="light" color="blue" size="xs">
                    {resolveSkillName(taxonomy, id)}
                  </Badge>
                ))}
              </Group>
            )}
          </div>
          {expanded ? (
            <IconChevronUp size={16} />
          ) : (
            <IconChevronDown size={16} />
          )}
        </Group>

        {totalSteps > 0 && (
          <Group gap="xs" mt="sm" align="center">
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
        )}
      </UnstyledButton>

      <Collapse in={expanded}>
        <Stack gap="xs" mt="md">
          {plan.why && (
            <div>
              <Text size="xs" fw={500} c="dimmed">
                Why
              </Text>
              <Text size="sm">{plan.why}</Text>
            </div>
          )}

          {plan.why && <Divider />}

          {loadingSteps ? (
            <Text size="sm" c="dimmed">
              Loading steps...
            </Text>
          ) : steps.length === 0 ? (
            <Text size="sm" c="dimmed">
              No steps yet
            </Text>
          ) : (
            <>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                Steps
              </Text>
              {steps.map((step) => (
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
                    <Group gap={4} mt={2} wrap="wrap">
                      {step.dueDate && (
                        <Badge size="xs" variant="light">
                          Due: {new Date(step.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                      {step.skillIds.length > 0 &&
                        step.skillIds.map((id) => (
                          <Badge key={id} size="xs" variant="dot" color="blue">
                            {resolveSkillName(taxonomy, id)}
                          </Badge>
                        ))}
                    </Group>
                  </div>
                </Group>
              ))}
            </>
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
