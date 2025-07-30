import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Badge } from '@/components/core/feedback/Badge';
import { type ScopeSequenceProgress } from '@/lib/schema/zod-schema/313/student-data';
import { getLessonsForGrade } from '@/lib/schema/enum/scope-sequence';
import { getSnorklLink, hasSnorklLink } from '@/lib/schema/enum/snorkl-links';
import { getSectionType } from '@/lib/schema/zod-schema/313/student-data';

interface ScopeSequenceProgressProps {
  progress: ScopeSequenceProgress;
  studentSection: string;
}

export function ScopeSequenceProgress({ progress, studentSection }: ScopeSequenceProgressProps) {
  const allLessons = getLessonsForGrade(progress.grade);
  const sectionType = getSectionType(studentSection);
  
  // Group lessons by unit for display
  const unitGroups = new Map<string, { lessons: string[], completed: string[] }>();
  
  allLessons.forEach(lesson => {
    // Extract unit from lesson (e.g., "G6 U2 L01" -> "U2")
    const unitMatch = lesson.match(/U(\d+)/);
    const unitKey = unitMatch ? `Unit ${unitMatch[1]}` : 'Other';
    
    if (!unitGroups.has(unitKey)) {
      unitGroups.set(unitKey, { lessons: [], completed: [] });
    }
    
    const unit = unitGroups.get(unitKey)!;
    unit.lessons.push(lesson);
    
    if (progress.completedLessons.includes(lesson as never)) {
      unit.completed.push(lesson);
    }
  });

  const handleLessonClick = (lesson: string) => {
    const snorklLink = getSnorklLink(lesson, progress.grade, sectionType);
    if (snorklLink) {
      window.open(snorklLink, '_blank');
    }
  };
  
  return (
    <Card>
      <Card.Header>
        {/* <Heading level="h2">Grade {progress.grade} Mastery Progress</Heading> */}
        <Heading level="h2">Snorkl Progress</Heading>
        {/* <Text color="secondary" textSize="lg">
          {progress.completed} of {progress.total} lessons completed ({progress.percentage}%)
        </Text> */}
      </Card.Header>
      
      <Card.Body className="space-y-6">
        {/* Enhanced Progress bar for prominence */}
        {/* <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-green-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
            style={{ width: `${progress.percentage}%` }}
          >
            <span className="text-white text-sm font-medium">
              {progress.percentage}%
            </span>
          </div>
        </div> */}

        {/* Unit breakdown */}
        <div className="space-y-4">
          {Array.from(unitGroups.entries()).map(([unitName, unit]) => {
            const unitProgress = unit.lessons.length > 0 
              ? Math.round((unit.completed.length / unit.lessons.length) * 100) 
              : 0;
            
            return (
              <div key={unitName} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <Heading level="h4" className="text-sm font-medium">
                    {unitName}
                  </Heading>
                  <Text textSize="sm" color="secondary">
                    {unit.completed.length}/{unit.lessons.length}
                  </Text>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${unitProgress}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                  {unit.lessons.map((lesson) => {
                    const isCompleted = unit.completed.includes(lesson);
                    const isClickable = hasSnorklLink(lesson, progress.grade, sectionType);
                    const lessonShort = lesson.replace(/^G\d+ /, ''); // Remove grade prefix for display
                    
                    return (
                      <div
                        key={lesson}
                        className={`transition-all duration-200 ${
                          isClickable 
                            ? "cursor-pointer hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-blue-300 rounded" 
                            : "opacity-75"
                        }`}
                        onClick={() => isClickable && handleLessonClick(lesson)}
                        title={isClickable 
                          ? `Click to open ${lesson} in Snorkl` 
                          : `${lesson} - No submission link available`
                        }
                      >
                        <Badge
                          intent={isCompleted ? "success" : "secondary"}
                          className="text-xs p-2 text-center min-h-8 flex items-center justify-center w-full"
                        >
                          {lessonShort}
                          {/* {isClickable && (
                            <span className="ml-1 text-xs opacity-60">🔗</span>
                          )} */}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced summary stats */}
        {/* <div className="grid grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{progress.completed}</div>
            <Text textSize="sm" color="secondary">Completed</Text>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{progress.percentage}%</div>
            <Text textSize="sm" color="secondary">Progress</Text>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{progress.remaining.length}</div>
            <Text textSize="sm" color="secondary">Remaining</Text>
          </div>
        </div> */}

        {/* Legend */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Badge intent="success" className="text-xs">✓</Badge>
            <span>Mastered</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge intent="secondary" className="text-xs">—</Badge>
            <span>Not Yet</span>
          </div>
        </div>

        {/* Clickable lessons indicator */}
        <div className="text-center">
          <Text textSize="xs" color="muted">
            🔗 Click on lessons to open in Snorkl • Available for {sectionType} students
          </Text>
        </div>
      </Card.Body>
    </Card>
  );
} 