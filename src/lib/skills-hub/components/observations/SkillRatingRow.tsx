"use client";

import { Group, Text, SegmentedControl, Textarea, Stack } from "@mantine/core";
import type { RatingScale } from "../../coach/observations/observation.types";

interface SkillRatingRowProps {
  skillId: string;
  skillName: string;
  skillDescription: string;
  rating: RatingScale | null;
  evidence: string;
  onRatingChange: (skillId: string, rating: RatingScale | null) => void;
  onEvidenceChange: (skillId: string, evidence: string) => void;
}

const RATING_OPTIONS = [
  { label: "N/O", value: "not_observed" },
  { label: "Partial", value: "partial" },
  { label: "Mostly", value: "mostly" },
  { label: "Fully", value: "fully" },
];

export function SkillRatingRow({
  skillId,
  skillName,
  skillDescription,
  rating,
  evidence,
  onRatingChange,
  onEvidenceChange,
}: SkillRatingRowProps) {
  return (
    <Stack
      gap="xs"
      py="sm"
      px="md"
      style={{
        borderBottom: "1px solid var(--mantine-color-gray-2)",
      }}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {skillName}
          </Text>
          {skillDescription && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {skillDescription}
            </Text>
          )}
        </div>
        <SegmentedControl
          size="xs"
          data={RATING_OPTIONS}
          value={rating || ""}
          onChange={(val) =>
            onRatingChange(skillId, (val as RatingScale) || null)
          }
        />
      </Group>

      {rating && rating !== "not_observed" && (
        <Textarea
          placeholder="Evidence / notes for this skill..."
          value={evidence}
          onChange={(e) => onEvidenceChange(skillId, e.currentTarget.value)}
          autosize
          minRows={1}
          maxRows={3}
          size="xs"
        />
      )}
    </Stack>
  );
}
