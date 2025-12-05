import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Badge } from '@/components/core/feedback/Badge';
import { StudentZearnProgress } from '@/lib/schema/zod-schema/313/student/student-data';
import { type GradeLevel } from '@/lib/schema/enum/scope-sequence';

interface ZearnProgressProps {
  progress: StudentZearnProgress[];
  weeklyMinutes: Record<string, string>;
  grade: GradeLevel;
}

export function ZearnProgress({ progress, weeklyMinutes, grade }: ZearnProgressProps) {
  // Filter progress to only show lessons for this grade
  const gradeProgress = progress.filter(p => p.lesson.startsWith(`G${grade}`));
  const recentProgress = gradeProgress.slice(-5); // Show last 5 lessons
  
  return (
    <Card>
      <Card.Header>
        <Heading level="h3">Recent Zearn Activity</Heading>
        <Text color="secondary">
          Latest lesson completions and time spent
        </Text>
      </Card.Header>
      
      <Card.Body className="space-y-4">
        {/* Recent lessons completed */}
        <div>
          <Text textSize="sm" className="font-medium mb-2">Recent Lessons Mastered:</Text>
          <div className="space-y-1">
            {recentProgress.length > 0 ? (
              recentProgress.map((lesson, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <Badge intent="success" className="text-xs">
                    {lesson.lesson}
                  </Badge>
                  <Text textSize="xs" color="secondary">
                    {lesson.completedDate}
                  </Text>
                </div>
              ))
            ) : (
              <Text textSize="sm" color="secondary">No recent lessons completed</Text>
            )}
          </div>
        </div>

        {/* Weekly time summary */}
        <div>
          <Text textSize="sm" className="font-medium mb-2">Weekly Time Spent:</Text>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(weeklyMinutes).slice(-4).map(([week, time]) => (
              <div key={week} className="p-2 bg-blue-50 rounded text-center">
                <Text textSize="xs" color="secondary">{week}</Text>
                <Text textSize="sm" className="font-medium">{time}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Total lessons for this grade */}
        <div className="pt-2 border-t">
          <Text textSize="sm" color="secondary">
            Total Grade {grade} Lessons: {gradeProgress.length}
          </Text>
        </div>
      </Card.Body>
    </Card>
  );
} 