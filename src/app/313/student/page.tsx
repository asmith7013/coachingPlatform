import { Metadata } from 'next';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';

export const metadata: Metadata = {
  title: 'Student Access - Summer Rising',
  description: 'Access your Summer Rising Program dashboard',
  robots: 'noindex, nofollow',
};

export default function StudentLandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <Card.Body className="py-8 space-y-4">
          <div className="text-4xl mb-4">🎓</div>
          <Heading level="h2">Student Dashboard Access</Heading>
          <Text color="muted">
            Please enter your student ID in the URL to access your dashboard.
          </Text>
          <Text textSize="sm" color="muted">
            Example: /313/student/your-student-id
          </Text>
        </Card.Body>
      </Card>
    </div>
  );
} 