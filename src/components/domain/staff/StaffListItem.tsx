'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Text } from '@/components/core/typography/Text'
import { Card } from '@/components/composed/cards/Card'
import { Button } from '@/components/core/Button'
import type { NYCPSStaff, TeachingLabStaff } from '@zod-schema/core/staff'

type StaffMember = NYCPSStaff | TeachingLabStaff
type StaffType = 'nycps' | 'tl'

export interface StaffListItemProps {
  staff: StaffMember
  staffType?: StaffType
  className?: string
}

export function StaffListItem({ staff, staffType = 'nycps', className }: StaffListItemProps) {
  return (
    <Card className={cn('p-4 hover:shadow-md transition-shadow', className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-3 md:mb-0">
          <Text textSize="lg" weight="semibold" className="mb-1">
            {staff.staffName}
          </Text>
          
          <Text color="muted" textSize="sm" className="mb-1">
            {staff.email || 'No email provided'}
          </Text>
          
          {staffType === 'nycps' && 'subjects' in staff && (
            <div className="flex flex-wrap gap-1 mt-2">
              {staff.subjects.slice(0, 3).map((subject, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                >
                  {subject}
                </span>
              ))}
              {staff.subjects.length > 3 && (
                <span className="text-xs text-muted">
                  +{staff.subjects.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {staffType === 'tl' && 'rolesTL' in staff && staff.rolesTL && (
            <div className="flex flex-wrap gap-1 mt-2">
              {staff.rolesTL.slice(0, 3).map((role, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20"
                >
                  {role}
                </span>
              ))}
              {staff.rolesTL.length > 3 && (
                <span className="text-xs text-muted">
                  +{staff.rolesTL.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href={`/staff/${staff._id}`} passHref>
            <Button
              intent="secondary"
              appearance="outline"
              textSize="sm"
              radius="md"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
} 