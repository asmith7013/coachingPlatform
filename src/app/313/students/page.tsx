"use client";

import React, { useState, useCallback, useMemo } from "react";
import { DashboardPage } from '@components/composed/layouts/DashboardPage';
import { Table } from '@components/composed/tables/Table';
import { FilterHeader, type FilterConfig } from '@components/composed/filters';
import { Select } from '@components/core/fields/Select';
import { Text } from '@components/core/typography/Text';
import { Badge } from '@components/core/feedback/Badge';
import { useStudents } from "@hooks/domain/313/useStudents";
import { Student } from "@/lib/schema/zod-schema/scm/student/student";
import { SummerDistricts, Sections313, Teachers313, Sections313Type, Teachers313Type } from "@/lib/schema/enum/313";
import type { TableColumnSchema } from '@ui/table-schema';
import { EmptyListWrapper } from '@components/core/empty/EmptyListWrapper';
import { UserGroupIcon } from '@heroicons/react/24/outline';

// Helper function to map districts to sections/teachers
const getDistrictMapping = () => {
  return {
    "D11": {
      sections: ["802", "803"] as Sections313Type[],
      teachers: [] as Teachers313Type[]
    },
    "D9": {
      sections: ["804", "805"] as Sections313Type[],
      teachers: [] as Teachers313Type[]
    }
  };
};

export default function StudentViewerPage() {
  // Hooks
  const { 
    items: students = [], 
    isLoading, 
    error 
  } = useStudents.list({ limit: 1000 });
  
  const { updateWithToast } = useStudents.withNotifications();
  
  // Filter state
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Get district mapping
  const districtMapping = useMemo(() => getDistrictMapping(), []);
  
  // Filter available teachers and sections based on selected district
  const availableTeachers = useMemo(() => {
    if (!selectedDistrict) return Teachers313;
    return districtMapping[selectedDistrict as keyof typeof districtMapping]?.teachers || [];
  }, [selectedDistrict, districtMapping]);

  const availableSections = useMemo(() => {
    if (!selectedDistrict) return Sections313;
    return districtMapping[selectedDistrict as keyof typeof districtMapping]?.sections || [];
  }, [selectedDistrict, districtMapping]);
  
  // ✅ Updated filtering logic with search
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Existing district filtering
      if (selectedDistrict) {
        const teacherInDistrict = availableTeachers.includes(student.teacher as Teachers313Type);
        const sectionInDistrict = availableSections.includes(student.section as Sections313Type);

        if (!teacherInDistrict || !sectionInDistrict) return false;
      }
      
      // Existing teacher/section filtering
      if (selectedTeacher && student.teacher !== selectedTeacher) return false;
      if (selectedSection && student.section !== selectedSection) return false;
      
      // NEW: Search functionality
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        const studentId = student.studentID.toString();

        const matchesSearch = fullName.includes(query) ||
                             studentId.includes(query);
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [students, selectedDistrict, selectedTeacher, selectedSection, searchQuery, availableTeachers, availableSections]);
  
  // Handle field updates
  const handleGradeLevelChange = useCallback(async (studentId: string, newGradeLevel: string) => {
    try {
      await updateWithToast(studentId, { gradeLevel: newGradeLevel });
    } catch (error) {
      console.error('Failed to update grade level:', error);
    }
  }, [updateWithToast]);
  
  const handleSectionChange = useCallback(async (studentId: string, newSection: string) => {
    try {
      await updateWithToast(studentId, { section: newSection as Sections313Type });
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  }, [updateWithToast]);

  const handleTeacherChange = useCallback(async (studentId: string, newTeacher: string) => {
    try {
      await updateWithToast(studentId, { teacher: newTeacher as Teachers313Type });
    } catch (error) {
      console.error('Failed to update teacher:', error);
    }
  }, [updateWithToast]);
  
  // Filter configuration for the component
  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      key: 'district',
      label: 'District',
      options: [
        { value: "", label: "All Districts" },
        ...SummerDistricts.map(district => ({ value: district, label: district }))
      ],
      value: selectedDistrict,
      onChange: setSelectedDistrict,
      placeholder: "Select district"
    },
    {
      key: 'teacher',
      label: 'Teacher',
      options: [
        { value: "", label: "All Teachers" },
        ...availableTeachers.map(teacher => ({ value: teacher, label: teacher }))
      ],
      value: selectedTeacher,
      onChange: setSelectedTeacher,
      placeholder: "Select teacher"
    },
    {
      key: 'section',
      label: 'Section',
      options: [
        { value: "", label: "All Sections" },
        ...availableSections.map(section => ({ value: section, label: section }))
      ],
      value: selectedSection,
      onChange: setSelectedSection,
      placeholder: "Select section"
    }
  ], [selectedDistrict, selectedTeacher, selectedSection, availableTeachers, availableSections]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSelectedDistrict("");
    setSelectedTeacher("");
    setSelectedSection("");
    setSearchQuery("");
  }, []);
  
  // Table columns configuration
  const columns: TableColumnSchema<Student>[] = useMemo(() => [
    {
      id: 'studentID',
      label: 'Student ID',
      accessor: (row) => <Text textSize="sm">{row.studentID}</Text>,
      width: '100px'
    },
    {
      id: 'name',
      label: 'Name',
      accessor: (row) => (
        <div>
          <Text textSize="sm" className="font-medium">
            {row.firstName} {row.lastName}
          </Text>
          <Text textSize="xs" color="muted">ID: {row.studentID}</Text>
        </div>
      ),
      width: '200px'
    },
    {
      id: 'gradeLevel',
      label: 'Grade Level',
      accessor: (row) => (
        <Select
          options={[
            { value: "6", label: "6 (Rising 7)" },
            { value: "7", label: "7 (Rising 8)" },
            { value: "8", label: "8 (Rising 9)" }
          ]}
          value={row.gradeLevel || ""}
          onChange={(value) => handleGradeLevelChange(row._id, value)}
          placeholder="Select grade"
          textSize="sm"
          padding="sm"
        />
      ),
      width: '150px'
    },
    {
      id: 'section',
      label: 'Section',
      accessor: (row) => (
        <Select
          options={availableSections.map(section => ({ value: section, label: section }))}
          value={row.section || ""}
          onChange={(value) => handleSectionChange(row._id, value)}
          placeholder="Select section"
          textSize="sm"
          padding="sm"
        />
      ),
      width: '180px'
    },
    {
      id: 'teacher',
      label: 'Teacher',
      accessor: (row) => (
        <Select
          options={availableTeachers.map(teacher => ({ value: teacher, label: teacher }))}
          value={row.teacher || ""}
          onChange={(value) => handleTeacherChange(row._id, value)}
          placeholder="Select teacher"
          textSize="sm"
          padding="sm"
        />
      ),
      width: '180px'
    },
    {
      id: 'active',
      label: 'Status',
      accessor: (row) => (
        <Badge intent={row.active ? 'success' : 'secondary'}>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
      width: '100px'
    }
  ], [availableTeachers, availableSections, handleGradeLevelChange, handleSectionChange, handleTeacherChange]);
  
  if (isLoading) {
    return (
      <DashboardPage title="Students" description="Loading student data...">
        <Text textSize="base">Loading students...</Text>
      </DashboardPage>
    );
  }
  
  if (error) {
    return (
      <DashboardPage title="Students" description="Error loading students">
        <Text textSize="base" color="danger">Error loading students: {error.message}</Text>
      </DashboardPage>
    );
  }
  
  return (
    <DashboardPage
      title="Students"
      description={`Viewing ${filteredStudents.length} of ${students.length} students`}
    >
      {/* Filters Section - Using Reusable Component */}
      <FilterHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name..."
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
        columns={4}
      />
      
      {/* Results Summary */}
      <div className="mb-4">
        <Text textSize="sm" color="muted">
          Showing {filteredStudents.length} of {students.length} students
          {(selectedDistrict || selectedTeacher || selectedSection || searchQuery) && (
            <span className="ml-2">
              (filtered by: {[
                selectedDistrict && `District: ${selectedDistrict}`,
                selectedTeacher && `Teacher: ${selectedTeacher}`,
                selectedSection && `Section: ${selectedSection}`,
                searchQuery && `Search: "${searchQuery}"`
              ].filter(Boolean).join(', ')})
            </span>
          )}
        </Text>
      </div>
      
      {/* Students Table */}
      <EmptyListWrapper
        items={filteredStudents}
        resourceName="students"
        title="No students found"
        description="Try adjusting your filters or check if students have been added to the system"
        icon={UserGroupIcon}
      >
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table
            data={filteredStudents}
            columns={columns}
            textSize="sm"
            padding="sm"
            emptyMessage="No students match the current filters"
          />
        </div>
      </EmptyListWrapper>
    </DashboardPage>
  );
} 