import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Scope sequence tag slug conversions (curriculum)
export const scopeTagToSlug = (tag: string): string => {
  if (!tag) return "";
  if (tag === "Grade 6") return "g6";
  if (tag === "Grade 7") return "g7";
  if (tag === "Grade 8") return "g8";
  if (tag === "Algebra 1") return "alg-1";
  return tag.toLowerCase().replace(/\s+/g, "-");
};

export const slugToScopeTag = (slug: string): string => {
  if (!slug) return "";
  if (slug === "g6") return "Grade 6";
  if (slug === "g7") return "Grade 7";
  if (slug === "g8") return "Grade 8";
  if (slug === "alg-1") return "Algebra 1";
  return slug;
};

// Grade (content level within curriculum) slug conversions
// Uses just the number: "6", "7", "8" for grades, "alg-1" for Algebra 1
export const gradeToSlug = (grade: string): string => {
  if (!grade) return "";
  // Handle "Grade X" format -> just the number
  if (grade.startsWith("Grade ")) return grade.replace("Grade ", "");
  // Handle number-only format -> return as-is
  if (/^\d+$/.test(grade)) return grade;
  // Handle "Algebra 1"
  if (grade === "Algebra 1") return "alg-1";
  return grade.toLowerCase().replace(/\s+/g, "-");
};

export const slugToGrade = (slug: string): string => {
  if (!slug) return "";
  // Handle "alg-1" -> "Algebra 1"
  if (slug === "alg-1") return "Algebra 1";
  // Legacy: "algebra-1" format
  if (slug === "algebra-1") return "Algebra 1";
  // Number-only slug -> return as-is (for grade within curriculum)
  if (/^\d+$/.test(slug)) return slug;
  return slug;
};

// Generic "Grade X" slug conversions (works for any grade number)
// "Grade 3" <-> "g3", "Grade 8" <-> "g8", "Algebra 1" <-> "alg-1"
export const simpleGradeToSlug = (grade: string): string => {
  if (!grade) return "";
  if (grade === "Algebra 1") return "alg-1";
  const match = grade.match(/Grade\s+(\d+)/);
  if (match) return `g${match[1]}`;
  return grade.toLowerCase().replace(/\s+/g, "-");
};

export const slugToSimpleGrade = (slug: string): string => {
  if (!slug) return "";
  if (slug === "alg-1") return "Algebra 1";
  const match = slug.match(/^g(\d+)$/);
  if (match) return `Grade ${match[1]}`;
  return slug;
};

// Full Illustrative Math grade string slug conversions
// Maps "Illustrative Math New York - 8th Grade" <-> "g8"
const FULL_GRADE_TO_SLUG: Record<string, string> = {
  "Illustrative Math New York - 4th Grade": "g4",
  "Illustrative Math New York - 5th Grade": "g5",
  "Illustrative Math New York - 6th Grade": "g6",
  "Illustrative Math New York - 7th Grade": "g7",
  "Illustrative Math New York - 8th Grade": "g8",
  "Illustrative Math New York - Algebra 1": "alg-1",
};

const SLUG_TO_FULL_GRADE: Record<string, string> = Object.fromEntries(
  Object.entries(FULL_GRADE_TO_SLUG).map(([k, v]) => [v, k]),
);

export const fullGradeToSlug = (fullGrade: string): string => {
  if (!fullGrade) return "";
  return FULL_GRADE_TO_SLUG[fullGrade] || fullGrade;
};

export const slugToFullGrade = (slug: string): string => {
  if (!slug) return "";
  return SLUG_TO_FULL_GRADE[slug] || slug;
};

// Unit slug conversions
export const unitToSlug = (unit: string): string => {
  if (!unit) return "";
  const match = unit.match(/(\d+)/);
  return match ? match[1] : unit;
};

export const slugToUnit = (slug: string, availableUnits: string[]): string => {
  if (!slug) return "";
  const matchingUnit = availableUnits.find((u) => {
    const unitNum = u.match(/(\d+)/);
    return unitNum && unitNum[1] === slug;
  });
  return matchingUnit || "";
};

interface UseFilterParamsOptions {
  /** Available units for slug resolution (pass empty array if not loaded yet) */
  availableUnits?: string[];
  /** Available grades within the selected scope sequence */
  availableGrades?: string[];
}

interface UseFilterParamsReturn {
  /** Currently selected scope sequence tag (full value, e.g., "Algebra 1") */
  selectedScopeTag: string;
  /** Alias for selectedScopeTag for backwards compatibility */
  selectedGrade: string;
  /** Set scope tag directly without URL update */
  setSelectedScopeTag: (tag: string) => void;
  /** Currently selected grade within the curriculum (e.g., "8" for Grade 8 content) */
  selectedGradeWithin: string;
  /** Set grade within directly without URL update */
  setSelectedGradeWithin: (grade: string) => void;
  /** Currently selected unit (full value, e.g., "Unit 1") */
  selectedUnit: string;
  /** Set unit directly without URL update */
  setSelectedUnit: (unit: string) => void;
  /** Handle scope tag change - updates state and URL, clears grade and unit */
  handleScopeTagChange: (newTag: string) => void;
  /** Alias for handleScopeTagChange for backwards compatibility */
  handleGradeChange: (newTag: string) => void;
  /** Handle grade within change - updates state and URL, clears unit */
  handleGradeWithinChange: (newGrade: string) => void;
  /** Handle unit change - updates state and URL */
  handleUnitChange: (newUnit: string, gradeWithin?: string) => void;
}

/**
 * Hook for syncing scope sequence, grade, and unit filter state with URL query parameters.
 *
 * URL format: ?ss=alg-1&g=8&unit=4
 * - ss: scope sequence tag (curriculum) - "g6", "g7", "g8", "alg-1"
 * - g: grade within that curriculum - "6", "7", "8", "alg-1"
 * - unit: unit number - "1", "2", etc.
 *
 * @example
 * ```tsx
 * const { selectedScopeTag, selectedGradeWithin, selectedUnit, handleScopeTagChange, handleUnitChange } = useFilterParams({
 *   availableUnits: gradeGroups.flatMap(g => g.units),
 *   availableGrades: gradeGroups.map(g => g.grade),
 * });
 * ```
 */
export function useFilterParams({
  availableUnits = [],
  availableGrades: _availableGrades = [],
}: UseFilterParamsOptions = {}): UseFilterParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL params
  // URL format: ?ss=alg-1&g=8&unit=4
  // ss = scope sequence tag (curriculum selected by "Filter by Curriculum")
  // g = grade within that curriculum (determined by unit selection)
  const [selectedScopeTag, setSelectedScopeTag] = useState(() => {
    const ssParam = searchParams.get("ss");
    const legacyGrade = searchParams.get("grade");
    if (ssParam) return slugToScopeTag(ssParam);
    if (legacyGrade) return slugToGrade(legacyGrade);
    return "";
  });

  const [selectedGradeWithin, setSelectedGradeWithin] = useState(() => {
    const gParam = searchParams.get("g");
    return gParam || "";
  });

  const [selectedUnit, setSelectedUnit] = useState("");
  const [pendingUnitSlug, setPendingUnitSlug] = useState(
    () => searchParams.get("unit") || "",
  );

  // Update URL when selections change
  const updateUrlParams = useCallback(
    (scopeTag: string, gradeWithin: string, unit: string) => {
      const params = new URLSearchParams();
      if (scopeTag) params.set("ss", scopeTagToSlug(scopeTag));
      if (gradeWithin) params.set("g", gradeToSlug(gradeWithin));
      if (unit) params.set("unit", unitToSlug(unit));
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [router, pathname],
  );

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

  // Handler for scope tag changes (clears grade and unit)
  const handleScopeTagChange = useCallback(
    (newTag: string) => {
      setSelectedScopeTag(newTag);
      setSelectedGradeWithin("");
      setSelectedUnit("");
      updateUrlParams(newTag, "", "");
    },
    [updateUrlParams],
  );

  // Handler for grade within changes (clears unit)
  const handleGradeWithinChange = useCallback(
    (newGrade: string) => {
      setSelectedGradeWithin(newGrade);
      setSelectedUnit("");
      updateUrlParams(selectedScopeTag, newGrade, "");
    },
    [selectedScopeTag, updateUrlParams],
  );

  // Handler for unit changes (optionally update grade within if provided)
  const handleUnitChange = useCallback(
    (newUnit: string, gradeWithin?: string) => {
      const newGradeWithin = gradeWithin ?? selectedGradeWithin;
      if (gradeWithin) {
        setSelectedGradeWithin(gradeWithin);
      }
      setSelectedUnit(newUnit);
      updateUrlParams(selectedScopeTag, newGradeWithin, newUnit);
    },
    [selectedScopeTag, selectedGradeWithin, updateUrlParams],
  );

  return {
    selectedScopeTag,
    selectedGrade: selectedScopeTag, // Backwards compatibility alias
    setSelectedScopeTag,
    selectedGradeWithin,
    setSelectedGradeWithin,
    selectedUnit,
    setSelectedUnit,
    handleScopeTagChange,
    handleGradeChange: handleScopeTagChange, // Backwards compatibility alias
    handleGradeWithinChange,
    handleUnitChange,
  };
}
