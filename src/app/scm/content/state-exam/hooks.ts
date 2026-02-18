import { useCallback } from "react";
import { DOMAIN_LABELS } from "./constants";

/**
 * Normalize standard for comparison
 * Handles: NY-8.G.1.a -> 8.G.1a, NY-8.EE.7a -> 8.EE.7a
 * Removes NY- prefix, CC prefix, and dots before single letter suffixes
 */
export function normalizeStandard(std: string): string {
  return std
    .replace(/^NY-/, "")
    .replace(/^CC\s*/, "")
    .replace(/\.([a-z])$/i, "$1"); // Remove dot before single letter suffix (8.G.1.a -> 8.G.1a)
}

/**
 * Hook that returns memoized standard normalization function
 */
export function useNormalizeStandard() {
  return useCallback((std: string) => normalizeStandard(std), []);
}

/**
 * Check if a question standard matches a filter standard
 * Handles exact matches and parent-child matches (e.g., 8.EE.7 matches 8.EE.7a)
 *
 * When the filter is a substandard (has letter suffix like 8.EE.7a), requires exact match.
 * When the filter is a parent standard (no letter suffix like 8.EE.7), matches all children.
 *
 * @param questionStd - The question's standard (e.g., "8.EE.7a")
 * @param filterStd - The filter standard (e.g., "8.EE.7" or "8.EE.7a")
 */
export function standardMatches(
  questionStd: string,
  filterStd: string,
): boolean {
  if (questionStd === filterStd) return true;

  // If filter is a substandard (ends with letter), require exact match only
  if (/[a-z]$/i.test(filterStd)) {
    return false;
  }

  // Filter is a parent standard - check if question is a child
  // e.g., "8.EE.7a" starts with "8.EE.7"
  if (
    questionStd.startsWith(filterStd) &&
    /^[a-z]$/i.test(questionStd.slice(filterStd.length))
  ) {
    return true;
  }
  return false;
}

/**
 * Hook that returns memoized standard matching function
 */
export function useStandardMatches() {
  return useCallback((questionStd: string, filterStd: string): boolean => {
    return standardMatches(questionStd, filterStd);
  }, []);
}

/**
 * Extract domain from a standard (e.g., "8.EE.7a" -> "EE")
 */
export function extractDomain(std: string): string {
  const normalized = normalizeStandard(std);
  // Pattern: grade.DOMAIN.rest (e.g., 8.EE.7a, 6.RP.3, 7.G.1)
  const match = normalized.match(/^\d+\.([A-Z]+)\./);
  return match ? match[1] : "Other";
}

/**
 * Hook that returns memoized domain extraction function
 */
export function useExtractDomain() {
  return useCallback((std: string): string => {
    return extractDomain(std);
  }, []);
}

/**
 * Strip letter suffix from standard (e.g., "8.G.1a" -> "8.G.1", "8.EE.7b" -> "8.EE.7")
 */
export function stripLetterSuffix(std: string): string {
  return std.replace(/[a-z]$/i, "");
}

/**
 * Hook that returns memoized letter suffix stripping function
 */
export function useStripLetterSuffix() {
  return useCallback((std: string): string => {
    return stripLetterSuffix(std);
  }, []);
}

/**
 * Get domain label from domain code
 */
export function getDomainLabel(domain: string): string {
  return DOMAIN_LABELS[domain] || domain;
}

/**
 * Numeric sort for standards (e.g., G.1, G.2, G.10 not G.1, G.10, G.2)
 */
export function numericStandardSort(
  a: { standard: string },
  b: { standard: string },
): number {
  const aMatch = a.standard.match(/\.(\d+)$/);
  const bMatch = b.standard.match(/\.(\d+)$/);
  const aNum = aMatch ? parseInt(aMatch[1], 10) : 0;
  const bNum = bMatch ? parseInt(bMatch[1], 10) : 0;
  return aNum - bNum;
}
