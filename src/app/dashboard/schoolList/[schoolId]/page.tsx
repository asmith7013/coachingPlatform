"use client";  // ✅ Forces this to be a Client Component

import { useParams } from "next/navigation";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { typography } from '@/lib/ui/tokens';
import { paddingY, stack } from '@/lib/ui/tokens/spacing';
import { cn } from '@/lib/utils';

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
  
export default function SchoolPage() {
    const params = useParams();
    const schoolId = String(params.schoolId);
    if (!params.schoolId) return <Text>Loading...</Text>;

    const schoolStaff = staffData[schoolId] ?? [];
    const lookFors = lookForsData[schoolId] ?? [];
    const schedule = scheduleData[schoolId] ?? [];

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
      <div className={`container mx-auto ${paddingY.lg}`}>
        <Heading level="h1" className={cn(typography.weight.bold, 'text-primary')}>
          School {schoolId}
        </Heading>
        
        <Card className={stack.md} padding="md" radius="lg">
          <Heading level="h2" className={cn(typography.weight.medium, 'text-primary', stack.md)}>
            Staff
          </Heading>
          <div className={stack.md}>
            {schoolStaff.map((staff : StaffMember) => (
              <Card key={staff.id} className={stack.sm} padding="sm" radius="md">
                <Text>{staff.name}</Text>
                <Text color="muted">{staff.role}</Text>
              </Card>
            ))}
          </div>
        </Card>

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
      </div>
    );
  }