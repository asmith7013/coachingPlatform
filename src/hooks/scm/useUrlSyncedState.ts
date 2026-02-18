"use client";

import { useState, useCallback, useEffect } from "react";

/**
 * Batch URL updates to avoid race conditions when multiple hooks
 * update params in the same tick (mount restore or cascading changes).
 *
 * All pending updates are collected and applied in a single
 * history.replaceState call after the current microtask.
 */
let pendingUpdates: Record<string, string | null> = {};
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function batchUrlUpdate(key: string, slugValue: string | null) {
  pendingUpdates[key] = slugValue;
  if (batchTimer) clearTimeout(batchTimer);
  batchTimer = setTimeout(() => {
    const params = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(pendingUpdates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    pendingUpdates = {};
    batchTimer = null;
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}`,
    );
  }, 0);
}

interface UseUrlSyncedStateOptions {
  /** localStorage key (defaults to paramName) */
  storageKey?: string;
  /** Convert display value to URL slug */
  toSlug?: (value: string) => string;
  /** Convert URL slug to display value */
  fromSlug?: (slug: string) => string;
}

/**
 * Sync a single filter value with URL params and localStorage.
 *
 * Persistence pattern (copied from Podsie sandbox):
 * - URL params = source of truth (shareable)
 * - localStorage = fallback when no URL params (cross-session persistence)
 * - On load: URL -> if empty, localStorage -> sync to URL
 * - On change: update state + URL + localStorage
 *
 * Multiple hooks on the same page batch their URL updates to avoid
 * overwriting each other's params.
 *
 * @example
 * ```tsx
 * const [grade, setGrade] = useUrlSyncedState("ss", {
 *   storageKey: "scm-skills-grade",
 *   toSlug: gradeToSlug,
 *   fromSlug: slugToGrade,
 * });
 * ```
 */
export function useUrlSyncedState(
  paramName: string,
  options: UseUrlSyncedStateOptions = {},
): [string, (value: string) => void] {
  const { storageKey = paramName, toSlug, fromSlug } = options;

  // Initialize: URL -> localStorage -> empty (synchronous, no flash)
  const [value, setValueInternal] = useState(() => {
    if (typeof window === "undefined") return "";
    const urlParams = new URLSearchParams(window.location.search);
    const urlSlug = urlParams.get(paramName);
    if (urlSlug) {
      const decoded = fromSlug ? fromSlug(urlSlug) : urlSlug;
      localStorage.setItem(storageKey, decoded);
      return decoded;
    }
    return localStorage.getItem(storageKey) || "";
  });

  // On mount: if value came from localStorage (not URL), sync to URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(paramName)) return;
    if (!value) return;

    const slug = toSlug ? toSlug(value) : value;
    batchUrlUpdate(paramName, slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = useCallback(
    (newValue: string) => {
      setValueInternal(newValue);
      if (newValue) {
        const slug = toSlug ? toSlug(newValue) : newValue;
        localStorage.setItem(storageKey, newValue);
        batchUrlUpdate(paramName, slug);
      } else {
        localStorage.removeItem(storageKey);
        batchUrlUpdate(paramName, null);
      }
    },
    [paramName, storageKey, toSlug],
  );

  return [value, setValue];
}
