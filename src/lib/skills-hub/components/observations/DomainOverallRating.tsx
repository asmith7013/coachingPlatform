"use client";

import { Group, Text, SegmentedControl, Textarea, Stack } from "@mantine/core";
import type { RatingScale } from "../_types/observation.types";

interface DomainOverallRatingProps {
  domainId: string;
  domainName: string;
  rating: RatingScale | null;
  evidence: string;
  onRatingChange: (domainId: string, rating: RatingScale | null) => void;
  onEvidenceChange: (domainId: string, evidence: string) => void;
}

const RATING_OPTIONS = [
  { label: "N/O", value: "not_observed" },
  { label: "Partial", value: "partial" },
  { label: "Mostly", value: "mostly" },
  { label: "Fully", value: "fully" },
];

export function DomainOverallRating({
  domainId,
  domainName,
  rating,
  evidence,
  onRatingChange,
  onEvidenceChange,
}: DomainOverallRatingProps) {
  return (
    <Stack
      gap="xs"
      p="sm"
      mt="sm"
      style={{
        backgroundColor: "var(--mantine-color-gray-0)",
        borderRadius: "6px",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" fw={600}>
          Overall: {domainName}
        </Text>
        <SegmentedControl
          size="xs"
          data={RATING_OPTIONS}
          value={rating || ""}
          onChange={(val) =>
            onRatingChange(domainId, (val as RatingScale) || null)
          }
        />
      </Group>
      {rating && rating !== "not_observed" && (
        <Textarea
          placeholder="Overall domain evidence..."
          value={evidence}
          onChange={(e) => onEvidenceChange(domainId, e.currentTarget.value)}
          autosize
          minRows={1}
          size="xs"
        />
      )}
    </Stack>
  );
}
