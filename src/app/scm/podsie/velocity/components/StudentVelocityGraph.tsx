import React, { useState, lazy, Suspense, useMemo } from "react";
import type { StudentDailyData, DailyVelocityStats } from "@/app/actions/313/velocity/velocity";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import { VelocityChartSkeleton } from "./VelocityGraphSkeleton";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Lazy load the heavy Chart.js component
const VelocityLineChart = lazy(() =>
  import("./VelocityLineChart").then((module) => ({
    default: module.VelocityLineChart,
  }))
);

// Extended color palette for students (more colors needed than sections)
const STUDENT_COLORS = [
  '#0EA5E9', // sky-500
  '#EF4444', // red-500
  '#22C55E', // green-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
  '#14B8A6', // teal-500
  '#A855F7', // purple-500
  '#84CC16', // lime-500
  '#3B82F6', // blue-500
  '#DC2626', // red-600
  '#16A34A', // green-600
  '#D97706', // amber-600
  '#7C3AED', // violet-600
  '#DB2777', // pink-600
  '#0891B2', // cyan-600
  '#EA580C', // orange-600
];

// Colors for filter group average lines
const GROUP_COLORS = [
  '#1F2937', // gray-800 (default for first group)
  '#7C3AED', // violet-600
  '#059669', // emerald-600
  '#DC2626', // red-600
  '#2563EB', // blue-600
];

// Create a stable color map for students
function getStudentColors(students: StudentDailyData[]): Map<number, string> {
  const colorMap = new Map<number, string>();
  students.forEach((student, index) => {
    colorMap.set(student.studentId, STUDENT_COLORS[index % STUDENT_COLORS.length]);
  });
  return colorMap;
}

// Filter group type
interface FilterGroup {
  id: string;
  selectedStudents: Set<number>;
  name: string;
}

interface StudentVelocityGraphProps {
  sectionName: string;
  school: string;
  students: StudentDailyData[];
  velocityData: DailyVelocityStats[]; // For block type info
  startDate: string;
  endDate: string;
  daysOff: string[];
  showRampUps: boolean;
  embedded?: boolean; // When true, removes the outer wrapper/shadow
}

export function StudentVelocityGraph({
  sectionName,
  school,
  students,
  velocityData,
  startDate,
  endDate,
  daysOff,
  showRampUps,
  embedded = false,
}: StudentVelocityGraphProps) {
  const [showRollingAverage, setShowRollingAverage] = useState(true);
  const [adjustForBlockType, setAdjustForBlockType] = useState(true);
  const [showFilterGroupsOnly, setShowFilterGroupsOnly] = useState(false);

  // Multiple filter groups - start with one group containing first 5 students
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(() => [{
    id: 'group-1',
    selectedStudents: new Set(students.slice(0, 5).map(s => s.studentId)),
    name: 'Group 1',
  }]);

  // Memoize student colors so they stay consistent
  const studentColors = useMemo(() => getStudentColors(students), [students]);

  if (!students || students.length === 0) return null;

  // Build block type map from velocity data
  const blockTypeMap = new Map<string, 'single' | 'double' | 'none'>();
  velocityData.forEach(d => blockTypeMap.set(d.date, d.blockType));

  // Helper to check if a date is a weekend
  const isWeekend = (dateStr: string): boolean => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Helper to check if a date is a school day
  const isSchoolDay = (dateStr: string): boolean => {
    return !isWeekend(dateStr) && !daysOff.includes(dateStr);
  };

  // Process student data (for individual student lines when not in "filter groups only" mode)
  const processStudentData = (studentIds: Set<number>) => {
    const filteredStudents = students.filter(s => studentIds.has(s.studentId));

    return filteredStudents.map((student) => {
      const dailyData = Object.entries(student.dailyProgress)
        .filter(([date]) => date >= startDate && date <= endDate)
        .filter(([date]) => isSchoolDay(date))
        .filter(([, data]) => data.attendance !== 'not-tracked')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => {
          const blockType = blockTypeMap.get(date) || 'none';
          const completions = showRampUps ? data.totalCompletions : data.lessons;
          let velocity = completions;
          if (adjustForBlockType && blockType === 'double') {
            velocity = completions / 2;
          }
          return { date, velocity, completions, blockType, attendance: data.attendance };
        });

      const dataWithRollingAverage = dailyData.map((dataPoint, idx) => {
        const precedingDays = dailyData.slice(Math.max(0, idx - 2), idx + 1);
        const rollingAverage = precedingDays.reduce((sum, d) => sum + d.velocity, 0) / precedingDays.length;
        return { ...dataPoint, rollingAverage };
      });

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        color: studentColors.get(student.studentId) || '#6B7280',
        processedData: dataWithRollingAverage,
      };
    });
  };

  // Get all selected students across all groups
  const allSelectedStudents = new Set<number>();
  filterGroups.forEach(group => {
    group.selectedStudents.forEach(id => allSelectedStudents.add(id));
  });

  // Process data for all selected students (for individual lines)
  const processedStudents = processStudentData(allSelectedStudents);

  // Get all unique dates across all students
  const allDates = new Set<string>();
  processedStudents.forEach((student) => {
    student.processedData.forEach((d) => allDates.add(d.date));
  });
  const sortedDates = Array.from(allDates).sort();

  // Calculate combined average for a filter group
  const calculateGroupAverage = (group: FilterGroup) => {
    const groupStudents = processStudentData(group.selectedStudents);

    const combinedAverageData = sortedDates.map((dateStr) => {
      const velocitiesForDate = groupStudents
        .map((student) => {
          const dataPoint = student.processedData.find((d) => d.date === dateStr);
          return dataPoint ? dataPoint.velocity : null;
        })
        .filter((v): v is number => v !== null);

      if (velocitiesForDate.length === 0) return null;
      return velocitiesForDate.reduce((sum, v) => sum + v, 0) / velocitiesForDate.length;
    });

    // Calculate 3-day rolling average
    const rollingAverage = combinedAverageData.map((value, idx) => {
      if (value === null) return null;
      const precedingValues: number[] = [];
      for (let i = Math.max(0, idx - 2); i <= idx; i++) {
        if (combinedAverageData[i] !== null) {
          precedingValues.push(combinedAverageData[i] as number);
        }
      }
      if (precedingValues.length === 0) return null;
      return precedingValues.reduce((sum, v) => sum + v, 0) / precedingValues.length;
    });

    return { combinedAverageData, rollingAverage };
  };

  // Create datasets for each filter group's average line
  const groupDatasets = filterGroups.map((group, groupIndex) => {
    const { combinedAverageData, rollingAverage } = calculateGroupAverage(group);
    const color = GROUP_COLORS[groupIndex % GROUP_COLORS.length];

    return {
      label: filterGroups.length === 1 ? 'Average of Selections' : `${group.name} Average`,
      data: showRollingAverage ? rollingAverage : combinedAverageData,
      borderColor: color,
      backgroundColor: color,
      fill: false,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: color,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      borderWidth: 3,
      spanGaps: true,
      groupIndex, // Custom property to identify in tooltip
    };
  });

  // Create individual student datasets (only shown when not in "filter groups only" mode)
  const studentDatasets = !showFilterGroupsOnly ? processedStudents.map((student) => {
    const dataMap = new Map(student.processedData.map((d) => [d.date, d]));

    return {
      label: student.studentName.split(' ')[0],
      data: sortedDates.map((dateStr) => {
        const dataPoint = dataMap.get(dateStr);
        if (!dataPoint) return null;
        return showRollingAverage ? dataPoint.rollingAverage : dataPoint.velocity;
      }),
      borderColor: student.color,
      backgroundColor: student.color,
      fill: false,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBackgroundColor: student.color,
      pointBorderColor: "#fff",
      pointBorderWidth: 1,
      spanGaps: false,
    };
  }) : [];

  // Prepare chart data
  const chartData = {
    labels: sortedDates.map((dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }),
    datasets: [...groupDatasets, ...studentDatasets],
  };

  // Calculate max velocity for Y-axis
  const maxVelocity = Math.max(
    0,
    ...processedStudents.flatMap((student) =>
      student.processedData.map((d) =>
        showRollingAverage ? d.rollingAverage : d.velocity
      )
    )
  );

  const yAxisMax = Math.max(1.5, Math.ceil(maxVelocity * 10) / 10 + 0.2);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 10,
          font: { size: 10 },
        },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context: { dataset: { label?: string }; raw: unknown; datasetIndex: number; dataIndex: number }) {
            const value = Number(context.raw) || 0;
            const numGroupDatasets = groupDatasets.length;

            // Check if this is a group average dataset
            if (context.datasetIndex < numGroupDatasets) {
              const group = filterGroups[context.datasetIndex];
              const groupLabel = filterGroups.length === 1 ? 'Average of Selections' : `${group.name} Average`;
              if (showRollingAverage) {
                return [`${groupLabel}:`, `3-Day Avg: ${value.toFixed(2)}`];
              } else {
                return [`${groupLabel}:`, `Avg Velocity: ${value.toFixed(2)}`];
              }
            }

            // Individual student datasets
            const studentIndex = context.datasetIndex - numGroupDatasets;
            const studentData = processedStudents[studentIndex];
            if (!studentData) return '';

            const dateStr = sortedDates[context.dataIndex];
            const dataPoint = studentData.processedData.find((d) => d.date === dateStr);
            if (!dataPoint) return '';

            const studentName = studentData.studentName;
            if (showRollingAverage) {
              return [
                `${studentName}:`,
                `3-Day Avg: ${value.toFixed(2)}`,
                `Today: ${dataPoint.velocity.toFixed(1)} (${dataPoint.completions} completions)`,
                adjustForBlockType && dataPoint.blockType === 'double' ? '(Adjusted for double block)' : '',
              ].filter(Boolean);
            } else {
              return [
                `${studentName}:`,
                `Completions: ${dataPoint.completions}`,
                adjustForBlockType && dataPoint.blockType === 'double' ? '(Adjusted for double block)' : '',
              ].filter(Boolean);
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yAxisMax,
        ticks: { stepSize: 0.2 },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        title: { display: true, text: "Completions", font: { size: 12 } },
      },
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } },
      },
    },
  };

  // Filter group management functions
  const addFilterGroup = () => {
    const newGroupNumber = filterGroups.length + 1;
    setFilterGroups(prev => [...prev, {
      id: `group-${Date.now()}`,
      selectedStudents: new Set<number>(),
      name: `Group ${newGroupNumber}`,
    }]);
  };

  const removeFilterGroup = (groupId: string) => {
    if (filterGroups.length <= 1) return; // Keep at least one group
    setFilterGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const toggleStudentInGroup = (groupId: string, studentId: number) => {
    setFilterGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;
      const next = new Set(group.selectedStudents);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return { ...group, selectedStudents: next };
    }));
  };

  const selectAllInGroup = (groupId: string) => {
    setFilterGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;
      return { ...group, selectedStudents: new Set(students.map(s => s.studentId)) };
    }));
  };

  const deselectAllInGroup = (groupId: string) => {
    setFilterGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;
      return { ...group, selectedStudents: new Set() };
    }));
  };

  // Check if any group has selections
  const hasAnySelections = filterGroups.some(g => g.selectedStudents.size > 0);

  const content = (
    <>
      {/* Filter Groups */}
      <div className="space-y-4">
        {filterGroups.map((group, groupIndex) => {
          const isAllSelected = students.every(s => group.selectedStudents.has(s.studentId));
          const isSomeSelected = group.selectedStudents.size > 0 && group.selectedStudents.size < students.length;
          const groupColor = GROUP_COLORS[groupIndex % GROUP_COLORS.length];

          return (
            <div
              key={group.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {!embedded && groupIndex === 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{sectionName}</h3>
                      <p className="text-xs text-gray-500">{school}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: groupColor }}
                    />
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      {filterGroups.length === 1 ? 'Filter Group' : group.name}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  {/* Select All checkbox */}
                  <div className="flex gap-2 items-center">
                    <div className="flex h-5 shrink-0 items-center">
                      <div className="group grid size-4 grid-cols-1">
                        <input
                          id={`select-all-${group.id}`}
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isSomeSelected;
                          }}
                          onChange={() => isAllSelected ? deselectAllInGroup(group.id) : selectAllInGroup(group.id)}
                          className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
                        />
                        <svg fill="none" viewBox="0 0 14 14" className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white">
                          <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-has-checked:opacity-100" />
                          <path d="M3 7H11" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-has-indeterminate:opacity-100" />
                        </svg>
                      </div>
                    </div>
                    <label htmlFor={`select-all-${group.id}`} className="text-xs text-gray-600 cursor-pointer">
                      Select All
                    </label>
                  </div>
                  {/* Remove group button (only show if more than 1 group) */}
                  {filterGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFilterGroup(group.id)}
                      className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                      title="Remove filter group"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Student checkboxes grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
                {students.map((student) => {
                  const isSelected = group.selectedStudents.has(student.studentId);
                  const color = studentColors.get(student.studentId) || '#6B7280';

                  return (
                    <div key={student.studentId} className="flex gap-2 items-center">
                      <div className="flex h-5 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                          <input
                            id={`student-${group.id}-${student.studentId}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudentInGroup(group.id, student.studentId)}
                            className="col-start-1 row-start-1 appearance-none rounded-sm border-2 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
                            style={{
                              borderColor: color,
                              backgroundColor: isSelected ? color : 'white',
                            }}
                          />
                          <svg fill="none" viewBox="0 0 14 14" className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white">
                            <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-has-checked:opacity-100" />
                          </svg>
                        </div>
                      </div>
                      <label htmlFor={`student-${group.id}-${student.studentId}`} className="text-sm text-gray-600 cursor-pointer truncate">
                        {student.studentName}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add Filter Group button */}
        <button
          type="button"
          onClick={addFilterGroup}
          className="w-full border border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400 cursor-pointer transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add Filter Group
        </button>
      </div>

      {/* Graph */}
      <div className="mt-6">
        {!hasAnySelections ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
            Select students to view their velocity trends
          </div>
        ) : (
          <Suspense fallback={<VelocityChartSkeleton />}>
            <VelocityLineChart chartData={chartData} chartOptions={chartOptions} />
          </Suspense>
        )}
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <ToggleSwitch
          checked={showRollingAverage}
          onChange={setShowRollingAverage}
          label="Rolling Average"
        />
        <ToggleSwitch
          checked={adjustForBlockType}
          onChange={setAdjustForBlockType}
          label="Adjust for Block Type"
        />
        <ToggleSwitch
          checked={showFilterGroupsOnly}
          onChange={setShowFilterGroupsOnly}
          label="Filter Groups Only"
        />
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      {content}
    </div>
  );
}
