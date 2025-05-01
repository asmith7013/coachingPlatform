"use client";  // ✅ Forces this to be a Client Component

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { Card } from '@components/composed/cards/Card';
import { Heading } from '@components/core/typography/Heading';
import { Text } from '@components/core/typography/Text';
import { typography } from '@ui-tokens/tokens';
import { paddingY, stack } from '@ui-tokens/tokens';
import { cn } from '@ui/utils/formatters';
import { DashboardPage } from '@components/layouts/DashboardPage';
import { Badge } from '@components/core/feedback/Badge';
import { fetchNYCPSStaff } from "@actions/staff";
import { NYCPSStaff } from "@domain-types/staff";
import { School } from "@domain-types/school";
import { fetchSchools } from "@actions/schools/schools";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

type StaffMember = {
    id: number;
    name: string;
    role: string;
};

type LookFor = string;

type Period = { period: string; time: string };

const scheduleData: Record<string,Period[]> = {
    "1": [
      { period: "1", time: "8:00 - 8:45 AM" },
      { period: "2", time: "8:50 - 9:35 AM" },
    ],
    "2": [
      { period: "1", time: "7:30 - 8:15 AM" },
      { period: "2", time: "8:20 - 9:05 AM" },
    ],
};

const lookForsData: Record<string, LookFor[]> = {
    "1": ["Clear Learning Target", "Multiple Representations", "Student Discourse"],
    "2": ["Checking for Understanding", "Explicit Modeling", "Academic Language Use"],
};

const staffData: Record<string, StaffMember[]> = {
    "1": [
      { id: 1, name: "Mr. Johnson", role: "Math Teacher" },
      { id: 2, name: "Ms. Lee", role: "Assistant Principal" },
    ],
    "2": [
      { id: 1, name: "Mrs. Rodriguez", role: "ELA Teacher" },
      { id: 2, name: "Mr. Patel", role: "Dean of Students" },
    ],
  };
  
export default function SchoolDetail() {
  const params = useParams<{ schoolId: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [_staff, setStaff] = useState<NYCPSStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const schoolId = params.schoolId;
        if (!schoolId) {
          setError("No school ID provided");
          setLoading(false);
          return;
        }
        
        // Fetch school details
        const schoolsResponse = await fetchSchools({ 
          filters: { _id: schoolId } 
        });
        
        if (schoolsResponse.items.length === 0) {
          setError("School not found");
          setLoading(false);
          return;
        }
        
        const schoolData = schoolsResponse.items[0];
        setSchool(schoolData as School);
        
        // Fetch staff associated with this school
        const staffResponse = await fetchNYCPSStaff({ 
          filters: { schools: [schoolId] } 
        });
        
        setStaff(staffResponse.items as NYCPSStaff[]);
        setLoading(false);
      } catch (err) {
        console.error("Error loading school data:", err);
        setError("Failed to load school data");
        setLoading(false);
      }
    }
    
    loadData();
  }, [params.schoolId]);

  if (loading) return (
    <DashboardPage title="School Details">
      <Text textSize="base">Loading school details...</Text>
    </DashboardPage>
  );

  if (error || !school) return (
    <DashboardPage title="School Details">
      <Text textSize="base" color="danger">{error || "Failed to load school"}</Text>
    </DashboardPage>
  );

  const schoolStaff = staffData[school._id] ?? [];
  const lookFors = lookForsData[school._id] ?? [];
  const schedule = scheduleData[school._id] ?? [];

  const lookForsTrendsData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "LookFors Engagement",
        data: [2, 4, 6, 8],
        borderColor: "blue",
        backgroundColor: "lightblue",
      },
    ],
  };

  return (
    <DashboardPage title={school.schoolName}>
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-3xl">{school.emoji || '🏫'}</div>
          <div>
            <Heading level="h2">{school.schoolName}</Heading>
            <Text textSize="base" color="muted" className="mt-1">
              District: {school.district}
            </Text>
            {school.address && (
              <Text textSize="base" color="muted" className="mt-1">
                {school.address}
              </Text>
            )}
          </div>
        </div>
        
        <Heading level="h3" className="mt-6 mb-2">Grade Levels</Heading>
        <div className="flex flex-wrap gap-2">
          {school.gradeLevelsSupported?.map((grade, index) => (
            <Badge key={index}>{grade}</Badge>
          ))}
        </div>
      </Card>
      
      <Heading level="h3" className="mt-8 mb-4">Staff</Heading>
      {schoolStaff.length === 0 ? (
        <Text>No staff members associated with this school yet.</Text>
      ) : (
        <div className="flex flex-wrap gap-4">
          {schoolStaff.map((person) => (
            <Badge key={person.id}>{person.name}</Badge>
          ))}
        </div>
      )}

      <Card className={stack.md} padding="md" radius="lg">
        <Heading level="h2" className={cn(typography.weight.medium, 'text-primary', stack.md)}>
          Look Fors
        </Heading>
        <div className="flex flex-wrap gap-2">
          {lookFors.map((lookFor : LookFor, index : number) => (
            <span 
              key={index} 
              className={cn(
                paddingY.sm,
                'bg-primary',
                'text-white',
                'rounded-full text-sm'
              )}
            >
              {lookFor}
            </span>
          ))}
        </div>
      </Card>

      <Card className={stack.md} padding="md" radius="lg">
        <Heading level="h2" className={cn(typography.weight.medium, 'text-primary', stack.md)}>
          Schedule
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface">
                <th className={`${paddingY.sm} text-left text-text`}>Period</th>
                <th className={`${paddingY.sm} text-left text-text`}>Time</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((entry : Period, index : number) => (
                <tr key={index} className="border-b border-surface">
                  <td className={cn(paddingY.sm, 'text-text')}>{entry.period}</td>
                  <td className={cn(paddingY.sm, 'text-text')}>{entry.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className={stack.md} padding="md" radius="lg">
        <Heading level="h2" className={cn(typography.weight.medium, 'text-primary', stack.md)}>
          LookFors Trends
        </Heading>
        <div className="w-full h-64">
          <Line data={lookForsTrendsData} />
        </div>
      </Card>
    </DashboardPage>
  );
}