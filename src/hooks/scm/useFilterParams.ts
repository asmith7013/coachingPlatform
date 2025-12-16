import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Grade slug conversions
export const gradeToSlug = (grade: string): string => {
  if (!grade) return "";
  if (grade.startsWith("Grade ")) return grade.replace("Grade ", "");
  if (grade === "Algebra 1") return "algebra-1";
  return grade.toLowerCase().replace(/\s+/g, "-");
};

export const slugToGrade = (slug: string): string => {
  if (!slug) return "";
  if (/^\d+$/.test(slug)) return `Grade ${slug}`;
  if (slug === "algebra-1") return "Algebra 1";
  return slug;
};

// Unit slug conversions
export const unitToSlug = (unit: string): string => {
  if (!unit) return "";
  const match = unit.match(/(\d+)/);
  return match ? match[1] : unit;
};

export const slugToUnit = (slug: string, availableUnits: string[]): string => {
  if (!slug) return "";
  const matchingUnit = availableUnits.find(u => {
    const unitNum = u.match(/(\d+)/);
    return unitNum && unitNum[1] === slug;
  });
  return matchingUnit || "";
};

interface UseFilterParamsOptions {
  /** Available units for slug resolution (pass empty array if not loaded yet) */
  availableUnits?: string[];
}

interface UseFilterParamsReturn {
  /** Currently selected grade (full value, e.g., "Grade 6") */
  selectedGrade: string;
  /** Set grade directly without URL update */
  setSelectedGrade: (grade: string) => void;
  /** Currently selected unit (full value, e.g., "Unit 1") */
  selectedUnit: string;
  /** Set unit directly without URL update */
  setSelectedUnit: (unit: string) => void;
  /** Handle grade change - updates state and URL, clears unit */
  handleGradeChange: (newGrade: string) => void;
  /** Handle unit change - updates state and URL */
  handleUnitChange: (newUnit: string) => void;
}

/**
 * Hook for syncing grade/unit filter state with URL query parameters.
 *
 * URL format: ?grade=6&unit=1 or ?grade=algebra-1&unit=3
 *
 * @example
 * ```tsx
 * const { selectedGrade, selectedUnit, handleGradeChange, handleUnitChange } = useFilterParams({
 *   availableUnits: gradeGroups.flatMap(g => g.units),
 * });
 * ```
 */
export function useFilterParams({
  availableUnits = [],
}: UseFilterParamsOptions = {}): UseFilterParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL params
  const [selectedGrade, setSelectedGrade] = useState(() =>
    slugToGrade(searchParams.get("grade") || "")
  );
  const [selectedUnit, setSelectedUnit] = useState("");
  const [pendingUnitSlug, setPendingUnitSlug] = useState(() =>
    searchParams.get("unit") || ""
  );

  // Update URL when selections change
  const updateUrlParams = useCallback((grade: string, unit: string) => {
    const params = new URLSearchParams();
    if (grade) params.set("grade", gradeToSlug(grade));
    if (unit) params.set("unit", unitToSlug(unit));
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [router, pathname]);

  // Resolve pending unit slug once units are available
  useEffect(() => {
    if (pendingUnitSlug && availableUnits.length > 0 && !selectedUnit) {
      const resolvedUnit = slugToUnit(pendingUnitSlug, availableUnits);
      if (resolvedUnit) {
        setSelectedUnit(resolvedUnit);
      }
      setPendingUnitSlug("");
    }
  }, [pendingUnitSlug, availableUnits, selectedUnit]);

  // Handler for grade changes (clears unit)
  const handleGradeChange = useCallback((newGrade: string) => {
    setSelectedGrade(newGrade);
    setSelectedUnit("");
    updateUrlParams(newGrade, "");
  }, [updateUrlParams]);

  // Handler for unit changes
  const handleUnitChange = useCallback((newUnit: string) => {
    setSelectedUnit(newUnit);
    updateUrlParams(selectedGrade, newUnit);
  }, [selectedGrade, updateUrlParams]);

  return {
    selectedGrade,
    setSelectedGrade,
    selectedUnit,
    setSelectedUnit,
    handleGradeChange,
    handleUnitChange,
  };
}
