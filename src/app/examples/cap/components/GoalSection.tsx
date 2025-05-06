import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@ui/utils/formatters';
import { Card } from '@/components/composed/cards/Card';
import { textColors } from '@/lib/tokens';

interface GoalSectionProps {
  goalText: string;
  className?: string;
}

/**
 * StickyGoalCorner - Condensed goal that appears in corner when scrolled past
 */
const StickyGoalCorner = ({ goalText }: { goalText: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect on mount
  useEffect(() => {
    // Small delay to trigger the transition effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={cn(
        "fixed top-4 right-4 max-w-xs z-50 transition-all duration-300",
        isVisible 
          ? "transform translate-y-0 opacity-100" 
          : "transform -translate-y-4 opacity-0"
      )}
    >
      <Card className="p-3 border-2 border-secondary shadow-md">
        <div className="flex items-start gap-2">
          <span className={cn("mt-1 flex-shrink-0", textColors.secondary)}>🎯</span>
          <div>
            <h4 className="font-semibold text-sm text-gray-800 mb-1">Goal Set:</h4>
            <p className="text-xs text-gray-700 line-clamp-3">{goalText}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * GoalSection - Component that shows goal and handles sticky behavior on scroll
 */
export const GoalSection: React.FC<GoalSectionProps> = ({ 
  goalText,
  className
}) => {
  const [showStickyGoal, setShowStickyGoal] = useState(false);
  const goalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!goalRef.current) return;
      
      const rect = goalRef.current.getBoundingClientRect();
      // Show sticky goal when the original goal is scrolled out of view
      setShowStickyGoal(rect.bottom < 0);
    };

    // Run once on mount to check initial position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Original goal section */}
      <div ref={goalRef} className={cn("mb-8", className)}>
        <h3 className={cn("flex items-center gap-2 font-semibold text-lg mb-2", textColors.default)}>
          <span className={textColors.primary}>🎯</span>
          Goal Set:
        </h3>
        <div className="p-3 bg-white rounded-md border border-gray-200">
          {goalText}
        </div>
      </div>
      
      {/* Sticky goal that appears in corner */}
      {showStickyGoal && <StickyGoalCorner goalText={goalText} />}
    </>
  );
};

export default GoalSection; 