"use client";

import React from "react";
import { Card } from "@/components/composed/cards";
import { Text } from "@/components/core/typography/Text";
import { Heading } from "@/components/core/typography/Heading";
import { CoachingActionPlan } from "@zod-schema/core/cap";
import { SkeletonContainer } from "@/components/composed/feedback/SkeletonContainer";
import { CoachingActionPlanCard } from "@components/features/coaching/components/CoachingActionPlanCard";

interface CoachingActionPlansListProps {
  plans: CoachingActionPlan[];
  isLoading: boolean;
  error?: string;
  onEdit: (plan: CoachingActionPlan) => void;
  onDelete: (id: string) => void;
  onView?: (plan: CoachingActionPlan) => void;
  deletingIds?: string[];
}

export function CoachingActionPlansList({
  plans,
  isLoading,
  error,
  onEdit,
  onDelete,
  onView,
  deletingIds = [],
}: CoachingActionPlansListProps) {
  return (
    <SkeletonContainer
      isLoading={isLoading}
      error={error}
      skeleton={<CoachingActionPlanListSkeleton count={3} />}
      errorComponent={
        <Card>
          <Card.Body>
            <div className="text-center py-8">
              <Text color="danger">
                Error loading coaching action plans: {error}
              </Text>
            </div>
          </Card.Body>
        </Card>
      }
    >
      <Card>
        <Card.Header>
          <Heading level="h3">Existing Coaching Action Plans</Heading>
          <Text textSize="sm" color="muted">
            {plans.length} plan{plans.length !== 1 ? "s" : ""}
          </Text>
        </Card.Header>

        <Card.Body>
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <Text color="muted">
                No coaching action plans found. Create your first plan using the
                form above.
              </Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <CoachingActionPlanCard
                  key={plan._id}
                  plan={plan}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  isDeleting={deletingIds.includes(plan._id)}
                  disabled={deletingIds.length > 0}
                />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </SkeletonContainer>
  );
}

// Simple skeleton component for loading states
function CoachingActionPlanListSkeleton({ count }: { count: number }) {
  return (
    <Card>
      <Card.Header>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
