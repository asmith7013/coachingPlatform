import { useRef } from "react";
import type { HtmlSlide } from "@zod-schema/scm/worked-example";
import type {
  SSEStartEvent,
  SSESlideEvent,
  SSECompleteEvent,
  SSEErrorEvent,
} from "../types";
import type {
  ProblemAnalysis,
  StrategyDefinition,
  Scenario,
  WizardState,
  LoadingProgress,
} from "../../../lib/types";

export type GenerationMode = "full" | "continue";

interface UseSlideGenerationArgs {
  state: WizardState;
  problemAnalysis: ProblemAnalysis | null;
  strategyDefinition: StrategyDefinition | null;
  scenarios: Scenario[] | null;
  setSlides: (slides: HtmlSlide[]) => void;
  setLoadingProgress: (progress: LoadingProgress) => void;
  setError: (error: string | null) => void;
  nextStep: () => void;
}

/**
 * Get a descriptive name for each slide based on its position.
 * Dynamic slide structure based on number of strategy moves:
 * 1. Teacher Instructions
 * 2. Big Idea
 * 3. Problem Setup
 * 4 to 3+N. Step slides (with CFU + Answer) where N = numMoves
 * 3+N+1. Practice Problem 1
 * 3+N+2. Practice Problem 2
 * --- generated separately ---
 * 3+N+3. Printable worksheet
 * 3+N+4. Lesson Summary
 */
export function getSlideTypeName(slideNum: number, numMoves: number): string {
  if (slideNum === 1) return "Teacher Instructions";
  if (slideNum === 2) return "Big Idea";
  if (slideNum === 3) return "Problem Setup";
  if (slideNum >= 4 && slideNum <= 3 + numMoves) return `Step ${slideNum - 3}`;
  const afterSteps = slideNum - 3 - numMoves;
  if (afterSteps === 1) return "Practice 1";
  if (afterSteps === 2) return "Practice 2";
  if (afterSteps === 3) return "Print Page";
  if (afterSteps === 4) return "Lesson Summary";
  return `Slide ${slideNum}`;
}

export function useSlideGeneration({
  state,
  problemAnalysis,
  strategyDefinition,
  scenarios,
  setSlides,
  setLoadingProgress,
  setError,
  nextStep,
}: UseSlideGenerationArgs) {
  const accumulatedSlidesRef = useRef<HtmlSlide[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const MAX_AUTO_RETRIES = 3;

  // Handle SSE events
  const handleSSEEvent = (
    event: string,
    data: SSEStartEvent | SSESlideEvent | SSECompleteEvent | SSEErrorEvent,
    startTime: number,
    totalSlideCount: number, // Total slides including printable (for progress display)
    mode: GenerationMode,
    existingSlides: HtmlSlide[],
    numMoves: number,
  ) => {
    // For continue mode, we need to track existing slides for proper numbering
    const existingCount = mode === "continue" ? existingSlides.length : 0;

    switch (event) {
      case "start":
        // For continue mode, start with existing slides; for full mode, start fresh
        if (mode === "continue") {
          accumulatedSlidesRef.current = [...existingSlides];
        } else {
          accumulatedSlidesRef.current = [];
        }
        setLoadingProgress({
          phase: "generating",
          message:
            mode === "continue"
              ? "Resuming generation..."
              : "Connected to AI...",
          detail:
            mode === "continue"
              ? `Generating slides ${existingCount + 1}-${totalSlideCount}`
              : `Creating ${totalSlideCount} interactive slides`,
          startTime,
          slideProgress: {
            currentSlide: existingCount,
            estimatedTotal: totalSlideCount,
          },
        });
        break;

      case "slide": {
        const slideData = data as SSESlideEvent;

        // Incrementally save slide if provided (preserves progress on interruption)
        if (slideData.slide) {
          // Renumber the slide for continue mode (API returns 1-indexed new slides)
          const adjustedSlide =
            mode === "continue"
              ? {
                  ...slideData.slide,
                  slideNumber: existingCount + slideData.slideNumber,
                }
              : slideData.slide;
          accumulatedSlidesRef.current.push(adjustedSlide);
          setSlides([...accumulatedSlidesRef.current]);
        }

        // Adjust slide number display for continue mode
        const displaySlideNumber =
          mode === "continue"
            ? existingCount + slideData.slideNumber
            : slideData.slideNumber;

        setLoadingProgress({
          phase: "generating",
          message: `Creating ${getSlideTypeName(displaySlideNumber, numMoves)}...`,
          detail: slideData.message,
          startTime,
          slideProgress: {
            currentSlide: displaySlideNumber,
            estimatedTotal: totalSlideCount,
          },
        });
        break;
      }

      case "complete": {
        const completeData = data as SSECompleteEvent;
        if (completeData.success && completeData.slides) {
          // For continue mode, merge existing with new slides
          if (mode === "continue") {
            const newSlidesRenumbered = completeData.slides.map((slide, i) => ({
              ...slide,
              slideNumber: existingCount + i + 1,
            }));
            const mergedSlides = [...existingSlides, ...newSlidesRenumbered];
            setSlides(mergedSlides);
            accumulatedSlidesRef.current = mergedSlides;
          } else {
            // Full mode: use complete slides as final source of truth
            setSlides(completeData.slides);
            accumulatedSlidesRef.current = completeData.slides;
          }
          // NOTE: Don't call nextStep() here - the code after the SSE loop
          // handles generating the printable slide (9) and then calls nextStep()
        } else if (accumulatedSlidesRef.current.length > 0) {
          // Fallback: use accumulated slides if complete didn't include them
          // (printable generation will happen after SSE loop ends)
        } else {
          setError("Generation completed but no slides received");
        }
        break;
      }

      case "error": {
        const errorData = data as SSEErrorEvent;
        setError(errorData.message || "An error occurred during generation");
        break;
      }
    }
  };

  // Handle generating slides with SSE streaming
  const handleGenerateSlides = async (
    testMode = false,
    mode: GenerationMode = "full",
  ) => {
    if (!problemAnalysis || !strategyDefinition || !scenarios) {
      setError("Missing analysis data");
      return;
    }

    setError(null);
    const startTime = Date.now();
    // PPTX format: dynamic slide count based on strategy moves
    // 3 intro slides + N step slides + 2 practice slides = main slides
    // + Printable + Lesson Summary generated separately
    const numMoves = strategyDefinition.moves.length;
    const mainSlideCount = testMode ? 1 : 3 + numMoves + 2; // Slides generated by main SSE API
    const totalSlideCount = testMode ? 1 : mainSlideCount + 2; // +printable +lesson summary

    // For continue mode, use accumulated slides from ref (not state, which may be stale during retries)
    // accumulatedSlidesRef always has the most up-to-date slides
    const existingSlides =
      mode === "continue" ? accumulatedSlidesRef.current : [];
    const estimatedSlideCount =
      mode === "continue"
        ? Math.max(1, mainSlideCount - existingSlides.length)
        : mainSlideCount;

    const modeMessage =
      mode === "continue"
        ? `Continuing from slide ${existingSlides.length + 1}...`
        : "Starting slide generation...";

    setLoadingProgress({
      phase: "generating",
      message: testMode ? "Testing with 1 slide..." : modeMessage,
      detail: testMode
        ? "Quick test to verify streaming"
        : mode === "continue"
          ? `Generating ~${estimatedSlideCount} remaining slides`
          : `Creating ~${estimatedSlideCount} PPTX-compatible slides`,
      startTime,
    });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/scm/worked-examples/generate-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeLevel: state.gradeLevel || "8",
          unitNumber: state.unitNumber,
          lessonNumber: state.lessonNumber,
          learningGoals: state.learningGoals,
          problemAnalysis,
          strategyDefinition,
          scenarios,
          testMode,
          // Context-aware generation
          mode,
          existingSlides: mode === "continue" ? existingSlides : undefined,
          // For email notification
          slug: state.slug,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to start slide generation");
        return;
      }

      // Read the SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        setError("Failed to read response stream");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        let currentEvent = "";
        let currentData = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ")) {
            currentData = line.slice(6);

            // Process the event
            if (currentEvent && currentData) {
              try {
                const data = JSON.parse(currentData);
                handleSSEEvent(
                  currentEvent,
                  data,
                  startTime,
                  totalSlideCount,
                  mode,
                  existingSlides,
                  numMoves,
                );
              } catch (e) {
                console.warn("Failed to parse SSE data:", e);
              }
            }

            currentEvent = "";
            currentData = "";
          }
        }
      }

      // Stream ended - check if generation is complete
      const currentSlideCount = accumulatedSlidesRef.current.length;
      const expectedSlideCount = testMode ? 1 : mainSlideCount;

      if (currentSlideCount > 0) {
        setSlides([...accumulatedSlidesRef.current]);

        // Check if incomplete and should auto-retry
        if (
          currentSlideCount < expectedSlideCount &&
          retryCountRef.current < MAX_AUTO_RETRIES
        ) {
          retryCountRef.current += 1;
          console.log(
            `[generate-slides] Incomplete: ${currentSlideCount}/${expectedSlideCount}, auto-continuing (attempt ${retryCountRef.current}/${MAX_AUTO_RETRIES})...`,
          );

          setLoadingProgress({
            phase: "generating",
            message: `Resuming generation (attempt ${retryCountRef.current}/${MAX_AUTO_RETRIES})...`,
            detail: `Generated ${currentSlideCount}/${totalSlideCount} slides, continuing...`,
            startTime,
            slideProgress: {
              currentSlide: currentSlideCount,
              estimatedTotal: totalSlideCount,
            },
          });

          // Small delay before retrying to avoid hammering the API
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Recursively continue generation
          await handleGenerateSlides(testMode, "continue");
          return;
        }

        // Complete or max retries reached
        if (currentSlideCount < expectedSlideCount) {
          console.log(
            `[generate-slides] Max retries reached. Generated ${currentSlideCount}/${expectedSlideCount} slides.`,
          );
          // Show a warning to the user - they can manually continue in step 3
          setError(
            `Generated ${currentSlideCount} of ${expectedSlideCount} slides. You can continue generation from step 3 if needed.`,
          );
          retryCountRef.current = 0;
          setLoadingProgress({ phase: "idle", message: "" });
          nextStep();
          return;
        }

        // All main slides complete - now generate printable
        if (!testMode && scenarios) {
          console.log(
            "[generate-slides] Main slides complete, generating printable...",
          );
          setLoadingProgress({
            phase: "generating",
            message: "Creating Print Page...",
            detail: "Generating printable practice worksheet",
            startTime,
            slideProgress: {
              currentSlide: 7,
              estimatedTotal: 7,
            },
          });

          try {
            // Create AbortController for timeout (5 minutes)
            const printableAbortController = new AbortController();
            const printableTimeout = setTimeout(
              () => {
                printableAbortController.abort();
                console.warn(
                  "[generate-slides] Printable generation timed out after 5 minutes",
                );
              },
              5 * 60 * 1000,
            );

            console.log("[generate-slides] Calling printable API...");
            const printableResponse = await fetch(
              "/api/scm/worked-examples/generate-printable",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  practiceScenarios: scenarios.slice(1), // Practice scenarios only (indices 1 and 2)
                  strategyName: strategyDefinition?.name || "Strategy",
                  strategyMoves: strategyDefinition?.moves || [],
                  problemType: problemAnalysis?.problemType || "Math Problem",
                  gradeLevel: state.gradeLevel || "8",
                  unitNumber: state.unitNumber,
                  lessonNumber: state.lessonNumber,
                  learningGoals: state.learningGoals,
                }),
                signal: printableAbortController.signal,
              },
            );

            clearTimeout(printableTimeout);
            console.log(
              "[generate-slides] Printable API responded, status:",
              printableResponse.status,
            );

            if (!printableResponse.ok) {
              const errorText = await printableResponse.text();
              console.error(
                "[generate-slides] Printable API error response:",
                errorText,
              );
              setError(
                `Printable generation failed (${printableResponse.status}). You can regenerate from step 3.`,
              );
            } else {
              const printableData = await printableResponse.json();
              console.log(
                "[generate-slides] Printable data received, success:",
                printableData.success,
              );

              if (printableData.success && printableData.htmlContent) {
                const printableSlide: HtmlSlide = {
                  slideNumber: mainSlideCount + 1,
                  slideType: "printable-worksheet",
                  htmlContent: printableData.htmlContent,
                  visualType: "html",
                };
                accumulatedSlidesRef.current.push(printableSlide);
                setSlides([...accumulatedSlidesRef.current]);
                console.log(
                  "[generate-slides] Printable slide added successfully, total slides:",
                  accumulatedSlidesRef.current.length,
                );
              } else {
                console.warn(
                  "[generate-slides] Printable generation failed:",
                  printableData.error,
                );
                setError(
                  `Printable generation failed: ${printableData.error || "Unknown error"}. You can regenerate from step 3.`,
                );
              }
            }
          } catch (printableError) {
            if (
              printableError instanceof Error &&
              printableError.name === "AbortError"
            ) {
              console.error("[generate-slides] Printable generation timed out");
              setError(
                "Printable generation timed out. You can regenerate from step 3.",
              );
            } else {
              console.error(
                "[generate-slides] Printable generation error:",
                printableError,
              );
              setError(
                `Printable generation error: ${printableError instanceof Error ? printableError.message : "Unknown error"}. You can regenerate from step 3.`,
              );
            }
          }

          // Generate lesson summary (slide 10) after printable
          console.log("[generate-slides] Generating lesson summary...");
          setLoadingProgress({
            phase: "generating",
            message: "Creating Lesson Summary...",
            detail: "Generating printable lesson summary reference",
            startTime,
            slideProgress: {
              currentSlide: 8,
              estimatedTotal: 8,
            },
          });

          try {
            const summaryAbortController = new AbortController();
            const summaryTimeout = setTimeout(
              () => {
                summaryAbortController.abort();
                console.warn(
                  "[generate-slides] Lesson summary generation timed out after 3 minutes",
                );
              },
              3 * 60 * 1000,
            );

            console.log("[generate-slides] Calling lesson summary API...");
            const summaryResponse = await fetch(
              "/api/scm/worked-examples/generate-lesson-summary",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  strategyName: strategyDefinition?.name || "Strategy",
                  strategyMoves: strategyDefinition?.moves || [],
                  oneSentenceSummary:
                    strategyDefinition?.oneSentenceSummary || "",
                  bigIdea: strategyDefinition?.bigIdea || "",
                  problemType: problemAnalysis?.problemType || "Math Problem",
                  visualType: problemAnalysis?.visualType || "text-only",
                  svgSubtype: problemAnalysis?.svgSubtype,
                  workedExampleScenario: scenarios[0],
                  learningGoals: state.learningGoals,
                  gradeLevel: state.gradeLevel || "8",
                  unitNumber: state.unitNumber,
                  lessonNumber: state.lessonNumber,
                }),
                signal: summaryAbortController.signal,
              },
            );

            clearTimeout(summaryTimeout);
            console.log(
              "[generate-slides] Lesson summary API responded, status:",
              summaryResponse.status,
            );

            if (!summaryResponse.ok) {
              const errorText = await summaryResponse.text();
              console.error(
                "[generate-slides] Lesson summary API error response:",
                errorText,
              );
              // Non-fatal: summary is nice-to-have, don't block the flow
              console.warn(
                "[generate-slides] Lesson summary generation failed, continuing without it.",
              );
            } else {
              const summaryData = await summaryResponse.json();
              console.log(
                "[generate-slides] Lesson summary data received, success:",
                summaryData.success,
              );

              if (summaryData.success && summaryData.htmlContent) {
                const summarySlide: HtmlSlide = {
                  slideNumber: mainSlideCount + 2,
                  slideType: "lesson-summary",
                  htmlContent: summaryData.htmlContent,
                  visualType: "html",
                };
                accumulatedSlidesRef.current.push(summarySlide);
                setSlides([...accumulatedSlidesRef.current]);
                console.log(
                  "[generate-slides] Lesson summary slide added successfully, total slides:",
                  accumulatedSlidesRef.current.length,
                );
              } else {
                console.warn(
                  "[generate-slides] Lesson summary generation failed:",
                  summaryData.error,
                );
              }
            }
          } catch (summaryError) {
            // Non-fatal: lesson summary is supplementary
            if (
              summaryError instanceof Error &&
              summaryError.name === "AbortError"
            ) {
              console.error(
                "[generate-slides] Lesson summary generation timed out",
              );
            } else {
              console.error(
                "[generate-slides] Lesson summary generation error:",
                summaryError,
              );
            }
            console.warn(
              "[generate-slides] Continuing without lesson summary.",
            );
          }
        }

        retryCountRef.current = 0; // Reset for next generation
        setLoadingProgress({ phase: "idle", message: "" });
        nextStep();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Slide generation cancelled");
        setLoadingProgress({ phase: "idle", message: "" });
        return;
      }
      console.error("Error generating slides:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      abortControllerRef.current = null;
    }
  };

  return {
    handleGenerateSlides,
    accumulatedSlidesRef,
    abortControllerRef,
  };
}
