/**
 * Hook for tracking the state of a Monday.com visit import process
 */
import { useState, useCallback } from "react";

// Define the SelectedItem type
export interface SelectedItem {
  id: string;
  name: string;
  date?: string;
  school?: string;
  coach?: string;
  [key: string]: unknown;
}

/**
 * Hook for tracking the state of a Monday.com visit import process
 *
 * This hook provides state management for the multi-step Monday.com import process.
 * It tracks the current import stage, the data being imported, and any missing fields.
 */
export function useMondayImport() {
  // State to track the current visit import process
  const [currentStage, setCurrentStage] = useState<
    "selection" | "completion" | "success" | "error"
  >("selection");
  const [currentVisitData, setCurrentVisitData] = useState<SelectedItem | null>(
    null,
  );
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Reset state
  const resetState = useCallback(() => {
    setCurrentStage("selection");
    setCurrentVisitData(null);
    setMissingFields([]);
    setSelectedItemId(null);
  }, []);

  return {
    currentStage,
    setCurrentStage,
    currentVisitData,
    setCurrentVisitData,
    missingFields,
    setMissingFields,
    selectedItemId,
    setSelectedItemId,
    resetState,
  };
}

export default useMondayImport;
