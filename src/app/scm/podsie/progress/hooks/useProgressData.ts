import { useState, useEffect } from "react";
import { fetchRampUpProgress } from "@/app/actions/313/podsie-sync";
import { ProgressData, LessonConfig } from "../types";

export function useProgressData(
  selectedSection: string,
  selectedUnit: number | null,
  lessons: LessonConfig[]
) {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      if (!selectedSection || selectedUnit === null || lessons.length === 0) {
        setProgressData([]);
        return;
      }

      try {
        setLoading(true);
        // Get the grade from the first lesson (all lessons in a unit share the same grade)
        const grade = lessons[0]?.grade || "8";
        const unitCode = `${grade}.${selectedUnit}`;
        const result = await fetchRampUpProgress(selectedSection, unitCode);

        if (result.success) {
          setProgressData(result.data);
        } else {
          setError(result.error || "Failed to load progress");
        }
      } catch (err) {
        console.error("Error loading progress:", err);
        setError("Failed to load progress");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [selectedSection, selectedUnit, lessons]);

  return { progressData, loading, error, setProgressData };
}
