"use client";

import { useState, useCallback } from "react";
import { notifications } from "@mantine/notifications";
import { createObservation } from "../coach/observations/observation.actions";
import type {
  RatingScale,
  ObservationType,
} from "../coach/observations/observation.types";

interface SubmitOptions {
  /** Validation message when no skills are rated */
  emptyRatingMessage?: string;
  /** Called after a successful submission */
  onSuccess?: () => void;
}

export function useObservationForm(teacherStaffId: string) {
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

  const handleSkillRatingChange = useCallback(
    (skillId: string, rating: RatingScale | null) => {
      setSkillRatings((prev) => {
        const next = new Map(prev);
        const existing = next.get(skillId) || { rating: null, evidence: "" };
        next.set(skillId, { ...existing, rating });
        return next;
      });
    },
    [],
  );

  const handleSkillEvidenceChange = useCallback(
    (skillId: string, evidence: string) => {
      setSkillRatings((prev) => {
        const next = new Map(prev);
        const existing = next.get(skillId) || { rating: null, evidence: "" };
        next.set(skillId, { ...existing, evidence });
        return next;
      });
    },
    [],
  );

  const handleDomainRatingChange = useCallback(
    (domainId: string, rating: RatingScale | null) => {
      setDomainRatings((prev) => {
        const next = new Map(prev);
        const existing = next.get(domainId) || { rating: null, evidence: "" };
        next.set(domainId, { ...existing, rating });
        return next;
      });
    },
    [],
  );

  const handleDomainEvidenceChange = useCallback(
    (domainId: string, evidence: string) => {
      setDomainRatings((prev) => {
        const next = new Map(prev);
        const existing = next.get(domainId) || { rating: null, evidence: "" };
        next.set(domainId, { ...existing, evidence });
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setSkillRatings(new Map());
    setDomainRatings(new Map());
    setNotes("");
    setObservationType(null);
  }, []);

  const handleSubmit = useCallback(
    async (options?: SubmitOptions) => {
      if (!date) {
        notifications.show({
          title: "Validation",
          message: "Date is required",
          color: "red",
        });
        return false;
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
          message:
            options?.emptyRatingMessage ||
            "Rate at least one skill before submitting",
          color: "red",
        });
        return false;
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
        options?.onSuccess?.();
        return true;
      } else {
        notifications.show({
          title: "Error",
          message: result.error || "Failed to save observation",
          color: "red",
        });
        return false;
      }
    },
    [date, skillRatings, domainRatings, teacherStaffId, observationType, notes],
  );

  return {
    // Form state
    date,
    setDate,
    observationType,
    setObservationType,
    notes,
    setNotes,
    submitting,
    skillRatings,
    domainRatings,
    // Handlers
    handleSkillRatingChange,
    handleSkillEvidenceChange,
    handleDomainRatingChange,
    handleDomainEvidenceChange,
    handleSubmit,
    reset,
  };
}
