import { useState } from "react";
import { useElapsedTime } from "../../../hooks/useElapsedTime";
import { fileToBase64, revokeImagePreviews } from "../../../lib/utils";
import type {
  EditImage,
  ProblemAnalysis,
  StrategyDefinition,
  Scenario,
} from "../../../lib/types";

interface UseAiEditArgs {
  problemAnalysis: ProblemAnalysis | null;
  strategyDefinition: StrategyDefinition | null;
  scenarios: Scenario[] | null;
  setAnalysis: (analysis: {
    problemAnalysis: ProblemAnalysis;
    strategyDefinition: StrategyDefinition;
    scenarios: Scenario[];
  }) => void;
}

export function useAiEdit({
  problemAnalysis,
  strategyDefinition,
  scenarios,
  setAnalysis,
}: UseAiEditArgs) {
  const [aiEditPrompt, setAiEditPrompt] = useState("");
  const [aiEditImages, setAiEditImages] = useState<EditImage[]>([]);
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);

  // Track elapsed time during AI editing
  const { elapsed: aiEditElapsed, start: startAiEditTimer } =
    useElapsedTime(isAiEditing);

  // Handle AI edit of analysis
  const handleAiEdit = async () => {
    // Need either prompt text or images
    const hasPrompt = aiEditPrompt.trim();
    const hasImages = aiEditImages.length > 0;
    if (
      (!hasPrompt && !hasImages) ||
      !problemAnalysis ||
      !strategyDefinition ||
      !scenarios
    )
      return;

    setIsAiEditing(true);
    startAiEditTimer();
    setAiEditError(null);

    try {
      // Convert images to base64
      const imageDataUrls = await Promise.all(
        aiEditImages.map((img) => fileToBase64(img.file)),
      );

      const response = await fetch("/api/scm/worked-examples/edit-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editInstructions: aiEditPrompt,
          images: imageDataUrls,
          problemAnalysis,
          strategyDefinition,
          scenarios,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAiEditError(data.error || "Failed to edit analysis");
        return;
      }

      if (data.success) {
        // Update state with edited analysis using setAnalysis
        setAnalysis({
          problemAnalysis: data.problemAnalysis || problemAnalysis,
          strategyDefinition: data.strategyDefinition || strategyDefinition,
          scenarios: data.scenarios || scenarios,
        });
        // Clear prompt and images on success
        setAiEditPrompt("");
        revokeImagePreviews(aiEditImages);
        setAiEditImages([]);
      }
    } catch (error) {
      setAiEditError(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setIsAiEditing(false);
    }
  };

  return {
    aiEditPrompt,
    setAiEditPrompt,
    aiEditImages,
    setAiEditImages,
    aiEditError,
    aiEditElapsed,
    isAiEditing,
    handleAiEdit,
  };
}
