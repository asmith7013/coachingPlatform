"use client";

import React, { useMemo, useState } from "react";
import { Card } from '@/components/composed/cards/Card';
import { SectionHeading } from '@/components/composed/sectionHeadings';
import { Text } from '@/components/core/typography/Text';
import { useNYCPSStaffList } from "@hooks/domain/staff/useNYCPSStaff";
import { SimpleCard } from '@/components/composed/cards/SimpleCard';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface TeachersCardProps {
  schoolId: string;
  onAddTeacher?: () => void;
  onTeacherClick?: (teacherId: string, teacherName: string) => void;
  onTeacherActionClick?: (teacherId: string, teacherName: string) => void;
}

export function TeachersCard({ 
  schoolId, 
  onAddTeacher, 
  onTeacherClick, 
  onTeacherActionClick 
}: TeachersCardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real staff data
  const { 
    items: allStaff, 
    isLoading: staffLoading, 
    error: staffError 
  } = useNYCPSStaffList({
    limit: 50, // Get more staff to filter locally
    sortBy: 'staffName',
    sortOrder: 'asc'
  });

  // Filter staff for this specific school and search query
  const schoolStaff = useMemo(() => {
    if (!allStaff || !schoolId) return [];
    
    let filtered = allStaff.filter(staff => 
      staff.schoolIds && staff.schoolIds.includes(schoolId)
    );

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(staff =>
        staff.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.subjects?.some(subject => 
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        staff.rolesNYCPS?.some(role => 
          role.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return filtered;
  }, [allStaff, schoolId, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleTeacherClick = (teacher: { _id: string; staffName?: string }) => {
    if (onTeacherClick) {
      onTeacherClick(teacher._id, teacher.staffName || 'Unknown');
    } else {
      console.log('Navigate to teacher:', teacher.staffName);
      // Default behavior: router.push(`/dashboard/staff/${teacher._id}`);
    }
  };

  const handleTeacherActionClick = (e: React.MouseEvent, teacher: { _id: string; staffName?: string }) => {
    e.stopPropagation();
    if (onTeacherActionClick) {
      onTeacherActionClick(teacher._id, teacher.staffName || 'Unknown');
    } else {
      console.log('Show teacher options for', teacher.staffName);
      // Default behavior: show teacher options menu
    }
  };

  return (
    <Card padding="lg" radius="lg">
      <SectionHeading
        title="Teachers"
        subtitle={`${schoolStaff.length} staff members`}
        icon={UserGroupIcon}
        actions={[
          {
            type: 'search',
            placeholder: 'Search teachers',
            onChange: handleSearchChange
          },
          {
            type: 'button',
            variant: 'primary',
            children: 'Add Teacher',
            onClick: onAddTeacher || (() => console.log('Add new teacher'))
          }
        ]}
      />
      
      {staffLoading ? (
        <Text textSize="base">Loading staff...</Text>
      ) : staffError ? (
        <Text textSize="base" color="danger">Error loading staff: {staffError.message}</Text>
      ) : schoolStaff.length === 0 ? (
        <div className="text-center py-8">
          {searchQuery ? (
            <div>
              <Text textSize="base" color="muted" className="mb-2">
                No teachers found matching &ldquo;{searchQuery}&rdquo;
              </Text>
              <Text textSize="sm" color="muted">
                Try a different search term or clear the search to see all teachers.
              </Text>
            </div>
          ) : (
            <Text textSize="base" color="muted">No staff found for this school.</Text>
          )}
        </div>
      ) : (
        <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {schoolStaff.map((teacher, index) => {
            const teacherColors = ['pink', 'purple', 'yellow', 'green', 'blue', 'red'] as const;
            const initials = teacher.staffName
              ? teacher.staffName.split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : '??';
            
            // Get primary role and subjects
            const primaryRole = teacher.rolesNYCPS && teacher.rolesNYCPS.length > 0 
              ? teacher.rolesNYCPS[0] 
              : 'Staff';
            
            const subjects = teacher.subjects && teacher.subjects.length > 0
              ? teacher.subjects.join(', ')
              : 'No subjects assigned';
            
            return (
              <SimpleCard
                key={teacher._id}
                initials={initials}
                title={teacher.staffName || 'Unknown Staff'}
                subtitle={`${primaryRole} • ${subjects}`}
                colorVariant={teacherColors[index % teacherColors.length]}
                clickable
                showAction
                onClick={() => handleTeacherClick(teacher)}
                onActionClick={(e: React.MouseEvent) => handleTeacherActionClick(e, teacher)}
              />
            );
          })}
        </ul>
      )}
    </Card>
  );
} 