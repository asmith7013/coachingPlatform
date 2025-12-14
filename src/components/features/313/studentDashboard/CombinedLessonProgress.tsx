import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Badge } from '@/components/core/feedback/Badge';
import { cn } from '@/lib/ui/utils/formatters';
import { useCombinedLessonData, type CombinedLessonStatus } from '@/hooks/domain/313/useCombinedLessonData';
import { StudentData, getSectionType } from '@/lib/schema/zod-schema/scm/student/student-data';
import { getSnorklLink } from '@/lib/schema/enum/snorkl-links';

interface CombinedLessonProgressProps {
  studentData: StudentData;
}

export function CombinedLessonProgress({ studentData }: CombinedLessonProgressProps) {
  const { combinedProgress } = useCombinedLessonData(studentData);
  const sectionType = getSectionType(studentData.section);
  
  const handleSnorklClick = (lessonStatus: CombinedLessonStatus) => {
    if (!studentData.scopeSequenceProgress) return;
    
    const snorklLink = getSnorklLink(
      lessonStatus.lesson, 
      studentData.scopeSequenceProgress.grade, 
      sectionType
    );
    if (snorklLink) {
      window.open(snorklLink, '_blank');
    } else {
      console.log('No Snorkl link available for:', lessonStatus.lesson);
    }
  };

  const handleZearnClick = () => {
    window.open('https://zearn.org', '_blank');
  };
  
  return (
    <Card>
      <Card.Header>
        <Heading level="h2">Summer Rising Progress</Heading>
        {/* <Text color="secondary" textSize="sm">
          Remember:
        </Text>
        <Text color="secondary" textSize="sm">
          Remember:
        </Text> */}
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
                  className="bg-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${unit.progressPercentage}%` }}
                />
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-3">
                {unit.lessons.map((lessonStatus) => (
                  <CombinedLessonBadge
                    key={lessonStatus.lesson}
                    lessonStatus={lessonStatus}
                    onSnorklClick={() => handleSnorklClick(lessonStatus)}
                    onZearnClick={handleZearnClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Updated Legend to match actual Badge implementation */}
        <div className="space-y-3">
          <div className="flex gap-6 text-sm flex-wrap">
            {/* Both Complete - Mastery badge with blue border */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col w-20">
                <div className="mb-1">
                  <Badge 
                    appearance="solid" 
                    intent="mastery"
                    className="w-full justify-center py-2 font-bold border-blue border-2"
                  >
                    U2 L01
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-1 w-full">
                  <div className="w-full">
                    <Badge
                      appearance="outline"
                      intent="blue"
                      className="w-full justify-center text-xs py-1 hover:bg-blue hover:text-white"
                    >
                      Zearn
                    </Badge>
                  </div>
                  <div className="w-full">
                    <Badge
                      appearance="outline"
                      intent="success"
                      className="w-full justify-center text-xs py-1 bg-success border-success hover:bg-success hover:text-white"
                    >
                      Snorkl
                    </Badge>
                  </div>
                </div>
              </div>
              <span className="font-medium">Both Complete</span>
            </div>
            
            {/* Snorkl Only - Success badge, no blue border */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col w-20">
                <div className="mb-1">
                  <Badge 
                    appearance="solid" 
                    intent="success"
                    className="w-full justify-center py-2 font-bold"
                  >
                    U2 L02
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-1 w-full">
                  <div className="w-full">
                    <Badge
                      appearance="outline"
                      intent="muted"
                      className="w-full justify-center text-xs py-1 bg-gray-100 border-gray-300 hover:bg-gray-200"
                    >
                      Zearn
                    </Badge>
                  </div>
                  <div className="w-full">
                    <Badge
                      appearance="outline"
                      intent="success"
                      className="w-full justify-center text-xs py-1 bg-success border-success hover:bg-success hover:text-white"
                    >
                      Snorkl
                    </Badge>
                  </div>
                </div>
              </div>
              <span className="font-medium">Snorkl Only</span>
            </div>
            
            {/* Zearn Only - Secondary badge with blue border */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col w-20">
                <div className="mb-1">
                  <Badge 
                    appearance="outline" 
                    intent="secondary"
                    className="w-full justify-center py-2 font-bold border-blue border-2"
                  >
                    U2 L03
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-1 w-full">
                  <div className="w-full">
                    <Badge
                      appearance="outline"
                      intent="blue"
                      className="w-full justify-center text-xs py-1 hover:bg-blue hover:text-white"
                    >
                      Zearn
                    </Badge>
                  </div>
                  <div className="w-full">
                    <Badge
                      appearance="outline"
                      intent="muted"
                      className="w-full justify-center text-xs py-1 bg-gray-100 border-gray-300 hover:bg-gray-200"
                    >
                      Snorkl
                    </Badge>
                  </div>
                </div>
              </div>
              <span className="font-medium">Zearn Only</span>
            </div>
            
            {/* Not Started - Secondary badge, no blue border */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col w-20">
                <div className="mb-1">
                  <Badge 
                    appearance="outline" 
                    intent="secondary"
                    className="w-full justify-center py-2 font-bold"
                  >
                    U2 L04
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-1 w-full">
                  <div className="w-full">
                    <Badge
                      appearance="outline"
                      intent="muted"
                      className="w-full justify-center text-xs py-1 bg-gray-100 border-gray-300 hover:bg-gray-200"
                    >
                      Zearn
                    </Badge>
                  </div>
                  <div className="w-full">
                    <Badge
                      appearance="outline"
                      intent="muted"
                      className="w-full justify-center text-xs py-1 bg-gray-100 border-gray-300 hover:bg-gray-200"
                    >
                      Snorkl
                    </Badge>
                  </div>
                </div>
              </div>
              <span className="font-medium">Not Started</span>
            </div>
          </div>
        </div>

        {/* Updated clickable lessons indicator */}
        <div className="text-center">
          <Text textSize="xs" color="muted">
            🔗 Click any badge to open Snorkl lessons or Zearn.org
          </Text>
        </div>
      </Card.Body>
    </Card>
  );
}

/**
 * Individual lesson badge showing 3-badge system: Lesson + Zearn + Snorkl
 * Updated to support universal clicking
 */
interface CombinedLessonBadgeProps {
  lessonStatus: CombinedLessonStatus;
  onSnorklClick: () => void;
  onZearnClick: () => void;
}

function CombinedLessonBadge({ 
  lessonStatus, 
  onSnorklClick, 
  onZearnClick 
}: CombinedLessonBadgeProps) {
  const { lessonShort, hasSnorkl, hasZearn, lesson } = lessonStatus;
  
  return (
    <div className="flex flex-col w-full mb-4">
      {/* Main lesson badge - always clickable for Snorkl */}
      <div className="mb-1" title={`Click to open ${lesson} in Snorkl`}>
        <Badge 
          appearance={hasSnorkl ? "solid" : "outline"} 
          intent={hasSnorkl && hasZearn ? "mastery" : hasSnorkl ? "success" : "secondary"}
          className={cn(
            "w-full justify-center py-2 font-bold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm",
            hasZearn && "border-blue border-2"
          )}
          onClick={onSnorklClick}
        >
          {lessonShort}
        </Badge>
      </div>
      
      {/* Platform completion badges - now always clickable and full width */}
      <div className="grid grid-cols-2 gap-1 w-full">
        {/* Zearn badge - always clickable, full width */}
        <div title="Click to open Zearn.org" className="w-full">
          <Badge
            appearance="outline"
            intent={hasZearn ? "blue" : "muted"}
            className={cn(
              "w-full justify-center text-xs py-1 transition-all duration-200 hover:scale-105 hover:shadow-sm cursor-pointer",
              hasZearn
                ? "hover:bg-blue hover:text-white" 
                : "bg-gray-100 border-gray-300 hover:bg-gray-200"
            )}
            onClick={onZearnClick}
          >
            Zearn
          </Badge>
        </div>
        
        {/* Snorkl badge - always clickable, full width */}
        <div title={`Click to open ${lesson} in Snorkl`} className="w-full">
          <Badge
            appearance="outline"
            intent={hasSnorkl ? "success" : "muted"}
            className={cn(
              "w-full justify-center text-xs py-1 transition-all duration-200 cursor-pointer",
              hasSnorkl 
                ? "bg-success border-success hover:bg-success hover:text-white hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-success" 
                : "bg-gray-100 border-gray-300 hover:bg-gray-200 hover:scale-105 hover:shadow-sm"
            )}
            onClick={onSnorklClick}
          >
            Snorkl
          </Badge>
        </div>
      </div>
    </div>
  );
} 