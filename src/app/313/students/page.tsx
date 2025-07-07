"use client";

import React, { useState, useCallback, useMemo } from "react";
import { DashboardPage } from '@components/composed/layouts/DashboardPage';
import { Table } from '@components/composed/tables/Table';
import { Select } from '@components/core/fields/Select';
import { Text } from '@components/core/typography/Text';
import { Button } from '@components/core/Button';
import { Badge } from '@components/core/feedback/Badge';
import { useStudents } from "@hooks/domain/313/useStudents";
import { Student } from "@/lib/schema/zod-schema/313/student";
import { SummerDistricts, SummerSections, SummerTeachers, SummerSectionsType, SummerTeachersType } from "@/lib/schema/enum/313";
import type { TableColumnSchema } from '@ui/table-schema';
import { EmptyListWrapper } from '@components/core/empty/EmptyListWrapper';
import { UserGroupIcon } from '@heroicons/react/24/outline';

// Helper function to map districts to sections/teachers
const getDistrictMapping = () => {
  return {
    "D11": {
      sections: ["SRF", "SR6", "SR7", "SR8"] as SummerSectionsType[],
      teachers: ["ISAAC", "SCERRA"] as SummerTeachersType[]
    },
    "D9": {
      sections: ["SR1", "SR2", "SR3"] as SummerSectionsType[],
      teachers: ["BANIK", "VIVAR"] as SummerTeachersType[]
    }
  };
};

export default function StudentViewerPage() {
  // Hooks
  const { 
    items: students = [], 
    isLoading, 
    error 
  } = useStudents.list();
  
  const { updateWithToast } = useStudents.withNotifications();
  
  // Filter state
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  
  // Get district mapping
  const districtMapping = useMemo(() => getDistrictMapping(), []);
  
  // Filter available teachers and sections based on selected district
  const availableTeachers = useMemo(() => {
    if (!selectedDistrict) return SummerTeachers;
    return districtMapping[selectedDistrict as keyof typeof districtMapping]?.teachers || [];
  }, [selectedDistrict, districtMapping]);
  
  const availableSections = useMemo(() => {
    if (!selectedDistrict) return SummerSections;
    return districtMapping[selectedDistrict as keyof typeof districtMapping]?.sections || [];
  }, [selectedDistrict, districtMapping]);
  
  // Filtered students based on selected filters
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (selectedDistrict) {
        const studentTeachers = Array.isArray(student.teacher) ? student.teacher : [student.teacher];
        const studentSections = Array.isArray(student.section) ? student.section : [student.section];
        
        const teacherInDistrict = studentTeachers.some(t => availableTeachers.includes(t as SummerTeachersType));
        const sectionInDistrict = studentSections.some(s => availableSections.includes(s as SummerSectionsType));
        
        if (!teacherInDistrict || !sectionInDistrict) return false;
      }
      
      if (selectedTeacher) {
        const studentTeachers = Array.isArray(student.teacher) ? student.teacher : [student.teacher];
        if (!studentTeachers.includes(selectedTeacher as SummerTeachersType)) return false;
      }
      
      if (selectedSection) {
        const studentSections = Array.isArray(student.section) ? student.section : [student.section];
        if (!studentSections.includes(selectedSection as SummerSectionsType)) return false;
      }
      
      return true;
    });
  }, [students, selectedDistrict, selectedTeacher, selectedSection, availableTeachers, availableSections]);
  
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
      await updateWithToast(studentId, { section: [newSection as SummerSectionsType] });
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  }, [updateWithToast]);
  
  const handleTeacherChange = useCallback(async (studentId: string, newTeacher: string) => {
    try {
      await updateWithToast(studentId, { teacher: [newTeacher as SummerTeachersType] });
    } catch (error) {
      console.error('Failed to update teacher:', error);
    }
  }, [updateWithToast]);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedDistrict("");
    setSelectedTeacher("");
    setSelectedSection("");
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
          <Text textSize="xs" color="muted">{row.username}</Text>
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
            { value: "6 (Rising 7)", label: "6 (Rising 7)" },
            { value: "7 (Rising 8)", label: "7 (Rising 8)" },
            { value: "8 (Rising 9)", label: "8 (Rising 9)" }
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
      accessor: (row) => {
        const currentSections = Array.isArray(row.section) ? row.section : [row.section];
        const currentSection = currentSections[0] || "";
        
        return (
          <Select
            options={availableSections.map(section => ({ value: section, label: section }))}
            value={currentSection}
            onChange={(value) => handleSectionChange(row._id, value)}
            placeholder="Select section"
            textSize="sm"
            padding="sm"
          />
        );
      },
      width: '120px'
    },
    {
      id: 'teacher',
      label: 'Teacher',
      accessor: (row) => {
        const currentTeachers = Array.isArray(row.teacher) ? row.teacher : [row.teacher];
        const currentTeacher = currentTeachers[0] || "";
        
        return (
          <Select
            options={availableTeachers.map(teacher => ({ value: teacher, label: teacher }))}
            value={currentTeacher}
            onChange={(value) => handleTeacherChange(row._id, value)}
            placeholder="Select teacher"
            textSize="sm"
            padding="sm"
          />
        );
      },
      width: '120px'
    },
    {
      id: 'email',
      label: 'Email',
      accessor: (row) => (
        <Text textSize="sm" color="muted">
          {row.email || 'N/A'}
        </Text>
      ),
      width: '200px'
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
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col">
            <Text textSize="sm" className="mb-2 font-medium">District</Text>
            <Select
              options={[
                { value: "", label: "All Districts" },
                ...SummerDistricts.map(district => ({ value: district, label: district }))
              ]}
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              placeholder="Select district"
              className="w-40"
            />
          </div>
          
          <div className="flex flex-col">
            <Text textSize="sm" className="mb-2 font-medium">Teacher</Text>
            <Select
              options={[
                { value: "", label: "All Teachers" },
                ...availableTeachers.map(teacher => ({ value: teacher, label: teacher }))
              ]}
              value={selectedTeacher}
              onChange={setSelectedTeacher}
              placeholder="Select teacher"
              className="w-40"
            />
          </div>
          
          <div className="flex flex-col">
            <Text textSize="sm" className="mb-2 font-medium">Section</Text>
            <Select
              options={[
                { value: "", label: "All Sections" },
                ...availableSections.map(section => ({ value: section, label: section }))
              ]}
              value={selectedSection}
              onChange={setSelectedSection}
              placeholder="Select section"
              className="w-40"
            />
          </div>
          
          <div className="flex flex-col justify-end">
            <Button
              intent="secondary"
              appearance="outline"
              onClick={clearFilters}
              className="mt-6"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="mb-4">
        <Text textSize="sm" color="muted">
          Showing {filteredStudents.length} of {students.length} students
          {(selectedDistrict || selectedTeacher || selectedSection) && (
            <span className="ml-2">
              (filtered by: {[
                selectedDistrict && `District: ${selectedDistrict}`,
                selectedTeacher && `Teacher: ${selectedTeacher}`,
                selectedSection && `Section: ${selectedSection}`
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