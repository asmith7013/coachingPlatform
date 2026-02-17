"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Stack, Button, Group, Center, Loader, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ObservationHeader } from "./ObservationHeader";
import { DomainRubricSection } from "./DomainRubricSection";
import { useTaxonomy } from "../_hooks/useTaxonomy";
import { useTeacherSkillStatuses } from "../_hooks/useTeacherSkillStatuses";
import { createObservation } from "../_actions/observation.actions";
import type { RatingScale, ObservationType } from "../_types/observation.types";

interface ObservationGuideProps {
  teacherStaffId: string;
}

export function ObservationGuide({ teacherStaffId }: ObservationGuideProps) {
  const router = useRouter();
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
  const [domainRatings, setDomainRatings] = useState<
    Map<string, { rating: RatingScale | null; evidence: string }>
  >(new Map());

  const activeSkillIds = useMemo(
    () =>
      new Set(
        statuses.filter((s) => s.status === "active").map((s) => s.skillId),
      ),
    [statuses],
  );

  const handleSkillRatingChange = (
    skillId: string,
    rating: RatingScale | null,
  ) => {
    setSkillRatings((prev) => {
      const next = new Map(prev);
      const existing = next.get(skillId) || { rating: null, evidence: "" };
      next.set(skillId, { ...existing, rating });
      return next;
    });
  };

  const handleSkillEvidenceChange = (skillId: string, evidence: string) => {
    setSkillRatings((prev) => {
      const next = new Map(prev);
      const existing = next.get(skillId) || { rating: null, evidence: "" };
      next.set(skillId, { ...existing, evidence });
      return next;
    });
  };

  const handleDomainRatingChange = (
    domainId: string,
    rating: RatingScale | null,
  ) => {
    setDomainRatings((prev) => {
      const next = new Map(prev);
      const existing = next.get(domainId) || { rating: null, evidence: "" };
      next.set(domainId, { ...existing, rating });
      return next;
    });
  };

  const handleDomainEvidenceChange = (domainId: string, evidence: string) => {
    setDomainRatings((prev) => {
      const next = new Map(prev);
      const existing = next.get(domainId) || { rating: null, evidence: "" };
      next.set(domainId, { ...existing, evidence });
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

    const ratedDomains = Array.from(domainRatings.entries())
      .filter(([, v]) => v.rating)
      .map(([domainId, v]) => ({
        domainId,
        overallRating: v.rating,
        evidence: v.evidence || null,
      }));

    setSubmitting(true);

    const result = await createObservation({
      teacherStaffId,
      date: new Date(date).toISOString(),
      type: observationType,
      notes: notes || null,
      ratings: ratedSkills,
      domainRatings: ratedDomains,
    });

    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Observation recorded",
        color: "teal",
      });
      router.push(`/skillsHub/teacher/${teacherStaffId}`);
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
        <Loader />
      </Center>
    );
  }

  if (!taxonomy) {
    return (
      <Center py="xl">
        <Text c="dimmed">No taxonomy data</Text>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <ObservationHeader
        date={date}
        observationType={observationType}
        notes={notes}
        onDateChange={setDate}
        onTypeChange={setObservationType}
        onNotesChange={setNotes}
      />

      {taxonomy.domains.map((domain) => (
        <DomainRubricSection
          key={domain.id}
          domain={domain}
          activeSkillIds={activeSkillIds}
          skillRatings={skillRatings}
          domainRating={
            domainRatings.get(domain.id) || { rating: null, evidence: "" }
          }
          onSkillRatingChange={handleSkillRatingChange}
          onSkillEvidenceChange={handleSkillEvidenceChange}
          onDomainRatingChange={handleDomainRatingChange}
          onDomainEvidenceChange={handleDomainEvidenceChange}
        />
      ))}

      <Group justify="flex-end">
        <Button
          variant="default"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting}>
          Save Observation
        </Button>
      </Group>
    </Stack>
  );
}
