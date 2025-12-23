'use client';

import { useReducer, useCallback, useEffect, useState } from 'react';
import type { WizardState, WizardAction, WizardStep, ProblemAnalysis, StrategyDefinition, Scenario, LoadingProgress } from '../lib/types';
import { initialWizardState } from '../lib/types';

// Local storage key prefix for persisting wizard state (per session)
const STORAGE_KEY_PREFIX = 'worked-example-wizard-';

/**
 * Saved session metadata for the drafts list
 */
export interface SavedSession {
  id: string; // scopeAndSequenceId
  lessonName: string;
  gradeLevel: string | null;
  unitNumber: number | null;
  lessonNumber: number | null;
  currentStep: WizardStep;
  savedAt: number; // timestamp
}

/**
 * Get storage key for a specific session
 */
function getStorageKey(scopeAndSequenceId: string): string {
  return `${STORAGE_KEY_PREFIX}${scopeAndSequenceId}`;
}

/**
 * Get all saved sessions from localStorage
 */
export function getAllSavedSessions(): SavedSession[] {
  if (typeof window === 'undefined') return [];

  const sessions: SavedSession[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '');
        if (data.scopeAndSequenceId) {
          sessions.push({
            id: data.scopeAndSequenceId,
            lessonName: data.lessonName || 'Untitled',
            gradeLevel: data.gradeLevel,
            unitNumber: data.unitNumber,
            lessonNumber: data.lessonNumber,
            currentStep: data.currentStep || 1,
            savedAt: data.savedAt || Date.now(),
          });
        }
      } catch {
        // Skip invalid entries
      }
    }
  }

  // Sort by grade, unit, then lesson number for stable ordering
  return sessions.sort((a, b) => {
    // Compare grade level (handle null)
    const gradeA = a.gradeLevel || '';
    const gradeB = b.gradeLevel || '';
    if (gradeA !== gradeB) return gradeA.localeCompare(gradeB);

    // Compare unit number (handle null)
    const unitA = a.unitNumber ?? 0;
    const unitB = b.unitNumber ?? 0;
    if (unitA !== unitB) return unitA - unitB;

    // Compare lesson number (handle null)
    const lessonA = a.lessonNumber ?? 0;
    const lessonB = b.lessonNumber ?? 0;
    return lessonA - lessonB;
  });
}

/**
 * Delete a saved session from localStorage
 */
export function deleteSavedSession(scopeAndSequenceId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getStorageKey(scopeAndSequenceId));
}

/**
 * Wizard state reducer
 */
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'SET_GRADE_LEVEL':
      return { ...state, gradeLevel: action.payload };

    case 'SET_UNIT_NUMBER':
      return { ...state, unitNumber: action.payload };

    case 'SET_LESSON_NUMBER':
      return { ...state, lessonNumber: action.payload };

    case 'SET_LESSON_NAME':
      return { ...state, lessonName: action.payload };

    case 'SET_SCOPE_AND_SEQUENCE_ID':
      return { ...state, scopeAndSequenceId: action.payload };

    case 'SET_LEARNING_GOALS':
      return { ...state, learningGoals: action.payload };

    case 'SET_MASTERY_IMAGE':
      return {
        ...state,
        masteryCheckImage: {
          ...state.masteryCheckImage,
          file: action.payload.file,
          preview: action.payload.preview,
        },
      };

    case 'SET_UPLOADED_IMAGE_URL':
      return {
        ...state,
        masteryCheckImage: {
          ...state.masteryCheckImage,
          uploadedUrl: action.payload,
        },
      };

    case 'SET_ANALYSIS':
      return {
        ...state,
        problemAnalysis: action.payload.problemAnalysis,
        strategyDefinition: action.payload.strategyDefinition,
        scenarios: action.payload.scenarios,
        // Auto-fill some metadata from analysis
        title: `${action.payload.strategyDefinition.name} - ${action.payload.problemAnalysis.problemType}`,
        mathConcept: action.payload.problemAnalysis.problemType,
        slug: generateSlug(action.payload.strategyDefinition.name, state.gradeLevel),
      };

    case 'UPDATE_STRATEGY_NAME':
      if (!state.strategyDefinition) return state;
      return {
        ...state,
        strategyDefinition: {
          ...state.strategyDefinition,
          name: action.payload,
        },
        title: `${action.payload} - ${state.problemAnalysis?.problemType || ''}`,
        slug: generateSlug(action.payload, state.gradeLevel),
      };

    case 'UPDATE_SCENARIO':
      if (!state.scenarios) return state;
      const newScenarios = [...state.scenarios];
      newScenarios[action.payload.index] = action.payload.scenario;
      return { ...state, scenarios: newScenarios };

    case 'SET_SLIDES':
      return { ...state, slides: action.payload };

    case 'UPDATE_SLIDE':
      const newSlides = [...state.slides];
      if (newSlides[action.payload.index]) {
        newSlides[action.payload.index] = {
          ...newSlides[action.payload.index],
          htmlContent: action.payload.htmlContent,
        };
      }
      return { ...state, slides: newSlides };

    case 'SET_SELECTED_SLIDE':
      return { ...state, selectedSlideIndex: action.payload };

    case 'SET_TITLE':
      return { ...state, title: action.payload };

    case 'SET_SLUG':
      return { ...state, slug: action.payload };

    case 'SET_MATH_CONCEPT':
      return { ...state, mathConcept: action.payload };

    case 'SET_MATH_STANDARD':
      return { ...state, mathStandard: action.payload };

    case 'SET_IS_PUBLIC':
      return { ...state, isPublic: action.payload };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message || '',
        // Reset progress when loading stops
        loadingProgress: action.payload.isLoading
          ? state.loadingProgress
          : { phase: 'idle', message: '' },
      };

    case 'SET_LOADING_PROGRESS':
      return {
        ...state,
        isLoading: action.payload.phase !== 'idle',
        loadingProgress: action.payload,
        loadingMessage: action.payload.message,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        // Clear loading state on error
        isLoading: false,
        loadingProgress: { phase: 'idle', message: '' },
      };

    case 'RESET':
      return initialWizardState;

    default:
      return state;
  }
}

/**
 * Generate a URL-safe slug from strategy name and grade
 */
function generateSlug(strategyName: string, gradeLevel: string | null): string {
  const base = strategyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const grade = gradeLevel ? `-grade${gradeLevel.replace(/\s+/g, '')}` : '';
  return `${base}${grade}`;
}

/**
 * Load state from localStorage for a specific session
 */
function loadPersistedState(scopeAndSequenceId: string | null): WizardState | null {
  if (typeof window === 'undefined' || !scopeAndSequenceId) return null;

  try {
    const saved = localStorage.getItem(getStorageKey(scopeAndSequenceId));
    if (!saved) return null;

    const parsed = JSON.parse(saved);

    // Don't restore file objects (they can't be serialized)
    if (parsed.masteryCheckImage) {
      parsed.masteryCheckImage.file = null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save state to localStorage (only when scopeAndSequenceId exists)
 */
function persistState(state: WizardState): void {
  if (typeof window === 'undefined' || !state.scopeAndSequenceId) return;

  try {
    // Create a copy without file objects (they can't be serialized)
    // Add savedAt timestamp for sorting in drafts list
    const toPersist = {
      ...state,
      masteryCheckImage: {
        ...state.masteryCheckImage,
        file: null,
      },
      savedAt: Date.now(),
    };
    localStorage.setItem(getStorageKey(state.scopeAndSequenceId), JSON.stringify(toPersist));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Custom hook for wizard state management
 */
export function useWizardState() {
  // Always start with initial state for SSR consistency
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Mark as hydrated on mount and clean up legacy storage key
  useEffect(() => {
    // Remove old global storage key if it exists (one-time migration)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('worked-example-wizard-state');
    }
    setIsHydrated(true);
    // Load saved sessions list
    setSavedSessions(getAllSavedSessions());
  }, []);

  // Persist state changes to localStorage (only after Step 1 complete)
  useEffect(() => {
    if (!isHydrated || !state.scopeAndSequenceId) return;
    persistState(state);
    // Update saved sessions list after persisting
    setSavedSessions(getAllSavedSessions());
  }, [state, isHydrated]);

  // Load a saved session explicitly (called from SavedDrafts UI)
  const loadSession = useCallback((sessionId: string) => {
    const persisted = loadPersistedState(sessionId);
    if (!persisted) return false;

    // Restore ALL fields from the saved session
    if (persisted.gradeLevel) dispatch({ type: 'SET_GRADE_LEVEL', payload: persisted.gradeLevel });
    if (persisted.unitNumber) dispatch({ type: 'SET_UNIT_NUMBER', payload: persisted.unitNumber });
    if (persisted.lessonNumber) dispatch({ type: 'SET_LESSON_NUMBER', payload: persisted.lessonNumber });
    if (persisted.lessonName) dispatch({ type: 'SET_LESSON_NAME', payload: persisted.lessonName });
    if (persisted.scopeAndSequenceId) dispatch({ type: 'SET_SCOPE_AND_SEQUENCE_ID', payload: persisted.scopeAndSequenceId });
    if (persisted.learningGoals?.length) dispatch({ type: 'SET_LEARNING_GOALS', payload: persisted.learningGoals });
    if (persisted.masteryCheckImage?.uploadedUrl) {
      dispatch({ type: 'SET_UPLOADED_IMAGE_URL', payload: persisted.masteryCheckImage.uploadedUrl });
    }
    if (persisted.problemAnalysis && persisted.strategyDefinition && persisted.scenarios) {
      dispatch({
        type: 'SET_ANALYSIS',
        payload: {
          problemAnalysis: persisted.problemAnalysis,
          strategyDefinition: persisted.strategyDefinition,
          scenarios: persisted.scenarios,
        },
      });
    }
    if (persisted.slides?.length) dispatch({ type: 'SET_SLIDES', payload: persisted.slides });
    if (persisted.title) dispatch({ type: 'SET_TITLE', payload: persisted.title });
    if (persisted.slug) dispatch({ type: 'SET_SLUG', payload: persisted.slug });

    // Jump to appropriate step based on progress:
    // - If all 15 slides exist, go straight to Step 3 (review slides)
    // - Otherwise, restore the saved step
    const EXPECTED_SLIDE_COUNT = 15;
    if (persisted.slides?.length >= EXPECTED_SLIDE_COUNT) {
      dispatch({ type: 'SET_STEP', payload: 3 });
    } else if (persisted.currentStep) {
      dispatch({ type: 'SET_STEP', payload: persisted.currentStep });
    }

    // If there was a loading state, clear it - API calls don't survive refresh
    if (persisted.isLoading) {
      dispatch({ type: 'SET_ERROR', payload: 'Previous operation was interrupted. Please try again.' });
    }

    return true;
  }, []);

  // Delete a saved session and refresh the list
  const deleteSession = useCallback((sessionId: string) => {
    deleteSavedSession(sessionId);
    setSavedSessions(getAllSavedSessions());
  }, []);

  // Action creators
  const setStep = useCallback((step: WizardStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: Math.min(state.currentStep + 1, 4) as WizardStep });
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: Math.max(state.currentStep - 1, 1) as WizardStep });
  }, [state.currentStep]);

  const setGradeLevel = useCallback((grade: WizardState['gradeLevel']) => {
    dispatch({ type: 'SET_GRADE_LEVEL', payload: grade });
  }, []);

  const setUnitNumber = useCallback((unit: number | null) => {
    dispatch({ type: 'SET_UNIT_NUMBER', payload: unit });
  }, []);

  const setLessonNumber = useCallback((lesson: number | null) => {
    dispatch({ type: 'SET_LESSON_NUMBER', payload: lesson });
  }, []);

  const setLessonName = useCallback((name: string) => {
    dispatch({ type: 'SET_LESSON_NAME', payload: name });
  }, []);

  const setScopeAndSequenceId = useCallback((id: string | null) => {
    dispatch({ type: 'SET_SCOPE_AND_SEQUENCE_ID', payload: id });
  }, []);

  const setLearningGoals = useCallback((goals: string[]) => {
    dispatch({ type: 'SET_LEARNING_GOALS', payload: goals });
  }, []);

  const setMasteryImage = useCallback((file: File | null, preview: string | null) => {
    dispatch({ type: 'SET_MASTERY_IMAGE', payload: { file, preview } });
  }, []);

  const setUploadedImageUrl = useCallback((url: string) => {
    dispatch({ type: 'SET_UPLOADED_IMAGE_URL', payload: url });
  }, []);

  const setAnalysis = useCallback(
    (analysis: { problemAnalysis: ProblemAnalysis; strategyDefinition: StrategyDefinition; scenarios: Scenario[] }) => {
      dispatch({ type: 'SET_ANALYSIS', payload: analysis });
    },
    []
  );

  const updateStrategyName = useCallback((name: string) => {
    dispatch({ type: 'UPDATE_STRATEGY_NAME', payload: name });
  }, []);

  const updateScenario = useCallback(
    (index: number, scenario: Scenario) => {
      dispatch({ type: 'UPDATE_SCENARIO', payload: { index, scenario } });
    },
    []
  );

  const setSlides = useCallback((slides: WizardState['slides']) => {
    dispatch({ type: 'SET_SLIDES', payload: slides });
  }, []);

  const updateSlide = useCallback((index: number, htmlContent: string) => {
    dispatch({ type: 'UPDATE_SLIDE', payload: { index, htmlContent } });
  }, []);

  const setSelectedSlide = useCallback((index: number) => {
    dispatch({ type: 'SET_SELECTED_SLIDE', payload: index });
  }, []);

  const setTitle = useCallback((title: string) => {
    dispatch({ type: 'SET_TITLE', payload: title });
  }, []);

  const setSlug = useCallback((slug: string) => {
    dispatch({ type: 'SET_SLUG', payload: slug });
  }, []);

  const setMathConcept = useCallback((concept: string) => {
    dispatch({ type: 'SET_MATH_CONCEPT', payload: concept });
  }, []);

  const setMathStandard = useCallback((standard: string) => {
    dispatch({ type: 'SET_MATH_STANDARD', payload: standard });
  }, []);

  const setIsPublic = useCallback((isPublic: boolean) => {
    dispatch({ type: 'SET_IS_PUBLIC', payload: isPublic });
  }, []);

  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading, message } });
  }, []);

  const setLoadingProgress = useCallback((progress: LoadingProgress) => {
    dispatch({ type: 'SET_LOADING_PROGRESS', payload: progress });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const reset = useCallback(() => {
    const sessionId = state.scopeAndSequenceId;
    dispatch({ type: 'RESET' });
    if (typeof window !== 'undefined' && sessionId) {
      localStorage.removeItem(getStorageKey(sessionId));
      // Refresh saved sessions list
      setSavedSessions(getAllSavedSessions());
    }
  }, [state.scopeAndSequenceId]);

  const clearPersistedState = useCallback(() => {
    if (typeof window !== 'undefined' && state.scopeAndSequenceId) {
      localStorage.removeItem(getStorageKey(state.scopeAndSequenceId));
      setSavedSessions(getAllSavedSessions());
    }
  }, [state.scopeAndSequenceId]);

  return {
    state,
    dispatch,
    isHydrated,
    // Saved sessions
    savedSessions,
    loadSession,
    deleteSession,
    // Navigation
    setStep,
    nextStep,
    prevStep,
    // Step 1
    setGradeLevel,
    setUnitNumber,
    setLessonNumber,
    setLessonName,
    setScopeAndSequenceId,
    setLearningGoals,
    setMasteryImage,
    setUploadedImageUrl,
    // Step 2
    setAnalysis,
    updateStrategyName,
    updateScenario,
    // Step 3
    setSlides,
    updateSlide,
    setSelectedSlide,
    // Step 4
    setTitle,
    setSlug,
    setMathConcept,
    setMathStandard,
    setIsPublic,
    // Status
    setLoading,
    setLoadingProgress,
    setError,
    reset,
    clearPersistedState,
  };
}

export type WizardStateHook = ReturnType<typeof useWizardState>;
