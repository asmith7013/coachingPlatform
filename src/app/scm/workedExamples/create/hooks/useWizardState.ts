'use client';

import { useReducer, useCallback, useEffect, useState } from 'react';
import type { WizardState, WizardAction, WizardStep, ProblemAnalysis, StrategyDefinition, Scenario, LoadingProgress } from '../lib/types';
import { initialWizardState } from '../lib/types';
import { updateDeckSlides } from '@/app/actions/worked-examples';

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

    case 'SET_SECTION':
      return { ...state, section: action.payload };

    case 'SET_SCOPE_AND_SEQUENCE_ID':
      return { ...state, scopeAndSequenceId: action.payload };

    case 'SET_LEARNING_GOALS':
      return { ...state, learningGoals: action.payload };

    case 'SET_MASTERY_IMAGE':
      // When clearing the image (both null), also clear uploadedUrl to force re-upload
      const shouldClearUploadedUrl = action.payload.file === null && action.payload.preview === null;
      return {
        ...state,
        masteryCheckImage: {
          ...state.masteryCheckImage,
          file: action.payload.file,
          preview: action.payload.preview,
          // Clear uploadedUrl when image is cleared OR when a new file is set (to force re-upload)
          uploadedUrl: shouldClearUploadedUrl || action.payload.file !== null
            ? null
            : state.masteryCheckImage.uploadedUrl,
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

    case 'ADD_ADDITIONAL_IMAGE':
      return {
        ...state,
        additionalImages: [
          ...state.additionalImages,
          { file: action.payload.file, preview: action.payload.preview, uploadedUrl: null },
        ],
      };

    case 'REMOVE_ADDITIONAL_IMAGE':
      return {
        ...state,
        additionalImages: state.additionalImages.filter((_, i) => i !== action.payload),
      };

    case 'SET_ADDITIONAL_IMAGE_URL':
      return {
        ...state,
        additionalImages: state.additionalImages.map((img, i) =>
          i === action.payload.index ? { ...img, uploadedUrl: action.payload.url } : img
        ),
      };

    case 'SET_ADDITIONAL_CONTEXT':
      return { ...state, additionalContext: action.payload };

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

    case 'CLEAR_ANALYSIS':
      return {
        ...state,
        problemAnalysis: null,
        strategyDefinition: null,
        scenarios: null,
        slides: [],
        selectedSlideIndex: 0,
        title: '',
        slug: '',
        mathConcept: '',
        mathStandard: '',
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

    case 'UPDATE_BIG_IDEA':
      if (!state.strategyDefinition) return state;
      return {
        ...state,
        strategyDefinition: {
          ...state.strategyDefinition,
          bigIdea: action.payload,
        },
      };

    case 'UPDATE_STRATEGY_MOVES':
      if (!state.strategyDefinition) return state;
      return {
        ...state,
        strategyDefinition: {
          ...state.strategyDefinition,
          moves: action.payload,
        },
      };

    case 'UPDATE_SCENARIO':
      if (!state.scenarios) return state;
      const newScenarios = [...state.scenarios];
      newScenarios[action.payload.index] = action.payload.scenario;
      return { ...state, scenarios: newScenarios };

    case 'SET_EDIT_SLUG':
      return { ...state, editSlug: action.payload };

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

    case 'UPDATE_SLIDES_BATCH':
      const batchUpdatedSlides = [...state.slides];
      action.payload.forEach(({ index, htmlContent }) => {
        if (batchUpdatedSlides[index]) {
          batchUpdatedSlides[index] = {
            ...batchUpdatedSlides[index],
            htmlContent,
          };
        }
      });
      return { ...state, slides: batchUpdatedSlides };

    case 'SET_SELECTED_SLIDE':
      return { ...state, selectedSlideIndex: action.payload };

    case 'TOGGLE_SLIDE_TO_EDIT': {
      const idx = action.payload;
      // Remove from context if present
      const newContextSlides = state.contextSlides.filter(i => i !== idx);
      // Toggle in slidesToEdit
      const inEdit = state.slidesToEdit.includes(idx);
      const newSlidesToEdit = inEdit
        ? state.slidesToEdit.filter(i => i !== idx)
        : [...state.slidesToEdit, idx].sort((a, b) => a - b);
      return { ...state, slidesToEdit: newSlidesToEdit, contextSlides: newContextSlides };
    }

    case 'TOGGLE_CONTEXT_SLIDE': {
      const idx = action.payload;
      // Remove from edit if present
      const newSlidesToEdit = state.slidesToEdit.filter(i => i !== idx);
      // Toggle in contextSlides
      const inContext = state.contextSlides.includes(idx);
      const newContextSlides = inContext
        ? state.contextSlides.filter(i => i !== idx)
        : [...state.contextSlides, idx].sort((a, b) => a - b);
      return { ...state, slidesToEdit: newSlidesToEdit, contextSlides: newContextSlides };
    }

    case 'SET_SLIDE_SELECTION_MODE': {
      const { index, mode } = action.payload;
      if (mode === 'edit') {
        // Add to edit, remove from context
        const newSlidesToEdit = state.slidesToEdit.includes(index)
          ? state.slidesToEdit
          : [...state.slidesToEdit, index].sort((a, b) => a - b);
        const newContextSlides = state.contextSlides.filter(i => i !== index);
        return { ...state, slidesToEdit: newSlidesToEdit, contextSlides: newContextSlides };
      } else {
        // Add to context, remove from edit
        const newSlidesToEdit = state.slidesToEdit.filter(i => i !== index);
        const newContextSlides = state.contextSlides.includes(index)
          ? state.contextSlides
          : [...state.contextSlides, index].sort((a, b) => a - b);
        return { ...state, slidesToEdit: newSlidesToEdit, contextSlides: newContextSlides };
      }
    }

    case 'DESELECT_SLIDE': {
      const idx = action.payload;
      return {
        ...state,
        slidesToEdit: state.slidesToEdit.filter(i => i !== idx),
        contextSlides: state.contextSlides.filter(i => i !== idx),
      };
    }

    case 'CLEAR_SLIDE_SELECTIONS':
      return { ...state, slidesToEdit: [], contextSlides: [] };

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
function generateSlug(strategyName: string | undefined | null, gradeLevel: string | null): string {
  if (!strategyName) return '';

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
    // Clear file objects from additional images too
    if (parsed.additionalImages) {
      parsed.additionalImages = parsed.additionalImages.map((img: { file: File | null; preview: string | null; uploadedUrl: string | null }) => ({
        ...img,
        file: null,
      }));
    }

    // Type guard: ensure learningGoals contains only strings (filter out corrupted data)
    if (parsed.learningGoals && Array.isArray(parsed.learningGoals)) {
      parsed.learningGoals = parsed.learningGoals
        .map((g: unknown) => (typeof g === 'string' ? g : null))
        .filter((g: string | null): g is string => g !== null);
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
      // Clear file objects from additional images too
      additionalImages: state.additionalImages.map(img => ({
        ...img,
        file: null,
      })),
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

  // Save slides to database (for edit mode when editSlug is set)
  // Called explicitly after edits are applied, not automatically
  const saveSlidesToDatabase = useCallback(async (slides: WizardState['slides']) => {
    if (!state.editSlug || slides.length === 0) {
      return { success: false, error: 'No editSlug or slides' };
    }

    try {
      const result = await updateDeckSlides({
        slug: state.editSlug,
        htmlSlides: slides,
      });

      if (result.success) {
        console.log('[useWizardState] Saved slides to database');
      } else {
        console.error('[useWizardState] Save failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('[useWizardState] Save error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [state.editSlug]);

  // Load a saved session explicitly (called from SavedDrafts UI)
  const loadSession = useCallback((sessionId: string) => {
    const persisted = loadPersistedState(sessionId);
    if (!persisted) return false;

    // Restore ALL fields from the saved session
    if (persisted.gradeLevel) dispatch({ type: 'SET_GRADE_LEVEL', payload: persisted.gradeLevel });
    if (persisted.unitNumber) dispatch({ type: 'SET_UNIT_NUMBER', payload: persisted.unitNumber });
    if (persisted.lessonNumber) dispatch({ type: 'SET_LESSON_NUMBER', payload: persisted.lessonNumber });
    if (persisted.lessonName) dispatch({ type: 'SET_LESSON_NAME', payload: persisted.lessonName });
    if (persisted.section) dispatch({ type: 'SET_SECTION', payload: persisted.section });
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
    // - If all 7 slides exist (6 main + 1 printable), go straight to Step 3 (review slides)
    // - Otherwise, restore the saved step
    const EXPECTED_SLIDE_COUNT = 7;
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

  const setSection = useCallback((section: string | null) => {
    dispatch({ type: 'SET_SECTION', payload: section });
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

  const addAdditionalImage = useCallback((file: File, preview: string) => {
    dispatch({ type: 'ADD_ADDITIONAL_IMAGE', payload: { file, preview } });
  }, []);

  const removeAdditionalImage = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_ADDITIONAL_IMAGE', payload: index });
  }, []);

  const setAdditionalImageUrl = useCallback((index: number, url: string) => {
    dispatch({ type: 'SET_ADDITIONAL_IMAGE_URL', payload: { index, url } });
  }, []);

  const setAdditionalContext = useCallback((context: string) => {
    dispatch({ type: 'SET_ADDITIONAL_CONTEXT', payload: context });
  }, []);

  const setAnalysis = useCallback(
    (analysis: { problemAnalysis: ProblemAnalysis; strategyDefinition: StrategyDefinition; scenarios: Scenario[] }) => {
      dispatch({ type: 'SET_ANALYSIS', payload: analysis });
    },
    []
  );

  const clearAnalysis = useCallback(() => {
    dispatch({ type: 'CLEAR_ANALYSIS' });
  }, []);

  const updateStrategyName = useCallback((name: string) => {
    dispatch({ type: 'UPDATE_STRATEGY_NAME', payload: name });
  }, []);

  const updateBigIdea = useCallback((bigIdea: string) => {
    dispatch({ type: 'UPDATE_BIG_IDEA', payload: bigIdea });
  }, []);

  const updateStrategyMoves = useCallback(
    (moves: { verb: string; description: string; result: string }[]) => {
      dispatch({ type: 'UPDATE_STRATEGY_MOVES', payload: moves });
    },
    []
  );

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

  const updateSlidesBatch = useCallback((updates: { index: number; htmlContent: string }[]) => {
    dispatch({ type: 'UPDATE_SLIDES_BATCH', payload: updates });
  }, []);

  const setSelectedSlide = useCallback((index: number) => {
    dispatch({ type: 'SET_SELECTED_SLIDE', payload: index });
  }, []);

  const toggleSlideToEdit = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_SLIDE_TO_EDIT', payload: index });
  }, []);

  const toggleContextSlide = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_CONTEXT_SLIDE', payload: index });
  }, []);

  const setSlideSelectionMode = useCallback((index: number, mode: 'edit' | 'context') => {
    dispatch({ type: 'SET_SLIDE_SELECTION_MODE', payload: { index, mode } });
  }, []);

  const deselectSlide = useCallback((index: number) => {
    dispatch({ type: 'DESELECT_SLIDE', payload: index });
  }, []);

  const clearSlideSelections = useCallback(() => {
    dispatch({ type: 'CLEAR_SLIDE_SELECTIONS' });
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

  const setEditSlug = useCallback((editSlug: string | null) => {
    dispatch({ type: 'SET_EDIT_SLUG', payload: editSlug });
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
    setSection,
    setScopeAndSequenceId,
    setLearningGoals,
    setMasteryImage,
    setUploadedImageUrl,
    addAdditionalImage,
    removeAdditionalImage,
    setAdditionalImageUrl,
    setAdditionalContext,
    // Step 2
    setAnalysis,
    clearAnalysis,
    updateStrategyName,
    updateBigIdea,
    updateStrategyMoves,
    updateScenario,
    // Step 3
    setSlides,
    updateSlide,
    updateSlidesBatch,
    setSelectedSlide,
    toggleSlideToEdit,
    toggleContextSlide,
    setSlideSelectionMode,
    deselectSlide,
    clearSlideSelections,
    // Step 4
    setTitle,
    setSlug,
    setMathConcept,
    setMathStandard,
    setIsPublic,
    setEditSlug,
    // Status
    setLoading,
    setLoadingProgress,
    setError,
    reset,
    clearPersistedState,
    // Database save (for edit mode)
    saveSlidesToDatabase,
  };
}

export type WizardStateHook = ReturnType<typeof useWizardState>;
