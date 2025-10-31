"use client";

import { useMemo, useState, useEffect } from "react";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";

interface Lesson {
  _id: string;
  lessonNumber: number;
  lessonName: string;
  section?: string;
  targetSkills?: string[];
  roadmapSkills?: string[];
}

interface SkillGanttChartProps {
  lessons: Lesson[];
  width?: number;
  height?: number;
  onLessonClick?: (lessonId: string) => void;
  selectedLessonId?: string | null;
}

// Generate distinct colors for each skill row
const SKILL_COLORS = [
  "#f97316", // orange
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#eab308", // yellow
  "#6366f1", // indigo
  "#ef4444", // red
  "#06b6d4", // cyan
  "#10b981", // green
];

export function SkillGanttChart({
  lessons,
  width = 1200,
  height = 500,
  onLessonClick,
  selectedLessonId = null,
}: SkillGanttChartProps) {
  const margin = { top: 100, right: 40, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const [skillsData, setSkillsData] = useState<Map<string, RoadmapsSkill>>(new Map());
  const [hoveredLessonIndex, setHoveredLessonIndex] = useState<number | null>(null);

  // Extract all unique skills across all lessons, sorted by first appearance
  const allSkills = useMemo(() => {
    const skillFirstAppearance = new Map<string, number>();

    lessons.forEach((lesson, lessonIndex) => {
      lesson.roadmapSkills?.forEach((skill) => {
        if (!skillFirstAppearance.has(skill)) {
          skillFirstAppearance.set(skill, lessonIndex);
        }
      });
    });

    return Array.from(skillFirstAppearance.keys()).sort((a, b) => {
      const aIndex = skillFirstAppearance.get(a) ?? 0;
      const bIndex = skillFirstAppearance.get(b) ?? 0;
      return aIndex - bIndex;
    });
  }, [lessons]);

  // Fetch skill data
  useEffect(() => {
    if (allSkills.length === 0) return;

    const fetchSkills = async () => {
      try {
        const result = await fetchRoadmapsSkillsByNumbers(allSkills);
        if (result.success && result.data) {
          const skillMap = new Map<string, RoadmapsSkill>();
          result.data.forEach((skill) => {
            skillMap.set(skill.skillNumber, skill);
          });
          setSkillsData(skillMap);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };

    fetchSkills();
  }, [allSkills]);

  // Create data structure for the gantt chart
  // For each skill, find the first and last lesson it appears in
  const ganttData = useMemo(() => {
    return allSkills.map((skill) => {
      const lessonsWithSkill = lessons
        .map((lesson, index) => ({
          lesson,
          index,
          hasSkill: lesson.roadmapSkills?.includes(skill),
        }))
        .filter((item) => item.hasSkill);

      if (lessonsWithSkill.length === 0) {
        return null;
      }

      const firstLesson = lessonsWithSkill[0].index;
      const lastLesson = lessonsWithSkill[lessonsWithSkill.length - 1].index;

      return {
        skill,
        start: firstLesson,
        end: lastLesson + 1, // +1 to make it inclusive
        lessons: lessonsWithSkill.map((item) => item.lesson),
      };
    }).filter((item) => item !== null);
  }, [allSkills, lessons]);

  // Scales
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, lessons.length],
        range: [0, innerWidth],
      }),
    [lessons.length, innerWidth]
  );

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        domain: allSkills,
        range: [0, innerHeight],
        padding: 0.2,
      }),
    [allSkills, innerHeight]
  );

  if (ganttData.length === 0 || lessons.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Skill Gantt Chart</h3>
        <p className="text-sm text-gray-500">No skills to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Skill Progression Timeline</h3>

      <style>{`
        svg title {
          pointer-events: none;
        }
      `}</style>

      <div className="overflow-x-auto">
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            {/* Grid lines */}
            <GridRows
              scale={yScale}
              width={innerWidth}
              strokeDasharray="2,2"
              stroke="#e5e7eb"
              strokeOpacity={0.7}
            />

            {/* Alternating lesson column backgrounds and interactive overlays */}
            {lessons.map((lesson, index) => {
              const columnWidth = xScale(1) - xScale(0);
              const isEven = index % 2 === 0;
              const isHovered = hoveredLessonIndex === index;
              const isSelected = selectedLessonId === lesson._id;

              return (
                <g key={`bg-${lesson._id}`}>
                  {/* Static background for even columns */}
                  {isEven && (
                    <rect
                      x={xScale(index)}
                      y={-80}
                      width={columnWidth}
                      height={innerHeight + 80}
                      fill="#f9fafb"
                      opacity={0.5}
                      pointerEvents="none"
                    />
                  )}
                  {/* Hover/selected highlight */}
                  {(isHovered || isSelected) && (
                    <rect
                      x={xScale(index)}
                      y={-80}
                      width={columnWidth}
                      height={innerHeight + 80}
                      fill={isSelected ? "#bfdbfe" : "#dbeafe"}
                      opacity={isSelected ? 0.6 : 0.4}
                      pointerEvents="none"
                    />
                  )}
                  {/* Interactive overlay */}
                  <rect
                    x={xScale(index)}
                    y={-80}
                    width={columnWidth}
                    height={innerHeight + 80}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredLessonIndex(index)}
                    onMouseLeave={() => setHoveredLessonIndex(null)}
                    onClick={() => onLessonClick?.(lesson._id)}
                  />
                </g>
              );
            })}

            {/* Lesson titles at the top */}
            {lessons.map((lesson, index) => {
              const x = xScale(index) + (xScale(1) - xScale(0)) / 2;
              const columnWidth = xScale(1) - xScale(0);
              const lessonLabel = `Lesson ${lesson.lessonNumber}`;

              // Word wrap the lesson name
              const maxCharsPerLine = Math.floor(columnWidth / 6);
              const words = lesson.lessonName.split(' ');
              const lines: string[] = [];
              let currentLine = '';

              words.forEach(word => {
                if ((currentLine + word).length <= maxCharsPerLine) {
                  currentLine += (currentLine ? ' ' : '') + word;
                } else {
                  if (currentLine) lines.push(currentLine);
                  currentLine = word;
                }
              });
              if (currentLine) lines.push(currentLine);

              // Limit to 3 lines
              const displayLines = lines.slice(0, 3);
              if (lines.length > 3) {
                displayLines[2] = displayLines[2].substring(0, maxCharsPerLine - 3) + '...';
              }

              return (
                <g key={lesson._id}>
                  {/* Lesson number */}
                  <text
                    x={x}
                    y={-65}
                    fontSize={13}
                    fontWeight={700}
                    fill="#1f2937"
                    textAnchor="middle"
                  >
                    {lessonLabel}
                  </text>
                  {/* Lesson name - wrapped */}
                  {displayLines.map((line, lineIndex) => (
                    <text
                      key={lineIndex}
                      x={x}
                      y={-48 + (lineIndex * 12)}
                      fontSize={10}
                      fill="#6b7280"
                      textAnchor="middle"
                    >
                      {line}
                    </text>
                  ))}
                  {/* Vertical grid line */}
                  <line
                    x1={xScale(index)}
                    y1={-80}
                    x2={xScale(index)}
                    y2={innerHeight}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                    opacity={0.5}
                  />
                </g>
              );
            })}

            {/* Right boundary line */}
            <line
              x1={innerWidth}
              y1={-80}
              x2={innerWidth}
              y2={innerHeight}
              stroke="#e5e7eb"
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.5}
            />

            {/* Gantt bars */}
            {ganttData.map((item, index) => {
              if (!item) return null;

              const barHeight = yScale.bandwidth();
              const barY = yScale(item.skill) ?? 0;
              const barX = xScale(item.start);
              const barWidth = xScale(item.end) - xScale(item.start);
              const color = SKILL_COLORS[index % SKILL_COLORS.length];
              const skillData = skillsData.get(item.skill);
              const skillTitle = skillData?.title || "";

              // Calculate available width for text (bar width minus circle, padding, and margins)
              const circleWidth = 28; // circle diameter
              const padding = 16; // left and right padding
              const availableWidth = barWidth - circleWidth - padding - 8; // 8px extra margin

              // Word wrap logic - split into lines that fit within available width
              const charsPerLine = Math.floor(availableWidth / 7); // ~7px per character at font size 11
              const words = skillTitle.split(' ');
              const lines: string[] = [];
              let currentLine = '';

              words.forEach(word => {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                if (testLine.length <= charsPerLine) {
                  currentLine = testLine;
                } else {
                  if (currentLine) lines.push(currentLine);
                  currentLine = word;
                }
              });
              if (currentLine) lines.push(currentLine);

              // Limit to 2 lines and add ellipsis if needed
              const maxLines = 2;
              const displayLines = lines.slice(0, maxLines);
              let isTruncated = lines.length > maxLines;

              if (lines.length > maxLines) {
                const lastLine = displayLines[maxLines - 1];
                if (lastLine.length > charsPerLine - 3) {
                  displayLines[maxLines - 1] = lastLine.substring(0, charsPerLine - 3) + '...';
                } else {
                  displayLines[maxLines - 1] = lastLine + '...';
                }
              }

              return (
                <g key={item.skill}>
                  {/* Light background bar */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={color}
                    fillOpacity={0.15}
                    stroke={color}
                    strokeWidth={2}
                    rx={4}
                  >
                    <title>{skillTitle}</title>
                  </rect>
                  {/* Skill circle badge and title */}
                  <g transform={`translate(${barX + 8}, ${barY + barHeight / 2})`}>
                    {/* Circular badge */}
                    <circle
                      cx={14}
                      cy={0}
                      r={14}
                      fill={color}
                      stroke={color}
                      strokeWidth={2}
                    >
                      <title>{skillTitle}</title>
                    </circle>
                    <text
                      x={14}
                      y={0}
                      fontSize={10}
                      fontWeight={700}
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="central"
                      pointerEvents="none"
                    >
                      {item.skill}
                    </text>
                    {/* Title - wrapped to multiple lines */}
                    {displayLines.map((line, lineIndex) => {
                      const yOffset = displayLines.length === 1
                        ? 0
                        : (lineIndex - (displayLines.length - 1) / 2) * 12;
                      return (
                        <text
                          key={lineIndex}
                          x={34}
                          y={yOffset}
                          fontSize={11}
                          fontWeight={600}
                          fill="#1f2937"
                          textAnchor="start"
                          dominantBaseline="central"
                          pointerEvents="none"
                        >
                          {line}
                        </text>
                      );
                    })}
                  </g>
                </g>
              );
            })}

          </Group>
        </svg>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        Showing progression of {allSkills.length} skill{allSkills.length !== 1 ? 's' : ''} across {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
