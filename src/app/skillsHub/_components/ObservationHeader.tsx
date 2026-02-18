"use client";

import { Group, Select, Textarea, Stack } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { ObservationType } from "../_types/observation.types";

interface ObservationHeaderProps {
  date: string | null;
  observationType: ObservationType | null;
  notes: string;
  onDateChange: (date: string | null) => void;
  onTypeChange: (type: ObservationType | null) => void;
  onNotesChange: (notes: string) => void;
}

const TYPE_OPTIONS = [
  { value: "classroom_visit", label: "Classroom Visit" },
  { value: "debrief", label: "Debrief" },
  { value: "one_on_one", label: "1:1 Meeting" },
  { value: "quick_update", label: "Quick Update" },
];

export function ObservationHeader({
  date,
  observationType,
  notes,
  onDateChange,
  onTypeChange,
  onNotesChange,
}: ObservationHeaderProps) {
  return (
    <Stack gap="sm">
      <Group grow>
        <DatePickerInput
          label="Date"
          value={date}
          onChange={onDateChange}
          required
        />
        <Select
          label="Type"
          placeholder="Select type"
          data={TYPE_OPTIONS}
          value={observationType}
          onChange={(val) => onTypeChange((val as ObservationType) || null)}
          clearable
        />
      </Group>
      <Textarea
        label="Overall Notes"
        placeholder="General observation notes..."
        value={notes}
        onChange={(e) => onNotesChange(e.currentTarget.value)}
        autosize
        minRows={2}
      />
    </Stack>
  );
}
