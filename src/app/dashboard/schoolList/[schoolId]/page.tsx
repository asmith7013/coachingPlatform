"use client";  // ✅ Forces this to be a Client Component

import { useParams } from "next/navigation";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";

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

    const params = useParams();  // ✅ Unwraps params
    const schoolId = String(params.schoolId);
    if (!params.schoolId) return <p>Loading...</p>;  // Handles missing params case

    const schoolStaff = staffData[schoolId] ?? [];
    const lookFors = lookForsData[schoolId] ?? [];
    const schedule = scheduleData[schoolId] ?? [];

    const lookForsTrendsData = {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            label: "LookFors Engagement",
            data: [2, 4, 6, 8], // Placeholder data
            borderColor: "blue",
            backgroundColor: "lightblue",
          },
        ],
    };

    return (
      <div>
        <h1 className="text-2xl font-bold">School {schoolId}</h1>
        
        <h2 className="mt-6 text-xl font-semibold">Staff</h2>
        <ul className="mt-2 space-y-2">
          {schoolStaff.map((staff : StaffMember) => (
            <li key={staff.id} className="p-2 bg-white shadow rounded">
              {staff.name} - <span className="text-gray-600">{staff.role}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-xl font-semibold">Look Fors</h2>
        <ul className="mt-2 space-y-2">
            {lookFors.map((lookFor : LookFor, index : number) => (
                <li key={index} className="p-2 bg-blue-100 text-blue-900 shadow rounded">{lookFor}</li>
            ))}
        </ul>
        <h2 className="mt-6 text-xl font-semibold">Schedule</h2>
        <table className="mt-2 w-full bg-white shadow rounded">
            <thead>
            <tr className="border-b">
                <th className="p-2 text-left">Period</th>
                <th className="p-2 text-left">Time</th>
            </tr>
            </thead>
            <tbody>
            {schedule.map((entry : Period, index : number) => (
                <tr key={index} className="border-b">
                <td className="p-2">{entry.period}</td>
                <td className="p-2">{entry.time}</td>
                </tr>
            ))}
            </tbody>
        </table>
        <h2 className="mt-6 text-xl font-semibold">LookFors Trends</h2>
        <div className="mt-4 w-full h-64 bg-white shadow rounded p-4">
            <Line data={lookForsTrendsData} />
        </div>
      </div>
    );
  }