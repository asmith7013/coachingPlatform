import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { cn } from '@/lib/ui/utils/formatters';
import { useCombinedLessonData, type CombinedLessonStatus } from '@/hooks/domain/313/useCombinedLessonData';
import { StudentData, getSectionType } from '@/lib/schema/zod-schema/313/student-data';
import { getSnorklLink } from '@/lib/schema/enum/snorkl-links';

interface CombinedLessonProgressProps {
  studentData: StudentData;
}

export function CombinedLessonProgress({ studentData }: CombinedLessonProgressProps) {
  const { combinedProgress } = useCombinedLessonData(studentData);
  const sectionType = getSectionType(studentData.section);
  
  const handleLessonClick = (lessonStatus: CombinedLessonStatus) => {
    if (!lessonStatus.isClickable || !studentData.scopeSequenceProgress) return;
    
    const snorklLink = getSnorklLink(
      lessonStatus.lesson, 
      studentData.scopeSequenceProgress.grade, 
      sectionType
    );
    if (snorklLink) {
      window.open(snorklLink, '_blank');
    }
  };
  
  return (
    <Card>
      <Card.Header>
        <Heading level="h2">Summer Rising Progress</Heading>
        <Text color="muted" textSize="sm">
          Combined Snorkl and Zearn completion status
        </Text>
      </Card.Header>
      
      <Card.Body className="space-y-6">
        {/* Unit breakdown */}
        <div className="space-y-4">
          {combinedProgress.map((unit) => (
            <div key={unit.unitName} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <Heading level="h4" className="text-sm font-medium">
                  {unit.unitName}
                </Heading>
                <Text textSize="sm" color="secondary">
                  {unit.completedCount}/{unit.totalCount}
                </Text>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${unit.progressPercentage}%` }}
                />
              </div>
              
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {unit.lessons.map((lessonStatus) => (
                  <CombinedLessonBadge
                    key={lessonStatus.lesson}
                    lessonStatus={lessonStatus}
                    onClick={() => handleLessonClick(lessonStatus)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Legend */}
        <div className="space-y-2">
          <div className="flex gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-green-600 rounded border-2 border-green-600 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>Both Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-green-100 border-2 border-green-600 rounded flex items-center justify-center">
                <span className="text-green-600 text-xs">S</span>
              </div>
              <span>Snorkl Only</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-blue-100 border-2 border-blue-600 rounded flex items-center justify-center">
                <span className="text-blue-600 text-xs">Z</span>
              </div>
              <span>Zearn Only</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded"></div>
              <span>Not Started</span>
            </div>
          </div>
        </div>

        {/* Clickable lessons indicator */}
        <div className="text-center">
          <Text textSize="xs" color="muted">
            🔗 Click on Snorkl lessons to open submission links
          </Text>
        </div>
      </Card.Body>
    </Card>
  );
}

/**
 * Individual lesson badge showing combined completion state
 */
interface CombinedLessonBadgeProps {
  lessonStatus: CombinedLessonStatus;
  onClick: () => void;
}

function CombinedLessonBadge({ lessonStatus, onClick }: CombinedLessonBadgeProps) {
  const { lessonShort, completionState, isClickable } = lessonStatus;
  
  // Determine badge styling based on completion state
  const getBadgeStyles = () => {
    switch (completionState) {
      case 'both':
        return {
          className: "bg-green-600 text-white border-green-600",
          showIcon: "✓",
          showLabels: false
        };
      case 'snorkl-only':
        return {
          className: "bg-green-100 text-green-700 border-green-600",
          showIcon: "Snorkl",
          showLabels: false
        };
      case 'zearn-only':
        return {
          className: "bg-blue-100 text-blue-700 border-blue-600", 
          showIcon: "Zearn",
          showLabels: false
        };
      case 'none':
      default:
        return {
          className: "bg-gray-100 text-gray-600 border-gray-300",
          showIcon: null,
          showLabels: false
        };
    }
  };
  
  const styles = getBadgeStyles();
  
  return (
    <div
      className={cn(
        "transition-all duration-200 rounded",
        // Apply hover effects to ALL lessons, with different ring colors for clickable vs non-clickable
        "hover:scale-105 hover:shadow-md",
        isClickable && completionState !== 'none' 
          ? "cursor-pointer hover:ring-2 hover:ring-success-300" 
          : "cursor-pointer hover:ring-2 hover:ring-gray-300" // Different ring color for non-clickable
      )}
      onClick={() => isClickable && onClick()}
      title={
        isClickable 
          ? `Click to open ${lessonStatus.lesson} in Snorkl` 
          : `${lessonStatus.lesson} - ${completionState.replace('-', ' ')}`
      }
    >
      <div
        className={cn(
          // Ensure consistent dimensions for ALL badges
          "text-xs p-2 text-center flex flex-col items-center justify-center w-full border-2 rounded",
          // Fixed height to ensure consistency across all states
          "h-12 min-h-12",
          styles.className
        )}
      >
        {/* Lesson code */}
        <div className="font-medium text-xs leading-tight">{lessonShort}</div>
        
        {/* Completion indicator */}
        {styles.showIcon && (
          <div className="text-xs mt-1 leading-tight">{styles.showIcon}</div>
        )}
      </div>
    </div>
  );
} 