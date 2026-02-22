"use client";

import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import {
  getProgressionSteps,
  completeProgressionStep,
  uncompleteProgressionStep,
} from "../coach/skill-progressions/progression-step.actions";
import type { ProgressionStepDocument } from "../coach/skill-progressions/progression-step.types";

/**
 * Manages progression step state: auto-loads steps when planId changes,
 * provides optimistic toggle with rollback, and derived progress stats.
 */
export function useProgressionSteps(planId: string | null) {
  const [steps, setSteps] = useState<ProgressionStepDocument[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);

  useEffect(() => {
    if (!planId) {
      setSteps([]);
      return;
    }
    let cancelled = false;
    setLoadingSteps(true);
    getProgressionSteps(planId).then((result) => {
      if (cancelled) return;
      if (result.success && result.data) {
        setSteps(result.data);
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to load steps",
          color: "red",
        });
      }
      setLoadingSteps(false);
    });
    return () => {
      cancelled = true;
    };
  }, [planId]);

  const handleToggleStep = async (stepId: string, completed: boolean) => {
    const previousSteps = steps;
    setSteps((prev) =>
      prev.map((s) =>
        s._id === stepId
          ? completed
            ? { ...s, completed: false, completedAt: null }
            : { ...s, completed: true, completedAt: new Date().toISOString() }
          : s,
      ),
    );
    try {
      const result = completed
        ? await uncompleteProgressionStep(stepId)
        : await completeProgressionStep(stepId);
      if (!result.success) {
        setSteps(previousSteps);
        notifications.show({
          title: "Error",
          message: "Failed to update step",
          color: "red",
        });
      }
    } catch {
      setSteps(previousSteps);
      notifications.show({
        title: "Error",
        message: "Failed to update step",
        color: "red",
      });
    }
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  return {
    steps,
    setSteps,
    loadingSteps,
    handleToggleStep,
    completedCount,
    totalSteps,
    progress,
  };
}
