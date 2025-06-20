"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Card } from '@/components/composed/cards/Card';
import { SectionHeading } from '@/components/composed/sectionHeadings';
import { Text } from '@/components/core/typography/Text';
import { useNYCPSStaffList } from "@hooks/domain/staff/useNYCPSStaff";
import { SimpleCard } from '@/components/composed/cards/SimpleCard';
import { UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { tv } from 'tailwind-variants';

// Dropdown component styles
const teacherDropdown = tv({
  slots: {
    dropdownContainer: [
      'absolute right-0 top-8 z-50 mt-2',
      'min-w-48 rounded-md',
      'bg-white shadow-lg ring-1 ring-black ring-opacity-5',
      'focus:outline-none'
    ],
    dropdownItem: [
      'group flex items-center px-4 py-2 text-sm',
      'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      'cursor-pointer transition-colors duration-150 w-full text-left'
    ],
    dropdownIcon: [
      'mr-3 h-5 w-5 text-gray-400',
      'group-hover:text-gray-500'
    ]
  }
});

interface TeacherDropdownProps {
  teacherId: string;
  teacherName: string;
  isOpen: boolean;
  onClose: () => void;
}

function TeacherDropdown({ 
  teacherId, 
  teacherName, 
  isOpen, 
  onClose 
}: TeacherDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const styles = teacherDropdown();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, onClose]);

  const handleClassroomNotesClick = () => {
    onClose();
    // Navigate to classroom notes with teacher pre-selected
    const params = new URLSearchParams({
      teacherId: teacherId,
      teacherName: teacherName
    });
    router.push(`/examples/classroomNotes?${params.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={styles.dropdownContainer()}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="teacher-menu"
    >
      <div className="py-1" role="none">
        <button
          className={styles.dropdownItem()}
          role="menuitem"
          onClick={handleClassroomNotesClick}
        >
          <DocumentTextIcon 
            className={styles.dropdownIcon()} 
            aria-hidden="true" 
          />
          Classroom Notes
        </button>
      </div>
    </div>
  );
}

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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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
    // Toggle dropdown for this specific teacher
    if (openDropdownId === teacher._id) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(teacher._id);
    }
    if (onTeacherActionClick) {
      onTeacherActionClick(teacher._id, teacher.staffName || 'Unknown');
    } else {
      console.log('Show teacher options for', teacher.staffName);
      // Default behavior: show teacher options menu
    }
  };

  const closeDropdown = () => {
    setOpenDropdownId(null);
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
        <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2">
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
              <div key={teacher._id} className="relative">
                <SimpleCard
                  initials={initials}
                  title={teacher.staffName || 'Unknown Staff'}
                  subtitle={`${primaryRole} • ${subjects}`}
                  colorVariant={teacherColors[index % teacherColors.length]}
                  clickable
                  showAction
                  onClick={() => handleTeacherClick(teacher)}
                  onActionClick={(e: React.MouseEvent) => handleTeacherActionClick(e, teacher)}
                />
                <TeacherDropdown
                  teacherId={teacher._id}
                  teacherName={teacher.staffName || 'Unknown Staff'}
                  isOpen={openDropdownId === teacher._id}
                  onClose={closeDropdown}
                />
              </div>
            );
          })}
        </ul>
      )}
    </Card>
  );
} 