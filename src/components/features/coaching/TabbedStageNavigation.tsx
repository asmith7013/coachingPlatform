"use client";

import React from "react";
import { cn } from "@ui/utils/formatters";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { tv } from "tailwind-variants";
import { spaceBetween, iconSizes, flex } from "@/lib/tokens/tokens";

// Stage information interface matching existing patterns
interface StageInfo {
  number: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  isComplete: boolean;
  isValid: boolean; // Validation state for stage
  hasWarnings?: boolean; // For partial completeness
}

// Props interface for the tabbed navigation
interface TabbedStageNavigationProps {
  stages: StageInfo[];
  currentStage: number;
  onStageChange: (stageNumber: number) => void;
  disabled?: boolean;
  className?: string;
}

// Create styles using tailwind-variants following established patterns
const navigation = tv({
  slots: {
    container: "border-b border-gray-200 bg-white",
    tabList: ["flex px-6", spaceBetween.x.xl],
    tab: [
      "relative py-4 px-1 border-b-2 font-medium text-sm transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ],
    tabInactive:
      "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
    tabActive: "border-primary text-primary",
    tabContent: ["flex items-center", spaceBetween.x.sm],
    stageNumber: [
      "flex items-center justify-center rounded-full text-xs font-semibold",
      iconSizes.lg,
      "transition-colors",
    ],
    stageNumberInactive: "bg-gray-100 text-gray-500",
    stageNumberActive: "bg-primary text-white",
    stageNumberComplete: "bg-success text-white",
    stageNumberWarning: "bg-warning text-white",
    stageTitle: "font-medium",
    stageDescription: "text-xs text-gray-500 max-w-24 truncate",
    statusIcon: [iconSizes.sm, flex.shrink],
    statusIconComplete: "text-success",
    statusIconWarning: "text-warning",
  },
});

export function TabbedStageNavigation({
  stages,
  currentStage,
  onStageChange,
  disabled = false,
  className,
}: TabbedStageNavigationProps) {
  const styles = navigation();

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, stageNumber: number) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onStageChange(stageNumber);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const currentIndex = stages.findIndex(
        (stage) => stage.number === currentStage,
      );
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = currentIndex + direction;

      if (nextIndex >= 0 && nextIndex < stages.length) {
        onStageChange(stages[nextIndex].number);
      }
    }
  };

  const renderStageIcon = (stage: StageInfo) => {
    if (stage.isComplete) {
      return (
        <CheckCircleIcon
          className={cn(styles.statusIcon(), styles.statusIconComplete())}
          aria-hidden="true"
        />
      );
    }

    if (stage.hasWarnings) {
      return (
        <ExclamationTriangleIcon
          className={cn(styles.statusIcon(), styles.statusIconWarning())}
          aria-hidden="true"
        />
      );
    }

    return null;
  };

  const getStageNumberStyle = (stage: StageInfo, isActive: boolean) => {
    if (stage.isComplete) {
      return styles.stageNumberComplete();
    }

    if (stage.hasWarnings) {
      return styles.stageNumberWarning();
    }

    if (isActive) {
      return styles.stageNumberActive();
    }

    return styles.stageNumberInactive();
  };

  return (
    <nav
      className={cn(styles.container(), className)}
      aria-label="Stage navigation"
    >
      <div className={styles.tabList()} role="tablist">
        {stages.map((stage) => {
          const isActive = stage.number === currentStage;

          return (
            <button
              key={stage.number}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              aria-controls={`stage-panel-${stage.number}`}
              disabled={disabled}
              className={cn(
                styles.tab(),
                isActive ? styles.tabActive() : styles.tabInactive(),
              )}
              onClick={() => !disabled && onStageChange(stage.number)}
              onKeyDown={(e) => handleKeyDown(e, stage.number)}
            >
              <div className={styles.tabContent()}>
                {/* Stage number circle */}
                <div
                  className={cn(
                    styles.stageNumber(),
                    getStageNumberStyle(stage, isActive),
                  )}
                >
                  {stage.number}
                </div>

                {/* Stage content */}
                <div className="text-left">
                  <div className={styles.stageTitle()}>{stage.title}</div>
                  <div className={styles.stageDescription()}>
                    {stage.description}
                  </div>
                </div>

                {/* Status icon */}
                {renderStageIcon(stage)}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Export default stage configuration for convenience
export const defaultStageConfiguration: Omit<
  StageInfo,
  "isComplete" | "isValid"
>[] = [
  {
    number: 1,
    title: "Needs & Focus",
    description: "IPG focus and rationale",
  },
  {
    number: 2,
    title: "Goals & Metrics",
    description: "SMART goals and outcomes",
  },
  {
    number: 3,
    title: "Implementation",
    description: "Weekly plans and records",
  },
  {
    number: 4,
    title: "Analysis",
    description: "End-of-cycle reflection",
  },
] as const;
