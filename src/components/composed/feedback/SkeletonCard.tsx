import React from "react";
import { Skeleton, SkeletonGroup } from "@/components/core/feedback/Skeleton";
import { Card } from "@/components/composed/cards";
import { paddingX, paddingY, radii } from "@/lib/tokens/tokens";
import { backgroundColors } from "@/lib/tokens/colors";

/**
 * Skeleton card component - replicates the exact pattern from ObservationsList
 * This captures the beautiful shimmer effect you discovered
 */
interface SkeletonCardProps {
  showHeader?: boolean;
  showActions?: boolean;
  lines?: number;
  className?: string;
  actionCount?: number;
}

export function SkeletonCard({
  showHeader = true,
  showActions = true,
  lines = 3,
  className,
  actionCount = 2,
}: SkeletonCardProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <Card.Header>
          <Skeleton height="lg" width="1/3" className="mb-2" />
          <Skeleton height="sm" width="1/4" />
        </Card.Header>
      )}

      <Card.Body>
        <SkeletonGroup spacing="base">
          {Array.from({ length: lines }, (_, i) => (
            <Skeleton
              key={i}
              height="base"
              width={i === lines - 1 ? "2/3" : "full"}
            />
          ))}
        </SkeletonGroup>

        {showActions && (
          <div className={`flex gap-2 ${paddingY.md}`}>
            {Array.from({ length: actionCount }, (_, i) => (
              <Skeleton key={i} height="xl" width="sm" />
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

/**
 * Skeleton pattern that exactly matches your ObservationsList loading state
 * This replicates the beautiful effect you found
 */
export function ObservationSkeleton() {
  return (
    <div
      className={`border ${radii.lg} ${paddingX.md} ${paddingY.md} animate-pulse`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton height="lg" width="1/3" className="mb-2" />
          <SkeletonGroup spacing="sm">
            <Skeleton height="base" width="1/4" />
            <Skeleton height="base" width="1/6" />
          </SkeletonGroup>
        </div>
        <div className="flex gap-2">
          <Skeleton height="xl" width="sm" />
          <Skeleton height="xl" width="sm" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table skeleton for tabular data
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <div className={`border ${radii.lg} overflow-hidden`}>
      {showHeader && (
        <div
          className={`${backgroundColors.light.muted} ${paddingX.lg} ${paddingY.lg} border-b`}
        >
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }, (_, i) => (
              <Skeleton key={i} height="base" width="3/4" />
            ))}
          </div>
        </div>
      )}

      <div className="divide-y">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className={`${paddingX.lg} ${paddingY.md}`}>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }, (_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  height="base"
                  width={colIndex === 0 ? "full" : "2/3"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form skeleton for form loading states
 */
interface FormSkeletonProps {
  fields?: number;
  showSubmitButton?: boolean;
}

export function FormSkeleton({
  fields = 6,
  showSubmitButton = true,
}: FormSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height="base" width="1/4" />
          <Skeleton height="xl" width="full" />
        </div>
      ))}

      {showSubmitButton && (
        <div className={`flex justify-end gap-2 ${paddingY.md} border-t`}>
          <Skeleton height="xl" width="lg" />
          <Skeleton height="xl" width="lg" />
        </div>
      )}
    </div>
  );
}
