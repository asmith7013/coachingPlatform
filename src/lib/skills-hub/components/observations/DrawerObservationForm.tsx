"use client";

import { useMemo } from "react";
import {
  Stack,
  Card,
  Select,
  Group,
  Textarea,
  Button,
  Text,
  Badge,
  Center,
  Loader,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { SkillIconCircle } from "../skills/SkillIconCircle";
import { collectActiveSkills } from "../../core/active-skills";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import { useTeacherSkillStatuses } from "../../hooks/useTeacherSkillStatuses";
import { useObservationForm } from "../../hooks/useObservationForm";
import {
  OBSERVATION_TYPE_OPTIONS,
  RATING_OPTIONS,
  RATING_COLORS,
} from "../../coach/observations/observation.constants";
import { RatingPills } from "../core/RatingPills";
import type { RatingPillOption } from "../core/RatingPills";
import type {
  RatingScale,
  ObservationType,
} from "../../coach/observations/observation.types";

const RATING_PILL_OPTIONS: RatingPillOption[] = RATING_OPTIONS.map((opt) => ({
  ...opt,
  color: RATING_COLORS[opt.value as RatingScale],
}));

interface DrawerObservationFormProps {
  teacherStaffId: string;
}

export function DrawerObservationForm({
  teacherStaffId,
}: DrawerObservationFormProps) {
  const { taxonomy, loading: taxLoading } = useTaxonomy();
  const { statuses, loading: statusLoading } =
    useTeacherSkillStatuses(teacherStaffId);

  const form = useObservationForm(teacherStaffId);

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
      <Group grow>
        <DatePickerInput
          label="Date"
          value={form.date}
          onChange={form.setDate}
          size="xs"
          maxDate={new Date()}
          withAsterisk
        />
        <Select
          label="Type"
          placeholder="Select type..."
          size="xs"
          data={OBSERVATION_TYPE_OPTIONS}
          value={form.observationType}
          onChange={(val) =>
            form.setObservationType((val as ObservationType) || null)
          }
          clearable
        />
      </Group>

      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
        Active Skills
      </Text>

      <Stack gap="sm">
        {activeSkills.map(({ skill }) => {
          const skillData = form.skillRatings.get(skill.uuid);
          const currentRating = skillData?.rating ?? null;

          return (
            <Card key={skill.uuid} withBorder p="sm">
              <Stack gap="xs">
                <Group gap="xs" wrap="nowrap">
                  <SkillIconCircle
                    skillId={skill.uuid}
                    status="active"
                    isLocked={false}
                    size={28}
                  />
                  <Text
                    size="sm"
                    fw={500}
                    lineClamp={1}
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    {skill.name}
                  </Text>
                  {currentRating && currentRating !== "not_observed" && (
                    <Badge
                      size="xs"
                      variant="light"
                      color={RATING_COLORS[currentRating]}
                      style={{ flexShrink: 0 }}
                    >
                      {currentRating}
                    </Badge>
                  )}
                  <Text size="xs" c="dimmed" fw={500} style={{ flexShrink: 0 }}>
                    L{skill.level}
                  </Text>
                </Group>
                <Textarea
                  placeholder="Evidence..."
                  size="xs"
                  autosize
                  minRows={2}
                  value={skillData?.evidence ?? ""}
                  onChange={(e) =>
                    form.handleSkillEvidenceChange(
                      skill.uuid,
                      e.currentTarget.value,
                    )
                  }
                />
                <div>
                  <Text size="xs" fw={500} mb={4}>
                    Rating{" "}
                    <span style={{ color: "var(--mantine-color-red-6)" }}>
                      *
                    </span>
                  </Text>
                  <RatingPills
                    options={RATING_PILL_OPTIONS}
                    value={currentRating}
                    onChange={(val) =>
                      form.handleSkillRatingChange(
                        skill.uuid,
                        (val as RatingScale) || null,
                      )
                    }
                    size="xs"
                  />
                </div>
              </Stack>
            </Card>
          );
        })}
      </Stack>

      <Textarea
        label="Notes"
        placeholder="General notes..."
        size="xs"
        autosize
        minRows={2}
        value={form.notes}
        onChange={(e) => form.setNotes(e.currentTarget.value)}
      />

      <Button
        onClick={() => form.handleSubmit({ onSuccess: form.reset })}
        loading={form.submitting}
        fullWidth
      >
        Save Observation
      </Button>
    </Stack>
  );
}
