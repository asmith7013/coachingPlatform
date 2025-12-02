"use client";

import { useState, useEffect, useCallback } from "react";

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
 * Manage form filters with localStorage persistence
 */
export function useFormFilters() {
  const [unitId, setUnitIdState] = useState<string>("");
  const [section, setSectionState] = useState<string>("");
  const [date, setDateState] = useState<string>(() => {
    // Get local timezone date (YYYY-MM-DD)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUnit = localStorage.getItem(STORAGE_KEYS.UNIT);
    const storedSection = localStorage.getItem(STORAGE_KEYS.SECTION);
    // Always default to today's date (don't load from localStorage)

    if (storedUnit) setUnitIdState(storedUnit);
    if (storedSection) setSectionState(storedSection);

    setIsLoaded(true);
  }, []);

  const setUnitId = useCallback((value: string) => {
    setUnitIdState(value);
    localStorage.setItem(STORAGE_KEYS.UNIT, value);
  }, []);

  const setSection = useCallback((value: string) => {
    setSectionState(value);
    localStorage.setItem(STORAGE_KEYS.SECTION, value);
  }, []);

  const setDate = useCallback((value: string) => {
    setDateState(value);
    localStorage.setItem(STORAGE_KEYS.DATE, value);
  }, []);

  return {
    unitId,
    section,
    date,
    setUnitId,
    setSection,
    setDate,
    isLoaded,
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
          })
        );
        // Don't call setFormState here - it causes cascading updates
        // The state is already updated by toggleCheckbox/updateDetail
        setLastSaved(timestamp);
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    },
    [draftKey]
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
    [formState]
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
    [formState]
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
    []
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
    []
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
    []
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
  delay: number = 500
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(formState);
    }, delay);

    return () => clearTimeout(timer);
  }, [formState, saveDraft, delay]);
}
