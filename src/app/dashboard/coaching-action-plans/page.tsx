import { CoachingActionPlanDashboard } from '@/components/features/coaching/CAPDashboard';
import { Metadata } from 'next';

// Page metadata for SEO and navigation
export const metadata: Metadata = {
  title: 'Coaching Plans - AI Coaching Platform',
  description: 'Create and manage comprehensive coaching action plans for teacher development',
};

// Server component following established dashboard page pattern
export default function CoachingActionPlansPage() {
  return <CoachingActionPlanDashboard />;
} 