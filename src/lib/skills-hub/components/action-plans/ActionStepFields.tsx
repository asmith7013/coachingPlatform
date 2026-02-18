"use client";

import {
  TextInput,
  Textarea,
  MultiSelect,
  ActionIcon,
  Group,
  Stack,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconTrash } from "@tabler/icons-react";

export interface ActionStepFormData {
  description: string;
  dueDate: string | null;
  evidenceOfCompletion: string;
  skillIds: string[];
}

interface ActionStepFieldsProps {
  step: ActionStepFormData;
  index: number;
  skillOptions: { group: string; items: { value: string; label: string }[] }[];
  canRemove: boolean;
  onChange: (
    index: number,
    field: keyof ActionStepFormData,
    value: unknown,
  ) => void;
  onRemove: (index: number) => void;
}

export function ActionStepFields({
  step,
  index,
  skillOptions,
  canRemove,
  onChange,
  onRemove,
}: ActionStepFieldsProps) {
  return (
    <Stack
      gap="sm"
      p="md"
      style={{
        border: "1px solid var(--mantine-color-gray-3)",
        borderRadius: "8px",
      }}
    >
      <Group justify="space-between" align="flex-start">
        <TextInput
          label={`Step ${index + 1}`}
          placeholder="What should the teacher do?"
          value={step.description}
          onChange={(e) =>
            onChange(index, "description", e.currentTarget.value)
          }
          required
          style={{ flex: 1 }}
        />
        {canRemove && (
          <ActionIcon
            variant="light"
            color="red"
            mt={24}
            onClick={() => onRemove(index)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>

      <Group grow>
        <DatePickerInput
          label="Due date"
          placeholder="Select date"
          value={step.dueDate}
          onChange={(val) => onChange(index, "dueDate", val)}
          clearable
        />
        <MultiSelect
          label="Tagged skills"
          placeholder="Select skills"
          data={skillOptions}
          value={step.skillIds}
          onChange={(val) => onChange(index, "skillIds", val)}
          searchable
          maxDropdownHeight={200}
        />
      </Group>

      <Textarea
        label="Evidence of completion"
        placeholder="How will you know this step is done?"
        value={step.evidenceOfCompletion}
        onChange={(e) =>
          onChange(index, "evidenceOfCompletion", e.currentTarget.value)
        }
        autosize
        minRows={2}
      />
    </Stack>
  );
}
