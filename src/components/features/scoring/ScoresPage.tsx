import React, { useState } from "react";
import { Select } from "@/components/core/fields/Select";
// import { Text } from '@/components/core/typography/Text';
import { Heading } from "@/components/core/typography/Heading";
import { ScoreEntry } from "./ScoreEntry";
// import type { TextSizeToken, PaddingToken } from '@/lib/tokens/types';

interface District {
  id: string;
  name: string;
}

interface School {
  id: string;
  name: string;
  districtId: string;
}

interface Cycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Teacher {
  id: string;
  name: string;
  schoolId: string;
}

interface RubricLevel {
  value: number;
  label: string;
  description: string;
}

interface RubricLookFor {
  id: string;
  name: string;
  description: string;
  levels: RubricLevel[];
}

// Dummy data
const districts: District[] = [
  { id: "1", name: "District 1" },
  { id: "2", name: "District 2" },
];

const schools: School[] = [
  { id: "1", name: "School 1", districtId: "1" },
  { id: "2", name: "School 2", districtId: "1" },
  { id: "3", name: "School 3", districtId: "2" },
];

const cycles: Cycle[] = [
  { id: "1", name: "Cycle 1", startDate: "2024-01-01", endDate: "2024-03-31" },
  { id: "2", name: "Cycle 2", startDate: "2024-04-01", endDate: "2024-06-30" },
];

const teachers: Teacher[] = [
  { id: "1", name: "Teacher 1", schoolId: "1" },
  { id: "2", name: "Teacher 2", schoolId: "1" },
  { id: "3", name: "Teacher 3", schoolId: "2" },
];

const rubricLookFors: RubricLookFor[] = [
  {
    id: "1",
    name: "Student Engagement",
    description: "How well are students engaged in the lesson?",
    levels: [
      { value: 1, label: "Not Yet", description: "Students are not engaged" },
      {
        value: 2,
        label: "Approaching",
        description: "Some students are engaged",
      },
      { value: 3, label: "Meeting", description: "Most students are engaged" },
      {
        value: 4,
        label: "Exceeding",
        description: "All students are highly engaged",
      },
    ],
  },
  {
    id: "2",
    name: "Instructional Quality",
    description: "How effective is the instruction?",
    levels: [
      {
        value: 1,
        label: "Not Yet",
        description: "Instruction is not effective",
      },
      {
        value: 2,
        label: "Approaching",
        description: "Instruction is somewhat effective",
      },
      { value: 3, label: "Meeting", description: "Instruction is effective" },
      {
        value: 4,
        label: "Exceeding",
        description: "Instruction is highly effective",
      },
    ],
  },
];

export function ScoresPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  // Filter options based on selections
  const schoolOptions = schools
    .filter(
      (school) => !selectedDistrict || school.districtId === selectedDistrict,
    )
    .map((school) => ({ value: school.id, label: school.name }));

  const teacherOptions = teachers
    .filter((teacher) => !selectedSchool || teacher.schoolId === selectedSchool)
    .map((teacher) => ({ value: teacher.id, label: teacher.name }));

  return (
    <div className="p-6">
      <Heading level="h1" color="default" className="mb-6">
        Scoring Dashboard
      </Heading>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Select
          label="District"
          options={districts.map((d) => ({ value: d.id, label: d.name }))}
          value={selectedDistrict}
          onChange={setSelectedDistrict}
          placeholder="Select a district"
          textSize="base"
          padding="md"
        />

        <Select
          label="School"
          options={schoolOptions}
          value={selectedSchool}
          onChange={setSelectedSchool}
          placeholder="Select a school"
          textSize="base"
          padding="md"
        />

        <Select
          label="Cycle"
          options={cycles.map((c) => ({ value: c.id, label: c.name }))}
          value={selectedCycle}
          onChange={setSelectedCycle}
          placeholder="Select a cycle"
          textSize="base"
          padding="md"
        />

        <Select
          label="Teachers"
          options={teacherOptions}
          value={selectedTeachers}
          onChange={setSelectedTeachers}
          placeholder="Select teachers"
          multiple={true}
          textSize="base"
          padding="md"
        />
      </div>

      {selectedTeachers.length > 0 && selectedCycle && (
        <div className="space-y-6">
          {selectedTeachers.map((teacherId) => {
            const teacher = teachers.find((t) => t.id === teacherId);
            return (
              <div key={teacherId} className="bg-white rounded-lg shadow p-6">
                <Heading level="h2" color="default" className="mb-4">
                  {teacher?.name}
                </Heading>
                <div className="space-y-4">
                  {rubricLookFors.map((lookFor) => (
                    <ScoreEntry
                      key={lookFor.id}
                      teacherId={teacherId}
                      cycleId={selectedCycle}
                      lookFor={lookFor}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
