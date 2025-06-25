'use client';

import React, { useState } from 'react';
import { DashboardPage } from '@/components/composed/layouts/DashboardPage';
import { useVisits } from '@/hooks/domain/useVisits';
import { useSchools } from '@/hooks/domain/useSchools';
import { PERMISSIONS } from '@core-types/auth';
import { AuthGuard } from '@components/auth/AuthGuard';
import { VisitsStatusGrid } from './components/VisitsStatusGrid';
import { StatusFilterBar } from './components/StatusFilterBar';
import { VisitsStatusSummary } from './components/VisitsStatusSummary';

export default function VisitsStatusPage() {
  // Use existing hooks with larger limit to get all visits
  const { items: visits = [], isLoading: visitsLoading } = useVisits.list({ limit: 1000 });
  const { items: schools = [], isLoading: schoolsLoading } = useSchools.list({ limit: 1000 });
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <AuthGuard requiredPermission={PERMISSIONS.VISIT_VIEW}>
      <DashboardPage>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Visits Status Dashboard</h1>
          <p className="text-gray-600">Track coaching log submissions and visit schedules across all schools.</p>
        </div>

        {/* Summary Cards */}
        <VisitsStatusSummary visits={visits} isLoading={visitsLoading} />

        {/* Filter Bar */}
        <StatusFilterBar 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Main Content Grid */}
        <VisitsStatusGrid 
          visits={visits}
          schools={schools}
          isLoading={visitsLoading || schoolsLoading}
          statusFilter={statusFilter}
          searchTerm={searchTerm}
        />
      </DashboardPage>
    </AuthGuard>
  );
} 