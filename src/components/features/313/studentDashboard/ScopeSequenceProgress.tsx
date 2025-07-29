import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Badge } from '@/components/core/feedback/Badge';
import { type ScopeSequenceProgress } from '@/lib/schema/zod-schema/313/student-data';
import { getLessonsForGrade } from '@/lib/schema/enum/scope-sequence';

interface ScopeSequenceProgressProps {
  progress: ScopeSequenceProgress;
}

export function ScopeSequenceProgress({ progress }: ScopeSequenceProgressProps) {
  const allLessons = getLessonsForGrade(progress.grade);
  
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
  
  return (
    <Card>
      <Card.Header>
        <Heading level="h2">Grade {progress.grade} Mastery Progress</Heading>
        <Text color="secondary" textSize="lg">
          {progress.completed} of {progress.total} lessons completed ({progress.percentage}%)
        </Text>
      </Card.Header>
      
      <Card.Body className="space-y-6">
        {/* Enhanced Progress bar for prominence */}
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-green-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
            style={{ width: `${progress.percentage}%` }}
          >
            <span className="text-white text-sm font-medium">
              {progress.percentage}%
            </span>
          </div>
        </div>

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
                    const lessonShort = lesson.replace(/^G\d+ /, ''); // Remove grade prefix for display
                    
                    return (
                      <Badge
                        key={lesson}
                        intent={isCompleted ? "success" : "secondary"}
                        className="text-xs p-2 text-center min-h-8 flex items-center justify-center"
                      >
                        {lessonShort}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced summary stats */}
        <div className="grid grid-cols-3 gap-6 text-center">
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
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Badge intent="success" className="text-xs">✓</Badge>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge intent="secondary" className="text-xs">—</Badge>
            <span>Not Started</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
} 