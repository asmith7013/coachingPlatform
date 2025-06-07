"use client";

import React from 'react';
import { ActionPlanStage } from '../ActionPlanStage';
import { Textarea } from '@/components/core/fields/Textarea';
import { Input } from '@/components/core/fields/Input';
import { ReflectionSection } from '@/components/domain/coaching';

// Types for reflections
interface Reflection {
  question: string;
  response: string;
}

interface CoachingActionPlanStage4Props {
  // Goal completion state
  goalMet: boolean | null;
  onGoalMetChange: (goalMet: boolean) => void;
  
  // Reflection state
  impactOnLearning: string;
  onImpactOnLearningChange: (value: string) => void;
  
  // Planning state
  buildOnThis: string;
  onBuildOnThisChange: (value: string) => void;
  
  // Spotlight state
  spotlightLink: string;
  onSpotlightLinkChange: (value: string) => void;
  
  // Structured reflections (Tasks 5.5-5.6)
  reflections?: Reflection[];
  showSpotlightSuggestion?: boolean;
  
  // Optional props
  planId?: string;
  className?: string;
}

export function CoachingActionPlanStage4({
  goalMet,
  onGoalMetChange,
  impactOnLearning,
  onImpactOnLearningChange,
  buildOnThis,
  onBuildOnThisChange,
  spotlightLink,
  onSpotlightLinkChange,
  reflections = [],
  showSpotlightSuggestion = false,
  planId: _planId,
  className
}: CoachingActionPlanStage4Props) {
  return (
    <ActionPlanStage
      number={4}
      title="Analyze + Discuss"
      className={className}
    >
      <div className="space-y-4">
        <h3 className="font-semibold text-lg mb-2">Reflection</h3>
        
        {/* Task 5.1: Goal completion radio button selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Was the goal met?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="goalMet"
                checked={goalMet === true}
                onChange={() => onGoalMetChange(true)}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="goalMet"
                checked={goalMet === false}
                onChange={() => onGoalMetChange(false)}
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Task 5.2: Impact on learning reflection textarea */}
        <Textarea
          label="What impact did this goal have on student learning?"
          value={impactOnLearning}
          onChange={(e) => onImpactOnLearningChange(e.target.value)}
          rows={4}
          required
        />

        {/* Task 5.3: "Build on this" planning textarea */}
        <Textarea
          label="How can you build on this?"
          value={buildOnThis}
          onChange={(e) => onBuildOnThisChange(e.target.value)}
          rows={4}
          required
        />

        {/* Task 5.4: Teacher spotlight link management */}
        <Input
          label="Teacher Spotlight Slides"
          value={spotlightLink}
          onChange={(e) => onSpotlightLinkChange(e.target.value)}
          placeholder="Drive Link"
        />
      </div>
      
      {/* Tasks 5.5-5.7: Structured reflection questions interface */}
      <ReflectionSection
        reflections={reflections}
        showSpotlightSuggestion={showSpotlightSuggestion}
      />
    </ActionPlanStage>
  );
} 