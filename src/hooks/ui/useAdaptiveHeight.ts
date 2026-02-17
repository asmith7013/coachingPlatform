// src/hooks/ui/useAdaptiveHeight.ts
"use client";

import { useState, useEffect, useMemo } from "react";

interface ContentMetrics {
  teacherCount: number;
  periodCount: number;
  hasTeacherSchedules: boolean;
  hasActiveAssignments: boolean;
  accountabilityVariant: "default" | "compact";
}

interface UseAdaptiveHeightOptions {
  minHeight?: number;
  maxHeight?: number;
  defaultHeight?: number;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  contentMetrics?: ContentMetrics;
}

export function useAdaptiveHeight(options: UseAdaptiveHeightOptions = {}) {
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    function handleResize() {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    }

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const adaptiveHeight = useMemo(() => {
    if (!windowHeight || !windowWidth) return options.defaultHeight || 600;

    const {
      minHeight = 400,
      maxHeight = windowHeight * 0.9,
      breakpoints = {
        sm: 400,
        md: 600,
        lg: 800,
        xl: 1000,
      },
      contentMetrics,
    } = options;

    // Calculate responsive height based on breakpoints
    let baseHeight: number;
    if (windowWidth < 768) {
      baseHeight = breakpoints.sm || 400;
    } else if (windowWidth < 1024) {
      baseHeight = breakpoints.md || 600;
    } else if (windowWidth < 1280) {
      baseHeight = breakpoints.lg || 800;
    } else {
      baseHeight = breakpoints.xl || 1000;
    }

    // Adjust for content if provided
    if (contentMetrics) {
      const contentHeight = calculateContentBasedHeight(contentMetrics);
      baseHeight = Math.max(baseHeight, contentHeight.recommended);
    }

    return Math.max(minHeight, Math.min(maxHeight, baseHeight));
  }, [windowHeight, windowWidth, options]);

  const contentAnalysis = useMemo(() => {
    if (!options.contentMetrics) return null;
    return calculateContentBasedHeight(options.contentMetrics);
  }, [options.contentMetrics]);

  return {
    height: adaptiveHeight,
    windowHeight,
    windowWidth,
    isSmall: windowWidth < 768,
    isMedium: windowWidth >= 768 && windowWidth < 1024,
    isLarge: windowWidth >= 1024,
    contentAnalysis,
  };
}

function calculateContentBasedHeight(content: ContentMetrics) {
  const {
    teacherCount,
    periodCount,
    hasTeacherSchedules,
    hasActiveAssignments,
    accountabilityVariant,
  } = content;

  let estimatedHeight = 0;

  // Base header and controls
  estimatedHeight += 120;

  // Statistics grid
  estimatedHeight += 100;

  // Accountability panel
  if (accountabilityVariant === "compact") {
    estimatedHeight += 80;
  } else {
    estimatedHeight += Math.min(40 + teacherCount * 45, 300);
  }

  // Teacher schedule calendar
  if (hasTeacherSchedules) {
    estimatedHeight += 300;
  }

  // Main schedule grid
  const gridHeight = Math.max(300, periodCount * 80 + 100);
  estimatedHeight += gridHeight;

  // Assignment summary
  if (hasActiveAssignments) {
    estimatedHeight += 100;
  }

  // Instructions and buffer
  estimatedHeight += 170;

  return {
    estimated: estimatedHeight,
    minimum: 400,
    recommended: Math.max(400, estimatedHeight),
    components: {
      accountability:
        accountabilityVariant === "compact"
          ? 80
          : Math.min(40 + teacherCount * 45, 300),
      scheduleGrid: gridHeight,
      teacherCalendar: hasTeacherSchedules ? 300 : 0,
    },
  };
}
