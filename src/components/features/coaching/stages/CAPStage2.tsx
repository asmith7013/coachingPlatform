"use client";

import React from 'react';
import { ActionPlanStage } from '../ActionPlanStage';
import { Textarea } from '@/components/core/fields/Textarea';
import { MetricsBuilder, CoachingMovesBuilder } from '@/components/domain/coaching';

// Interface for metrics following the example pattern
interface MetricType {
  name: string;
  type: 'IPG' | 'L&R' | 'Project' | 'Other';
  ratings: { score: number; description: string }[];
}

// Interface for coaching moves
interface CoachingMoveType {
  category: string;
  specificMove: string;
  toolsResources: string;
}

interface CoachingActionPlanStage2Props {
  // SMART goal state
  smartGoal: string;
  onSmartGoalChange: (value: string) => void;
  
  // Metrics state  
  metrics: MetricType[];
  onMetricsChange: (metrics: MetricType[]) => void;
  
  // Coaching moves state
  coachingMoves: CoachingMoveType[];
  onCoachingMovesChange: (moves: CoachingMoveType[]) => void;
  
  // Optional props
  planId?: string;
  className?: string;
}

export function CoachingActionPlanStage2({
  smartGoal,
  onSmartGoalChange,
  metrics,
  onMetricsChange,
  coachingMoves,
  onCoachingMovesChange,
  planId: _planId,
  className
}: CoachingActionPlanStage2Props) {
  return (
    <ActionPlanStage
      number={2}
      title="Set Goals"
      className={className}
    >
      <div className="space-y-6">
        {/* SMART Goal Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2">SMART Goal Set</h3>
          <Textarea
            label="By the end of the coaching cycle..."
            value={smartGoal}
            onChange={(e) => onSmartGoalChange(e.target.value)}
            placeholder="the teacher will... As a result... This will be evidenced by..."
            rows={4}
            required
          />
        </div>

        {/* Metrics Builder Section */}
        <MetricsBuilder
          metrics={metrics}
          onMetricsChange={onMetricsChange}
        />
        
        {/* Coaching Moves Builder Section */}
        <CoachingMovesBuilder
          moves={coachingMoves}
          onMovesChange={onCoachingMovesChange}
        />
      </div>
    </ActionPlanStage>
  );
} 