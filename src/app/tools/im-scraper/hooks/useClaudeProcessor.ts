import { useState, useCallback } from "react";
import {
  processSingleLesson,
  processBatchLessons,
} from "../actions/claude-processor";
import { ProcessedLesson, IMLesson } from "../lib/types";

export interface ClaudeProcessorState {
  processedLessons: ProcessedLesson[];
  isProcessing: boolean;
  error: string | null;
  lastBatchResponse: {
    totalRequested: number;
    totalSuccessful: number;
    totalFailed: number;
    startTime: string;
    endTime: string;
    duration: string;
  } | null;
  processingProgress: {
    current: number;
    total: number;
    currentLessonUrl?: string;
  } | null;
}

export interface ClaudeProcessorActions {
  processSingle: (
    htmlContent: string,
    lessonMetadata: {
      url: string;
      grade: string;
      unit: string;
      lesson: string;
      lessonNumber?: number;
    },
  ) => Promise<void>;
  processBatch: (lessons: IMLesson[]) => Promise<void>;
  processLessonsFromScraper: (scrapedLessons: IMLesson[]) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: ClaudeProcessorState = {
  processedLessons: [],
  isProcessing: false,
  error: null,
  lastBatchResponse: null,
  processingProgress: null,
};

/**
 * Hook for managing Claude processor state and operations
 * Mirrors the structure of useIMScraper for consistency
 */
export function useClaudeProcessor(): ClaudeProcessorState &
  ClaudeProcessorActions {
  const [state, setState] = useState<ClaudeProcessorState>(initialState);

  const setProcessing = useCallback((processing: boolean) => {
    setState((prev) => ({ ...prev, isProcessing: processing }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setProcessedLessons = useCallback(
    (
      lessons: ProcessedLesson[],
      batchResponse?: ClaudeProcessorState["lastBatchResponse"],
    ) => {
      setState((prev) => ({
        ...prev,
        processedLessons: lessons,
        lastBatchResponse: batchResponse || null,
      }));
    },
    [],
  );

  const setProgress = useCallback(
    (
      progress: {
        current: number;
        total: number;
        currentLessonUrl?: string;
      } | null,
    ) => {
      setState((prev) => ({ ...prev, processingProgress: progress }));
    },
    [],
  );

  const processSingle = useCallback(
    async (
      htmlContent: string,
      lessonMetadata: {
        url: string;
        grade: string;
        unit: string;
        lesson: string;
        lessonNumber?: number;
      },
    ) => {
      setProcessing(true);
      setError(null);
      setProgress({
        current: 1,
        total: 1,
        currentLessonUrl: lessonMetadata.url,
      });

      try {
        const response = await processSingleLesson({
          htmlContent,
          lessonMetadata,
        });

        if (response.success && response.data) {
          setProcessedLessons([response.data]);
        } else {
          setError(response.error || "Unknown error occurred");
          setProcessedLessons([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        setProcessedLessons([]);
      } finally {
        setProcessing(false);
        setProgress(null);
      }
    },
    [setProcessing, setError, setProcessedLessons, setProgress],
  );

  const processBatch = useCallback(
    async (lessons: IMLesson[]) => {
      // Filter lessons that have Claude export content
      const validLessons = lessons.filter(
        (lesson) =>
          lesson.success &&
          lesson.cooldown?.claudeExport?.studentTaskStatement_rawHtml,
      );

      if (validLessons.length === 0) {
        setError(
          "No lessons found with Claude export content. Make sure scraping was done with Claude Export enabled.",
        );
        return;
      }

      setProcessing(true);
      setError(null);
      setProgress({ current: 0, total: validLessons.length });

      try {
        // Transform IMLesson[] to the format expected by processBatchLessons
        const batchRequest = {
          lessons: validLessons.map((lesson) => ({
            htmlContent:
              lesson.cooldown!.claudeExport!.studentTaskStatement_rawHtml,
            lessonMetadata: {
              url: lesson.url,
              grade: lesson.grade,
              unit: lesson.unit,
              lesson: lesson.lesson,
              lessonNumber:
                typeof lesson.lesson === "string"
                  ? parseInt(lesson.lesson, 10)
                  : undefined,
            },
          })),
        };

        // Update progress as we process
        const updateProgress = (current: number, url?: string) => {
          setProgress({
            current,
            total: validLessons.length,
            currentLessonUrl: url,
          });
        };

        // Start processing
        updateProgress(0);

        const response = await processBatchLessons(batchRequest);

        if (response.success && response.data) {
          // Extract successful results
          const successfulResults = response.data.processedLessons
            .filter((result) => result.success && result.result)
            .map((result) => result.result!);

          setProcessedLessons(successfulResults, {
            totalRequested: response.data.totalRequested,
            totalSuccessful: response.data.totalSuccessful,
            totalFailed: response.data.totalFailed,
            startTime: response.data.startTime,
            endTime: response.data.endTime,
            duration: response.data.duration,
          });

          // Show error if some lessons failed
          if (response.data.totalFailed > 0) {
            const failedUrls = response.data.processedLessons
              .filter((result) => !result.success)
              .map((result) => result.lessonMetadata.url);
            setError(
              `Processing completed with ${response.data.totalFailed} failures: ${failedUrls.join(", ")}`,
            );
          }
        } else {
          setError(response.error || "Unknown error occurred");
          setProcessedLessons([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        setProcessedLessons([]);
      } finally {
        setProcessing(false);
        setProgress(null);
      }
    },
    [setProcessing, setError, setProcessedLessons, setProgress],
  );

  const processLessonsFromScraper = useCallback(
    async (scrapedLessons: IMLesson[]) => {
      await processBatch(scrapedLessons);
    },
    [processBatch],
  );

  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      processedLessons: [],
      lastBatchResponse: null,
      processingProgress: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    processSingle,
    processBatch,
    processLessonsFromScraper,
    clearResults,
    clearError,
    reset,
  };
}
