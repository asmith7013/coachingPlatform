"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Accordion,
  Select,
  Textarea,
  Button,
  Text,
  Badge,
  Center,
  Loader,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { SkillSoloCard } from "../skills/SkillSoloCard";
import { collectActiveSkills } from "../skills/ProgressStatsRow";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import { useTeacherSkillStatuses } from "../../hooks/useTeacherSkillStatuses";
import { createObservation } from "../../coach/observations/observation.actions";
import type {
  RatingScale,
  ObservationType,
} from "../../coach/observations/observation.types";

const OBSERVATION_TYPE_OPTIONS = [
  { value: "classroom_visit", label: "Classroom Visit" },
  { value: "debrief", label: "Debrief" },
  { value: "one_on_one", label: "One-on-One" },
  { value: "quick_update", label: "Quick Update" },
];

const RATING_OPTIONS = [
  { value: "not_observed", label: "Not Observed" },
  { value: "partial", label: "Partial" },
  { value: "mostly", label: "Mostly" },
  { value: "fully", label: "Fully" },
];

const RATING_COLORS: Record<RatingScale, string> = {
  not_observed: "gray",
  partial: "orange",
  mostly: "yellow",
  fully: "green",
};

interface DrawerObservationFormProps {
  teacherStaffId: string;
}

export function DrawerObservationForm({
  teacherStaffId,
}: DrawerObservationFormProps) {
  const { taxonomy, loading: taxLoading } = useTaxonomy();
  const { statuses, loading: statusLoading } =
    useTeacherSkillStatuses(teacherStaffId);

  const [date, setDate] = useState<string | null>(
    new Date().toISOString().split("T")[0],
  );
  const [observationType, setObservationType] =
    useState<ObservationType | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [skillRatings, setSkillRatings] = useState<
    Map<string, { rating: RatingScale | null; evidence: string }>
  >(new Map());

  const statusMap = useMemo(() => {
    const map = new Map<string, (typeof statuses)[number]>();
    for (const s of statuses) {
      map.set(s.skillId, s);
    }
    return map;
  }, [statuses]);

  const activeSkills = useMemo(() => {
    if (!taxonomy) return [];
    return collectActiveSkills(taxonomy, statusMap);
  }, [taxonomy, statusMap]);

  const handleRatingChange = (skillId: string, rating: RatingScale | null) => {
    setSkillRatings((prev) => {
      const next = new Map(prev);
      const existing = next.get(skillId) || { rating: null, evidence: "" };
      next.set(skillId, { ...existing, rating });
      return next;
    });
  };

  const handleEvidenceChange = (skillId: string, evidence: string) => {
    setSkillRatings((prev) => {
      const next = new Map(prev);
      const existing = next.get(skillId) || { rating: null, evidence: "" };
      next.set(skillId, { ...existing, evidence });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!date) {
      notifications.show({
        title: "Validation",
        message: "Date is required",
        color: "red",
      });
      return;
    }

    const ratedSkills = Array.from(skillRatings.entries())
      .filter(([, v]) => v.rating && v.rating !== "not_observed")
      .map(([skillId, v]) => ({
        skillId,
        rating: v.rating!,
        evidence: v.evidence || null,
      }));

    if (ratedSkills.length === 0) {
      notifications.show({
        title: "Validation",
        message: "Rate at least one skill before submitting",
        color: "red",
      });
      return;
    }

    setSubmitting(true);

    const result = await createObservation({
      teacherStaffId,
      date: new Date(date).toISOString(),
      type: observationType,
      notes: notes || null,
      ratings: ratedSkills,
      domainRatings: [],
    });

    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Observation recorded",
        color: "teal",
      });
      // Reset form
      setSkillRatings(new Map());
      setNotes("");
      setObservationType(null);
    } else {
      notifications.show({
        title: "Error",
        message: result.error || "Failed to save observation",
        color: "red",
      });
    }
  };

  if (taxLoading || statusLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (activeSkills.length === 0) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="xl">
        No active skills to observe
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <DatePickerInput
        label="Date"
        value={date}
        onChange={setDate}
        size="xs"
        maxDate={new Date()}
      />

      <Select
        label="Type"
        placeholder="Select type..."
        size="xs"
        data={OBSERVATION_TYPE_OPTIONS}
        value={observationType}
        onChange={(val) => setObservationType((val as ObservationType) || null)}
        clearable
      />

      <Textarea
        label="Notes"
        placeholder="General notes..."
        size="xs"
        autosize
        minRows={2}
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
      />

      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
        Active Skills
      </Text>

      <Accordion multiple variant="separated">
        {activeSkills.map(({ skill }) => {
          const skillData = skillRatings.get(skill.uuid);
          const currentRating = skillData?.rating ?? null;

          return (
            <SkillSoloCard
              key={skill.uuid}
              accordion
              skillId={skill.uuid}
              skillName={skill.name}
              description={skill.description}
              level={skill.level}
              status="active"
              isLocked={false}
              rightSection={
                currentRating && currentRating !== "not_observed" ? (
                  <Badge
                    size="xs"
                    variant="light"
                    color={RATING_COLORS[currentRating]}
                    style={{ flexShrink: 0 }}
                  >
                    {currentRating}
                  </Badge>
                ) : undefined
              }
            >
              <Stack gap="xs">
                <Textarea
                  placeholder="Evidence..."
                  size="xs"
                  autosize
                  minRows={2}
                  value={skillData?.evidence ?? ""}
                  onChange={(e) =>
                    handleEvidenceChange(skill.uuid, e.currentTarget.value)
                  }
                />
                <Select
                  placeholder="Rating..."
                  size="xs"
                  data={RATING_OPTIONS}
                  value={currentRating}
                  onChange={(val) =>
                    handleRatingChange(skill.uuid, (val as RatingScale) || null)
                  }
                  clearable
                />
              </Stack>
            </SkillSoloCard>
          );
        })}
      </Accordion>

      <Button onClick={handleSubmit} loading={submitting} fullWidth>
        Save Observation
      </Button>
    </Stack>
  );
}
