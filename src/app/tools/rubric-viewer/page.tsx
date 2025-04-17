'use client';

import { RubricViewer } from '@/components/features/rubrics/RubricViewer';
import { DashboardPage } from '@/components/layouts/DashboardPage';

export default function RubricViewerPage() {
  return (
    <DashboardPage
      title="IM Rubric Viewer"
      description="Explore rubric indicators aligned to IM implementation guidance."
    >
      <RubricViewer />
    </DashboardPage>
  );
} 