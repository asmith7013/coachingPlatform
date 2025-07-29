import { StudentPreAssessment } from '@/lib/schema/zod-schema/313/student-data';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Badge } from '@/components/core/feedback/Badge';

interface PreAssessmentDataProps {
  assessment: StudentPreAssessment;
}

export function PreAssessmentData({ assessment }: PreAssessmentDataProps) {
  const questions = [
    {
      number: 1,
      score: assessment.question1,
      label: "Question 1"
    },
    {
      number: 2,
      score: assessment.question2,
      label: "Question 2"
    },
    {
      number: 3,
      score: assessment.question3,
      label: "Question 3"
    }
  ];

  const getScoreIcon = (score: number) => {
    return score === 1 ? "✅" : "❌";
  };

  const getScoreColor = (score: number) => {
    return score === 1 ? "text-green-600" : "text-red-600";
  };

  const totalCorrect = questions.filter(q => q.score === 1).length;
  const totalQuestions = questions.length;
  const percentage = Math.round((totalCorrect / totalQuestions) * 100);

  return (
    <Card>
      <Card.Header>
        <Heading level="h3">Pre-Assessment Results</Heading>
        <Text color="muted" textSize="sm">
          Your initial assessment scores
        </Text>
      </Card.Header>
      
      <Card.Body className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="text-4xl font-bold text-indigo-700 mb-2">
            {assessment.totalCorrect}
          </div>
          <Text className="font-medium">Total Score</Text>
          <Text textSize="sm" color="muted">
            {percentage}% correct
          </Text>
        </div>

        {/* Individual Questions */}
        <div>
          <Heading level="h4" className="mb-4">Question Breakdown</Heading>
          <div className="space-y-3">
            {questions.map((question) => (
              <div
                key={question.number}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-gray-300 font-medium text-sm">
                    {question.number}
                  </div>
                  <Text className="font-medium">{question.label}</Text>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xl ${getScoreColor(question.score)}`}>
                    {getScoreIcon(question.score)}
                  </span>
                  <Badge 
                    intent={question.score === 1 ? "success" : "danger"}
                    className="text-xs"
                  >
                    {question.score === 1 ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <Text textSize="sm" className="font-medium">Performance Level</Text>
            <Text textSize="sm" color="muted">
              {totalCorrect} of {totalQuestions} correct
            </Text>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                percentage >= 80 ? 'bg-green-500' :
                percentage >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <Badge 
              intent={
                percentage >= 80 ? "success" :
                percentage >= 60 ? "warning" :
                "danger"
              }
              className="text-xs"
            >
              {percentage >= 80 ? "Strong" :
               percentage >= 60 ? "Developing" :
               "Needs Support"}
            </Badge>
            <Text textSize="xs" color="muted">
              {percentage}% overall
            </Text>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
} 