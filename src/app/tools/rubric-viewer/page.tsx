'use client';

import { RubricViewer } from '@/components/domain/rubrics/RubricViewer';
import { DashboardPage } from '@/components/composed/layouts/DashboardPage';

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