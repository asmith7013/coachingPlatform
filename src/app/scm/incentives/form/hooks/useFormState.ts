"use client";

import { useState, useEffect, useCallback } from "react";
import { useUrlSyncedState } from "@/hooks/scm/useUrlSyncedState";

// =====================================
// TYPES
// =====================================

export interface ActivityDetail {
  checked: boolean;
  detail?: string; // Could be inquiry question, lesson ID, skill ID, or custom text
}

export interface StudentActivities {
  [activityTypeId: string]: ActivityDetail;
}

export interface FormState {
  [studentId: string]: StudentActivities;
}

export interface FormFilters {
  unitId: string;
  section: string;
  date: string;
}

// =====================================
// CONSTANTS
// =====================================

const STORAGE_KEYS = {
  UNIT: "incentives-form-current-unit",
  SECTION: "incentives-form-section",
  DATE: "incentives-form-date",
  DRAFT_PREFIX: "incentives-form-draft-",
} as const;

// =====================================
// HOOK: useFormFilters
// =====================================

/**
 * Manage form filters with URL + localStorage persistence.
 *
 * URL params are the source of truth (shareable).
 * localStorage is the fallback for cross-session persistence.
 * Uses the same localStorage keys so Summary/Table pages share state.
 */
export function useFormFilters() {
  const [unitId, setUnitId] = useUrlSyncedState("unit", {
    storageKey: STORAGE_KEYS.UNIT,
  });
  const [section, setSection] = useUrlSyncedState("section", {
    storageKey: STORAGE_KEYS.SECTION,
  });
  const [date, setDateState] = useState<string>(() => {
    // Get local timezone date (YYYY-MM-DD)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const setDate = useCallback((value: string) => {
    setDateState(value);
    localStorage.setItem(STORAGE_KEYS.DATE, value);
  }, []);

  // useUrlSyncedState initializes synchronously from URL/localStorage
  return {
    unitId,
    section,
    date,
    setUnitId,
    setSection,
    setDate,
    isLoaded: true,
  };
}

// =====================================
// HOOK: useFormDraft
// =====================================

/**
 * Manage form draft state with localStorage persistence
 */
export function useFormDraft(date: string) {
  const [formState, setFormState] = useState<FormState>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const draftKey = `${STORAGE_KEYS.DRAFT_PREFIX}${date}`;

  // Load draft from localStorage on mount or when date changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFormState(parsed.formState || {});
        setLastSaved(parsed.timestamp ? new Date(parsed.timestamp) : null);
      } else {
        setFormState({});
        setLastSaved(null);
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
      setFormState({});
    } finally {
      setIsLoaded(true);
    }
  }, [draftKey]);

  // Save draft to localStorage (debounced in parent component)
  const saveDraft = useCallback(
    (state: FormState) => {
      try {
        const timestamp = new Date();
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            formState: state,
            timestamp: timestamp.toISOString(),
          }),
        );
        // Don't call setFormState here - it causes cascading updates
        // The state is already updated by toggleCheckbox/updateDetail
        setLastSaved(timestamp);
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    },
    [draftKey],
  );

  // Clear draft after successful submission
  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    setFormState({});
    setLastSaved(null);
  }, [draftKey]);

  // Check if student has any checked activities
  const hasStudentActivities = useCallback(
    (studentId: string): boolean => {
      const studentData = formState[studentId];
      if (!studentData) return false;
      return Object.values(studentData).some((detail) => detail.checked);
    },
    [formState],
  );

  // Get checked activity types for a student
  const getStudentActivityTypes = useCallback(
    (studentId: string): string[] => {
      const studentData = formState[studentId];
      if (!studentData) return [];
      return Object.entries(studentData)
        .filter(([_, detail]) => detail.checked)
        .map(([activityTypeId]) => activityTypeId);
    },
    [formState],
  );

  // Update a single activity detail
  const updateActivityDetail = useCallback(
    (studentId: string, activityTypeId: string, detail: ActivityDetail) => {
      setFormState((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [activityTypeId]: detail,
        },
      }));
    },
    [],
  );

  // Toggle checkbox
  const toggleCheckbox = useCallback(
    (studentId: string, activityTypeId: string, checked: boolean) => {
      setFormState((prev) => {
        const current = prev[studentId]?.[activityTypeId] || { checked: false };
        return {
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [activityTypeId]: {
              ...current,
              checked,
            },
          },
        };
      });
    },
    [],
  );

  // Update detail value
  const updateDetail = useCallback(
    (studentId: string, activityTypeId: string, detail: string) => {
      setFormState((prev) => {
        const current = prev[studentId]?.[activityTypeId] || { checked: false };
        return {
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [activityTypeId]: {
              ...current,
              detail,
            },
          },
        };
      });
    },
    [],
  );

  return {
    formState,
    lastSaved,
    isLoaded,
    saveDraft,
    clearDraft,
    hasStudentActivities,
    getStudentActivityTypes,
    updateActivityDetail,
    toggleCheckbox,
    updateDetail,
  };
}

// =====================================
// HOOK: useDebouncedSave
// =====================================

/**
 * Debounce draft saves to avoid excessive localStorage writes
 */
export function useDebouncedSave(
  formState: FormState,
  saveDraft: (state: FormState) => void,
  delay: number = 500,
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(formState);
    }, delay);

    return () => clearTimeout(timer);
  }, [formState, saveDraft, delay]);
}
