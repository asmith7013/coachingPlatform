"use client";

import { useMemo, useState, useEffect } from "react";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Group } from "@visx/group";
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

// Lighter versions of the colors for backgrounds - muted pastels
const SKILL_COLORS_LIGHT = [
  "#f5e6d3", // muted peach
  "#d4e8e4", // muted teal
  "#d9e4f5", // muted blue
  "#e8dff5", // muted purple
  "#f5dfe8", // muted pink
  "#f5f0d4", // muted yellow
  "#dfe2f5", // muted indigo
  "#f5d9d9", // muted red
  "#d4eef5", // muted cyan
  "#d9f0e0", // muted green
];

export function SkillGanttChart({
  lessons,
  width = 1200,
  height: baseHeight = 500,
  onLessonClick,
  selectedLessonId = null,
}: SkillGanttChartProps) {
  const margin = { top: 100, right: 40, bottom: 40, left: 40 };

  const [skillsData, setSkillsData] = useState<Map<string, RoadmapsSkill>>(new Map());
  const [hoveredLessonIndex, setHoveredLessonIndex] = useState<number | null>(null);
  const [showPrerequisites, setShowPrerequisites] = useState(false);

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
  // Separate target skills and prerequisite skills
  const ganttData = useMemo(() => {
    // First, collect all target skills
    const targetSkills = allSkills.map((skill) => {
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
        end: lastLesson + 1,
        lessons: lessonsWithSkill.map((item) => item.lesson),
        isTarget: true,
      };
    }).filter((item) => item !== null);

    // Now collect all unique prerequisite skills across all target skills
    const prerequisiteMap = new Map<string, {
      skillNumber: string;
      title: string;
      type: 'essential' | 'helpful' | 'both';
      lessonSpans: Array<{ start: number; end: number; parentSkill: string }>;
    }>();

    allSkills.forEach((skill) => {
      const skillData = skillsData.get(skill);
      if (!skillData) return;

      // Find the lesson span for this target skill
      const targetSkillData = targetSkills.find(t => t?.skill === skill);
      if (!targetSkillData) return;

      const essentialSet = new Set(skillData.essentialSkills?.map(s => s.skillNumber) || []);
      const helpfulSet = new Set(skillData.helpfulSkills?.map(s => s.skillNumber) || []);

      // Process essential skills
      skillData.essentialSkills?.forEach(prereq => {
        const existing = prerequisiteMap.get(prereq.skillNumber);
        const type = helpfulSet.has(prereq.skillNumber) ? 'both' : 'essential';

        if (existing) {
          // Add this lesson span
          existing.lessonSpans.push({
            start: targetSkillData.start,
            end: targetSkillData.end,
            parentSkill: skill
          });
          // Update type if it's now both
          if (type === 'both' || existing.type === 'both') {
            existing.type = 'both';
          } else if ((existing.type === 'essential' && helpfulSet.has(prereq.skillNumber)) ||
                     (existing.type === 'helpful' && essentialSet.has(prereq.skillNumber))) {
            existing.type = 'both';
          }
        } else {
          prerequisiteMap.set(prereq.skillNumber, {
            skillNumber: prereq.skillNumber,
            title: prereq.title,
            type,
            lessonSpans: [{
              start: targetSkillData.start,
              end: targetSkillData.end,
              parentSkill: skill
            }]
          });
        }
      });

      // Process helpful skills
      skillData.helpfulSkills?.forEach(prereq => {
        const existing = prerequisiteMap.get(prereq.skillNumber);
        const type = essentialSet.has(prereq.skillNumber) ? 'both' : 'helpful';

        if (existing) {
          existing.lessonSpans.push({
            start: targetSkillData.start,
            end: targetSkillData.end,
            parentSkill: skill
          });
          if (type === 'both' || existing.type === 'both') {
            existing.type = 'both';
          } else if ((existing.type === 'essential' && helpfulSet.has(prereq.skillNumber)) ||
                     (existing.type === 'helpful' && essentialSet.has(prereq.skillNumber))) {
            existing.type = 'both';
          }
        } else {
          prerequisiteMap.set(prereq.skillNumber, {
            skillNumber: prereq.skillNumber,
            title: prereq.title,
            type,
            lessonSpans: [{
              start: targetSkillData.start,
              end: targetSkillData.end,
              parentSkill: skill
            }]
          });
        }
      });
    });

    // Convert prerequisite map to array
    const prerequisiteSkills = Array.from(prerequisiteMap.values()).map(prereq => ({
      skill: prereq.skillNumber,
      title: prereq.title,
      type: prereq.type,
      lessonSpans: prereq.lessonSpans,
      isTarget: false,
    }));

    // Return target skills first, then prerequisite skills
    return [...targetSkills, ...prerequisiteSkills];
  }, [allSkills, lessons, skillsData]);

  // Calculate dynamic height based on total skills
  const { height, innerHeight } = useMemo(() => {
    let totalHeight = baseHeight;

    if (showPrerequisites) {
      // Count prerequisite skills (non-target skills)
      const prereqCount = ganttData.filter(item => item && !item.isTarget).length;
      // Each prerequisite adds roughly 30px (smaller bar height + spacing)
      const prereqExtraHeight = prereqCount * 30;
      totalHeight = baseHeight + prereqExtraHeight;
    }

    return {
      height: totalHeight,
      innerHeight: totalHeight - margin.top - margin.bottom,
    };
  }, [baseHeight, showPrerequisites, ganttData, margin.top, margin.bottom]);

  const innerWidth = width - margin.left - margin.right;

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
    () => {
      // When showing prerequisites, include all skills (target + prerequisite)
      // Otherwise just target skills
      const domain = showPrerequisites
        ? ganttData.map(item => item?.skill || '').filter(Boolean)
        : allSkills;

      return scaleBand<string>({
        domain,
        range: [12, innerHeight], // Start at 12px to add spacing after section row (pb-3)
        padding: 0.2, // Normal padding for all skills
      });
    },
    [allSkills, ganttData, innerHeight, showPrerequisites]
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm py-6 mb-6">
      <div className="flex items-center justify-between mb-3 px-6">
        <h3 className="text-sm font-semibold text-gray-900">Skill Progression Timeline</h3>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showPrerequisites}
            onChange={(e) => setShowPrerequisites(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span>Show Essential & Helpful Skills</span>
        </label>
      </div>

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
                      fill="#f3f4f6"
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

            {/* Section bars - rendered after grid lines to cover them */}
            {(() => {
              // Group lessons by section to create section spans
              const sectionGroups: { section: string; start: number; end: number; index: number }[] = [];
              let currentSection = lessons[0]?.section || '';
              let startIndex = 0;
              let sectionIndex = 0;

              lessons.forEach((lesson, index) => {
                const lessonSection = lesson.section || '';
                if (lessonSection !== currentSection) {
                  sectionGroups.push({
                    section: currentSection,
                    start: startIndex,
                    end: index,
                    index: sectionIndex
                  });
                  currentSection = lessonSection;
                  startIndex = index;
                  sectionIndex++;
                }
              });

              // Add the last section
              if (lessons.length > 0) {
                sectionGroups.push({
                  section: currentSection,
                  start: startIndex,
                  end: lessons.length,
                  index: sectionIndex
                });
              }

              return sectionGroups.map((group) => {
                const barX = xScale(group.start);
                const barWidth = xScale(group.end) - xScale(group.start);
                const barHeight = 20; // Fixed narrow height
                const barY = -15; // Position below lesson titles

                // Use lighter greyscale colors with same dark border for all
                const color = '#4b5563'; // gray-600 - same darkness for all borders
                const greyScaleLight = ['#f3f4f6', '#d1d5db']; // gray-100 and gray-300
                const lightColor = greyScaleLight[group.index % greyScaleLight.length];

                return (
                  <g key={`section-${group.start}`}>
                    {/* Section bar background with rounded corners - same styling as skill bars */}
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={lightColor}
                      fillOpacity={1}
                      stroke={color}
                      strokeWidth={2}
                      rx={4}
                    />
                    {/* Section label */}
                    <text
                      x={barX + barWidth / 2}
                      y={barY + barHeight / 2}
                      fontSize={11}
                      fontWeight={600}
                      fill="#1f2937"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {group.section ? `Section ${group.section}` : 'No Section'}
                    </text>
                  </g>
                );
              });
            })()}

            {/* Separator line between target skills and prerequisites */}
            {showPrerequisites && (() => {
              // Find the last target skill's Y position
              const lastTargetSkill = ganttData.findLast(item => item?.isTarget);
              if (lastTargetSkill) {
                const separatorY = (yScale(lastTargetSkill.skill) ?? 0) + yScale.bandwidth() + 5;
                return (
                  <line
                    x1={0}
                    y1={separatorY}
                    x2={innerWidth}
                    y2={separatorY}
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="4,4"
                    opacity={0.6}
                  />
                );
              }
              return null;
            })()}

            {/* Gantt bars */}
            {ganttData.map((item, index) => {
              if (!item) return null;

              // Skip prerequisite skills if toggle is off
              if (!item.isTarget && !showPrerequisites) return null;

              const barHeight = yScale.bandwidth();
              const barY = yScale(item.skill) ?? 0;

              // For target skills, render normal bar
              if (item.isTarget && 'start' in item && 'end' in item) {
                const barX = xScale(item.start);
                const barWidth = xScale(item.end) - xScale(item.start);
                const color = SKILL_COLORS[index % SKILL_COLORS.length];
                const lightColor = SKILL_COLORS_LIGHT[index % SKILL_COLORS_LIGHT.length];
                const skillData = skillsData.get(item.skill);
                const skillTitle = skillData?.title || "";

                // Calculate available width for text
                const circleWidth = 28;
                const padding = 16;
                const availableWidth = barWidth - circleWidth - padding - 8;

                // Word wrap logic
                const charsPerLine = Math.floor(availableWidth / 7);
                const words = skillTitle.split(' ');
                const lines: string[] = [];
                let currentLine = '';

                words.forEach((word: string) => {
                  const testLine = currentLine ? `${currentLine} ${word}` : word;
                  if (testLine.length <= charsPerLine) {
                    currentLine = testLine;
                  } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                  }
                });
                if (currentLine) lines.push(currentLine);

                const displayLines = lines;

                return (
                  <g key={`target-${item.skill}`}>
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={lightColor}
                      fillOpacity={1}
                      stroke={color}
                      strokeWidth={2}
                      rx={4}
                    >
                      <title>{skillTitle}</title>
                    </rect>
                    <g transform={`translate(${barX + 8}, ${barY + barHeight / 2})`}>
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
              }

              // For prerequisite skills, render multiple bars for each lesson span
              if (!item.isTarget && 'type' in item && 'lessonSpans' in item) {
                const prereqType = item.type;
                let prereqColor, prereqLightColor;
                if (prereqType === 'essential' || prereqType === 'both') {
                  prereqColor = '#C855C8'; // skill-essential
                  prereqLightColor = '#f1e1f1'; // skill-essential-100
                } else { // helpful
                  prereqColor = '#009FB7'; // skill-helpful
                  prereqLightColor = '#ccebf1'; // skill-helpful-100
                }

                const prereqHeight = barHeight * 0.6; // 60% of target skill height
                const skillTitle = item.title || "";

                return (
                  <g key={`prereq-${item.skill}`}>
                    {/* Render a bar for each lesson span */}
                    {item.lessonSpans.map((span: { start: number; end: number; parentSkill: string }, spanIndex: number) => {
                    const barX = xScale(span.start);
                    const barWidth = xScale(span.end) - xScale(span.start);

                    // Calculate available width for text
                    const circleWidth = 18;
                    const padding = 10;
                    const availableWidth = barWidth - circleWidth - padding - 6;

                      // Word wrap
                      const charsPerLine = Math.floor(availableWidth / 5.5);
                      const words = skillTitle.split(' ');
                      const lines: string[] = [];
                      let currentLine = '';

                      words.forEach((word: string) => {
                        const testLine = currentLine ? `${currentLine} ${word}` : word;
                        if (testLine.length <= charsPerLine) {
                          currentLine = testLine;
                        } else {
                          if (currentLine) lines.push(currentLine);
                          currentLine = word;
                        }
                      });
                      if (currentLine) lines.push(currentLine);

                      const displayLines = lines.slice(0, 2); // max 2 lines

                      return (
                      <g key={`${item.skill}-span-${spanIndex}`}>
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={prereqHeight}
                          fill={prereqLightColor}
                          fillOpacity={1}
                          stroke={prereqColor}
                          strokeWidth={1.5}
                          rx={3}
                        >
                          <title>{skillTitle}</title>
                        </rect>
                        <g transform={`translate(${barX + 5}, ${barY + prereqHeight / 2})`}>
                          <circle
                            cx={9}
                            cy={0}
                            r={9}
                            fill={prereqColor}
                            stroke={prereqColor}
                            strokeWidth={1.5}
                          >
                            <title>{skillTitle}</title>
                          </circle>
                          <text
                            x={9}
                            y={0}
                            fontSize={7}
                            fontWeight={700}
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="central"
                            pointerEvents="none"
                          >
                            {item.skill}
                          </text>
                          {displayLines.map((line, lineIndex) => {
                            const yOffset = displayLines.length === 1
                              ? 0
                              : (lineIndex - (displayLines.length - 1) / 2) * 9;
                            return (
                              <text
                                key={lineIndex}
                                x={21}
                                y={yOffset}
                                fontSize={8}
                                fontWeight={500}
                                fill="#374151"
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
                  </g>
                );
              }

              return null;
            })}

          </Group>
        </svg>
      </div>

      <div className="mt-3 text-xs text-gray-600 px-6">
        Showing progression of {allSkills.length} skill{allSkills.length !== 1 ? 's' : ''} across {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
