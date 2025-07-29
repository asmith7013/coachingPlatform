import { TableColumnSchema } from '@/lib/ui/table-schema';
import { StudentRow, AttemptData } from '../types';

/**
 * Create table column configuration for student data display
 */
export function createTableColumns(): TableColumnSchema<StudentRow>[] {
  return [
    {
      id: 'name',
      label: 'Student Name',
      accessor: (student) => (
        <div>
          <div className="font-medium">{student.name}</div>
          {student.matchedStudent && (
            <div className="text-xs text-gray-500 mt-1">
              <div>Matched: {student.matchedStudent.firstName} {student.matchedStudent.lastName}</div>
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs border ${getConfidenceColor(student.matchConfidence)}`}>
                {student.matchConfidence} confidence
              </span>
            </div>
          )}
          {!student.matchedStudent && (
            <div className="text-xs text-red-500 mt-1">No match found</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'bestResponse',
      label: 'Best Response',
      accessor: (student) => renderAttemptCell(student.bestResponse),
      className: 'font-medium',
    },
    {
      id: 'firstAttempt',
      label: '1st Attempt',
      accessor: (student) => renderAttemptCell(student.firstAttempt),
    },
    {
      id: 'secondAttempt', 
      label: '2nd Attempt',
      accessor: (student) => renderAttemptCell(student.secondAttempt),
    },
  ];
}

/**
 * Get appropriate color classes for confidence display
 */
function getConfidenceColor(confidence: 'high' | 'medium' | 'low' | 'none'): string {
  switch (confidence) {
    case 'high': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-red-100 text-red-800 border-red-200';
  }
}

/**
 * Render attempt data in a consistent cell format
 */
function renderAttemptCell(attempt: AttemptData): React.ReactNode {
  if (attempt.isEmpty) {
    return (
      <div className="text-gray-400 italic text-sm">
        No attempt
      </div>
    );
  }

  const correctnessColor = attempt.correct === 'Yes' ? 'text-green-600' : 'text-red-600';
  const scoreColor = getScoreColor(attempt.score);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className={`font-medium ${correctnessColor}`}>
          {attempt.correct}
        </span>
        <span className={`text-sm ${scoreColor}`}>
          Score: {attempt.score}
        </span>
      </div>
      <div className="text-xs text-gray-500">
        {attempt.date}
      </div>
    </div>
  );
}

/**
 * Get appropriate color for score display
 */
function getScoreColor(score: string | number): string {
  if (score === '-') return 'text-gray-400';
  
  const numScore = typeof score === 'number' ? score : parseInt(score.toString());
  
  if (numScore >= 4) return 'text-green-600';
  if (numScore >= 3) return 'text-yellow-600';
  if (numScore >= 2) return 'text-orange-600';
  return 'text-red-600';
} 