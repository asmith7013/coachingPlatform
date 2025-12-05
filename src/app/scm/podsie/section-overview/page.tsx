"use client";

import { useState, useEffect, useMemo } from "react";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/composed/cards/Card";
import {
  getAllSectionConfigs,
  getSectionOverviewData,
  getSectionAttendanceByDateRange,
  type SectionOverviewData,
  type DailyAttendanceStats,
} from "@/app/actions/313/section-overview";
import { getSectionVelocityByDateRange, type DailyVelocityStats } from "@/app/actions/313/velocity/velocity";
import { SectionCalendar } from "./components/SectionCalendar";
import { BellScheduleDisplay } from "./components/BellScheduleDisplay";
import { AssignmentContentCards } from "./components/AssignmentContentCards";

interface SectionOption {
  id: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
}

interface SectionGroup {
  school: string;
  sections: SectionOption[];
}

export default function SectionOverviewPage() {
  // State
  const [sectionGroups, setSectionGroups] = useState<SectionGroup[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [overviewData, setOverviewData] = useState<SectionOverviewData | null>(null);
  const [attendanceData, setAttendanceData] = useState<DailyAttendanceStats[]>([]);
  const [velocityData, setVelocityData] = useState<DailyVelocityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate date range for current month
  const dateRange = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };
  }, []);

  // Load section configs on mount
  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      const result = await getAllSectionConfigs();
      if (result.success) {
        setSectionGroups(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };
    loadSections();
  }, []);

  // Load section data when section is selected
  useEffect(() => {
    if (!selectedSectionId) {
      setOverviewData(null);
      setAttendanceData([]);
      setVelocityData([]);
      return;
    }

    const loadSectionData = async () => {
      setDataLoading(true);
      setError(null);

      try {
        // Load overview data
        const overviewResult = await getSectionOverviewData(selectedSectionId);
        if (!overviewResult.success) {
          setError(overviewResult.error);
          setDataLoading(false);
          return;
        }

        setOverviewData(overviewResult.data);

        // Load attendance data
        const attendanceResult = await getSectionAttendanceByDateRange(
          overviewResult.data.config.classSection,
          dateRange.start,
          dateRange.end
        );

        if (attendanceResult.success) {
          setAttendanceData(attendanceResult.data);
        }

        // Load velocity data
        const velocityResult = await getSectionVelocityByDateRange(
          overviewResult.data.config.classSection,
          overviewResult.data.config.school,
          dateRange.start,
          dateRange.end
        );

        if (velocityResult.success) {
          setVelocityData(velocityResult.data);
        }
      } catch (err) {
        console.error("Error loading section data:", err);
        setError("Failed to load section data");
      } finally {
        setDataLoading(false);
      }
    };

    loadSectionData();
  }, [selectedSectionId, dateRange.start, dateRange.end]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Text color="muted">Loading sections...</Text>
        </div>
      </div>
    );
  }

  if (error && !overviewData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Text color="danger">{error}</Text>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Heading level="h1" className="mb-2">
          Section Overview
        </Heading>
        <Text color="muted">
          Comprehensive view of section configuration, attendance, and progress
        </Text>
      </div>

      {/* Section Selector */}
      <Card className="mb-6">
        <Card.Body>
          <div className="space-y-2">
            <label htmlFor="section-select" className="block font-medium text-sm">
              Select Section
            </label>
            <select
              id="section-select"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a section --</option>
              {sectionGroups.map((group) => (
                <optgroup key={group.school} label={group.school}>
                  {group.sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.classSection} - Grade {section.gradeLevel}
                      {section.teacher ? ` (${section.teacher})` : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </Card.Body>
      </Card>

      {/* Main Content */}
      {dataLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Text color="muted">Loading section data...</Text>
        </div>
      )}

      {!dataLoading && !selectedSectionId && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Text color="muted">Please select a section to view its overview</Text>
        </div>
      )}

      {!dataLoading && overviewData && (
        <div className="space-y-6">
          {/* Calendar with Attendance and Velocity */}
          <SectionCalendar
            config={overviewData.config}
            schoolCalendar={overviewData.schoolCalendar}
            attendanceData={attendanceData}
            velocityData={velocityData}
            currentMonth={new Date().getMonth()}
            currentYear={new Date().getFullYear()}
          />

          {/* Bell Schedule */}
          <BellScheduleDisplay bellSchedule={overviewData.config.bellSchedule} />

          {/* Assignment Content Cards */}
          <AssignmentContentCards assignmentContent={overviewData.config.assignmentContent} />
        </div>
      )}
    </div>
  );
}
