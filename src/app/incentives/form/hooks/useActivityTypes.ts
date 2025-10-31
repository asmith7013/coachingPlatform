"use client";

import { useState, useEffect, useCallback } from "react";
import { ActivityTypeConfig } from "@zod-schema/313/activity-type-config";
import { fetchActivityTypes } from "../actions";

// =====================================
// HOOK: useActivityTypes
// =====================================

/**
 * Fetch and manage activity type configs
 */
export function useActivityTypes() {
  const [activityTypes, setActivityTypes] = useState<ActivityTypeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivityTypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchActivityTypes();

      if (result.success && result.data) {
        setActivityTypes(result.data as ActivityTypeConfig[]);
      } else {
        setError(result.error || "Failed to load activity types");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivityTypes();
  }, [loadActivityTypes]);

  return {
    activityTypes,
    isLoading,
    error,
    reload: loadActivityTypes,
  };
}
