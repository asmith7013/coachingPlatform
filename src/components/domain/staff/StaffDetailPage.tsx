'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { Tabs, Tab } from '@/components/composed/tabs'
import { Heading } from '@/components/core/typography/Heading'
import { Text } from '@/components/core/typography/Text'
import { Card } from '@/components/composed/cards/Card'
import { ScheduleTable } from '@/components/composed/tables/ScheduleTable'
import { Table } from '@/components/composed/tables/Table'
import { useSafeSWR } from '@/hooks/utils/useSafeSWR'
import { cn } from '@/lib/utils'
import { weight, paddingY } from '@ui-tokens/tokens'
import type { NYCPSStaff, TeachingLabStaff } from '@zod-schema/core/staff'
import type { TeacherSchedule } from '@zod-schema/scheduling/schedule'
import type { TableColumnSchema } from '@ui/table-schema'

type StaffMember = NYCPSStaff | TeachingLabStaff
type StaffType = 'nycps' | 'tl'

// Define the history item type
interface HistoryItem {
  date: string;
  action: string;
  user: string;
  details: string;
}

export interface StaffDetailPageProps {
  staffType?: StaffType
}

export function StaffDetailPage({ staffType = 'nycps' }: StaffDetailPageProps) {
  const params = useParams()
  const staffId = params?.id as string

  // Fetch staff member data
  const { data: staffMember, error: staffError, isLoading: isLoadingStaff } = useStaffMember(staffId, staffType)
  
  // Fetch staff schedule data
  const { data: schedule, error: scheduleError, isLoading: isLoadingSchedule } = useStaffSchedule(staffId)
  
  // Define tabs based on available data
  const tabs = useMemo(() => {
    const tabItems: Tab[] = [
      {
        id: 'info',
        label: 'Information',
        content: <StaffInfoTab staffMember={staffMember} isLoading={isLoadingStaff} error={staffError} />
      },
      {
        id: 'schedule',
        label: 'Schedule',
        content: <StaffScheduleTab schedule={schedule} isLoading={isLoadingSchedule} error={scheduleError} />
      },
      {
        id: 'history',
        label: 'History',
        content: <StaffHistoryTab staffMember={staffMember} isLoading={isLoadingStaff} />
      }
    ]
    return tabItems
  }, [staffMember, staffError, isLoadingStaff, schedule, scheduleError, isLoadingSchedule])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/dashboard/staffList" 
          className={cn(
            "inline-flex items-center",
            "text-primary hover:text-primary-dark",
            "transition-colors"
          )}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          <span>Back to Staff List</span>
        </Link>
      </div>

      <div className="mb-6">
        <Heading level="h1">
          {isLoadingStaff 
            ? 'Loading staff details...' 
            : staffMember?.staffName || 'Staff Member'
          }
        </Heading>
        {staffType === 'nycps' && 
          <Text color="muted" className={cn(paddingY.xs)}>
            New York City Public Schools
          </Text>
        }
        {staffType === 'tl' && 
          <Text color="muted" className={cn(paddingY.xs)}>
            Teaching Lab
          </Text>
        }
      </div>

      <Tabs 
        tabs={tabs} 
        defaultTab="info"
        textSize="base"
      />
    </div>
  )
}

// Info tab content
function StaffInfoTab({ 
  staffMember, 
  isLoading, 
  error 
}: { 
  staffMember?: StaffMember; 
  isLoading: boolean; 
  error?: Error | null 
}) {
  if (error) {
    return (
      <Card className="p-4 mt-4">
        <Text color="danger">Failed to load staff information: {error.message}</Text>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-4 mt-4">
        <Text>Loading staff information...</Text>
      </Card>
    )
  }

  if (!staffMember) {
    return (
      <Card className="p-4 mt-4">
        <Text>No staff information found.</Text>
      </Card>
    )
  }

  // Display staff details in a structured format
  return (
    <div className="grid md:grid-cols-2 gap-6 py-4">
      <Card className="p-6">
        <Heading level="h3" className="mb-4">Basic Information</Heading>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
          <InfoItem label="Name" value={staffMember.staffName} />
          <InfoItem label="Email" value={staffMember.email || 'Not provided'} />
          <InfoItem label="Created" value={staffMember.createdAt ? new Date(staffMember.createdAt).toLocaleDateString() : 'Unknown'} />
          <InfoItem label="Last Updated" value={staffMember.updatedAt ? new Date(staffMember.updatedAt).toLocaleDateString() : 'Unknown'} />
        </dl>
      </Card>

      {'gradeLevelsSupported' in staffMember && (
        <Card className="p-6">
          <Heading level="h3" className="mb-4">Academic Information</Heading>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
            <InfoItem 
              label="Grade Levels" 
              value={staffMember.gradeLevelsSupported.join(', ') || 'None'} 
            />
            <InfoItem 
              label="Subjects" 
              value={staffMember.subjects.join(', ') || 'None'} 
            />
            <InfoItem 
              label="Special Groups" 
              value={staffMember.specialGroups.join(', ') || 'None'} 
            />
            <InfoItem 
              label="Roles" 
              value={staffMember.rolesNYCPS?.join(', ') || 'None'} 
            />
          </dl>
        </Card>
      )}

      {'adminLevel' in staffMember && (
        <Card className="p-6">
          <Heading level="h3" className="mb-4">Administrative Information</Heading>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
            <InfoItem 
              label="Admin Level" 
              value={staffMember.adminLevel} 
            />
            <InfoItem 
              label="Teaching Lab Roles" 
              value={staffMember.rolesTL?.join(', ') || 'None'} 
            />
            <InfoItem 
              label="Assigned Districts" 
              value={staffMember.assignedDistricts.length > 0 ? `${staffMember.assignedDistricts.length} districts` : 'None'} 
            />
          </dl>
        </Card>
      )}

      {'experience' in staffMember && staffMember.experience && staffMember.experience.length > 0 && (
        <Card className="p-6">
          <Heading level="h3" className="mb-4">Experience</Heading>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
            {staffMember.experience.map((exp, index) => (
              <div key={index}>
                <Text weight="semibold">{exp.type}</Text>
                <Text>{exp.years} years</Text>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </div>
  )
}

// Helper component for info items
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className={cn("text-sm", weight.medium, "text-muted")}>
        {label}
      </dt>
      <dd className={cn("text-base", weight.normal, "text-default")}>
        {value}
      </dd>
    </>
  )
}

// Schedule tab content
function StaffScheduleTab({ 
  schedule, 
  isLoading, 
  error 
}: { 
  schedule?: TeacherSchedule; 
  isLoading: boolean; 
  error?: Error | null 
}) {
  if (error) {
    return (
      <Card className="p-4 mt-4">
        <Text color="danger">Failed to load schedule: {error.message}</Text>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-4 mt-4">
        <Text>Loading schedule information...</Text>
      </Card>
    )
  }

  if (!schedule || !schedule.scheduleByDay || schedule.scheduleByDay.length === 0) {
    return (
      <Card className="p-4 mt-4">
        <Text>No schedule information available for this staff member.</Text>
      </Card>
    )
  }

  return (
    <div className="py-4">
      <Card className="p-4 md:p-6">
        <Heading level="h3" className="mb-4">Weekly Schedule</Heading>
        <ScheduleTable scheduleByDay={schedule.scheduleByDay} />
      </Card>
    </div>
  )
}

// History tab content
function StaffHistoryTab({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  staffMember, 
  isLoading 
}: { 
  staffMember?: StaffMember; 
  isLoading: boolean 
}) {
  // Definition for history records table
  const historyColumns: TableColumnSchema<HistoryItem>[] = [
    { 
      id: 'date', 
      label: 'Date', 
      accessor: (item) => item.date 
    },
    { 
      id: 'action', 
      label: 'Action', 
      accessor: (item) => item.action 
    },
    { 
      id: 'user', 
      label: 'User', 
      accessor: (item) => item.user 
    },
    { 
      id: 'details', 
      label: 'Details', 
      accessor: (item) => item.details 
    },
  ]

  // Mock history data - in a real application, this would come from an API
  const mockHistoryData = useMemo(() => [
    { date: '2023-12-15', action: 'Created', user: 'System Admin', details: 'Initial staff record created' },
    { date: '2023-12-18', action: 'Updated', user: 'John Doe', details: 'Schedule information added' },
    { date: '2024-01-10', action: 'Updated', user: 'Jane Smith', details: 'Email updated' },
  ], [])

  if (isLoading) {
    return (
      <Card className="p-4 mt-4">
        <Text>Loading history information...</Text>
      </Card>
    )
  }

  return (
    <div className="py-4">
      <Card className="p-4 md:p-6">
        <Heading level="h3" className="mb-4">Staff Record History</Heading>
        <Table
          data={mockHistoryData}
          columns={historyColumns}
          textSize="sm"
          compact={true}
        />
      </Card>
    </div>
  )
}

// Custom hooks for data fetching
function useStaffMember(staffId: string, staffType: StaffType) {
  const endpoint = `/api/staff/${staffId}?staffType=${staffType}`

  const { data, error } = useSafeSWR<StaffMember>(
    staffId ? endpoint : null,
    async () => {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch staff member');
      const data = await res.json();
      if (!data.success || !data.items || data.items.length === 0) {
        throw new Error(data.message || 'Failed to fetch staff member');
      }
      return data.items[0];
    },
    `fetch_staff_${staffId}`
  )

  return {
    data,
    error,
    isLoading: !data && !error && !!staffId
  }
}

function useStaffSchedule(staffId: string) {
  const endpoint = `/api/teacher-schedules?teacher=${staffId}`

  const { data, error } = useSafeSWR<TeacherSchedule>(
    staffId ? endpoint : null,
    async () => {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch staff schedule');
      const data = await res.json();
      if (!data.success || !data.items || data.items.length === 0) {
        throw new Error(data.message || 'Failed to fetch staff schedule');
      }
      return data.items[0];
    },
    `fetch_schedule_${staffId}`
  )

  return {
    data,
    error,
    isLoading: !data && !error && !!staffId
  }
} 