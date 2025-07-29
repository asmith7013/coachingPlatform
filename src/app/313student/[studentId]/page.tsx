import { StudentDashboard } from '@/components/features/313/studentDashboard/StudentDashboard';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{
      studentId: string;
    }>;
  }
  

// Generate metadata for the page
export async function generateMetadata({ params: _params }: PageProps): Promise<Metadata> {
  return {
    title: `Student Dashboard - Summer Rising`,
    description: `Personal dashboard for Summer Rising Program student`,
    robots: 'noindex, nofollow', // Keep student dashboards private
  };
}

export default async function StudentDashboardPage({ params }: PageProps) {
    const { studentId } = await params;
    return <StudentDashboard studentId={studentId} />;
  } 