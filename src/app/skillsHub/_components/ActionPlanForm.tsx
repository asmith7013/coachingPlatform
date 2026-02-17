"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  MultiSelect,
  Button,
  Stack,
  Group,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { ActionStepFields, type ActionStepFormData } from "./ActionStepFields";
import { useTaxonomy } from "../_hooks/useTaxonomy";
import { createActionPlanWithSteps } from "../_actions/action-plan.actions";

interface ActionPlanFormProps {
  teacherStaffId: string;
}

const emptyStep: ActionStepFormData = {
  description: "",
  dueDate: null,
  evidenceOfCompletion: "",
  skillIds: [],
};

export function ActionPlanForm({ teacherStaffId }: ActionPlanFormProps) {
  const router = useRouter();
  const { taxonomy } = useTaxonomy();
  const [title, setTitle] = useState("");
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [steps, setSteps] = useState<ActionStepFormData[]>([{ ...emptyStep }]);
  const [submitting, setSubmitting] = useState(false);

  const skillOptions =
    taxonomy?.domains.flatMap((d) =>
      d.subDomains.flatMap((sd) =>
        sd.skills.map((s) => ({
          value: s.id,
          label: s.name,
          group: d.name,
        })),
      ),
    ) ?? [];

  const handleStepChange = (
    index: number,
    field: keyof ActionStepFormData,
    value: unknown,
  ) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const addStep = () => {
    setSteps((prev) => [...prev, { ...emptyStep, skillIds: [...skillIds] }]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Plan title is required",
        color: "red",
      });
      return;
    }

    const validSteps = steps.filter((s) => s.description.trim());
    if (validSteps.length === 0) {
      notifications.show({
        title: "Validation Error",
        message: "At least one step with a description is required",
        color: "red",
      });
      return;
    }

    setSubmitting(true);

    const result = await createActionPlanWithSteps({
      plan: {
        teacherStaffId,
        title: title.trim(),
        skillIds,
      },
      steps: validSteps.map((s) => ({
        description: s.description.trim(),
        dueDate: s.dueDate ?? null,
        evidenceOfCompletion: s.evidenceOfCompletion.trim() || null,
        skillIds: s.skillIds.length > 0 ? s.skillIds : skillIds,
      })),
    });

    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Action plan created",
        color: "teal",
      });
      router.push(`/skillsHub/teacher/${teacherStaffId}/action-plans`);
    } else {
      notifications.show({
        title: "Error",
        message: result.error || "Failed to create plan",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="lg">
      <TextInput
        label="Plan Title"
        placeholder="e.g., Improve questioning techniques"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        required
        size="md"
      />

      <MultiSelect
        label="Focus Skills"
        placeholder="Select skills this plan addresses"
        data={skillOptions}
        value={skillIds}
        onChange={setSkillIds}
        searchable
        maxDropdownHeight={200}
      />

      <div>
        <Text fw={600} size="sm" mb="xs">
          Action Steps
        </Text>
        <Stack gap="md">
          {steps.map((step, index) => (
            <ActionStepFields
              key={index}
              step={step}
              index={index}
              skillOptions={skillOptions}
              canRemove={steps.length > 1}
              onChange={handleStepChange}
              onRemove={removeStep}
            />
          ))}
        </Stack>

        <Button
          variant="light"
          leftSection={<IconPlus size={14} />}
          mt="sm"
          size="sm"
          onClick={addStep}
        >
          Add Step
        </Button>
      </div>

      <Group justify="flex-end">
        <Button
          variant="default"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting}>
          Create Plan
        </Button>
      </Group>
    </Stack>
  );
}
