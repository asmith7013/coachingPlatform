"use client";

import React, { useState, useMemo, useEffect } from "react";
import KHData from "@/lib/ui/json/kh-routines.json";
import ILCData from "@/lib/ui/json/ilc-routines.json";
import ILCHSData from "@/lib/ui/json/ilc-hs.json";
import { GradeUnitLessonSelector } from "@/components/domain/imRoutine/curriculum/LessonSelector";
import { RoutineFilter } from "@/components/domain/imRoutine/routines/RoutineFilter";
import { LessonDetailView } from "@/components/domain/imRoutine/lessons/LessonView";
import { renderKHLesson } from "@/components/domain/imRoutine/utils/render-KH-lesson";
import { renderILCLesson } from "@/components/domain/imRoutine/utils/render-ILC-esson";
import { CurriculumVersionModal } from "@/components/domain/imRoutine/curriculum/CurriculumVersionSelector";
import { usePersistedCurriculumVersion } from "@/components/domain/imRoutine/utils/use-persisted-curriculum-version";
import { textSize, weight } from "@/lib/tokens/typography";
import { cn } from "@ui/utils/formatters";
import { Text } from "@/components/core/typography/Text";

// Add type definitions at the top of the file
type Version = "ILC" | "KH" | null;

export default function IMRoutinesPage() {
  const [version, setVersion] = usePersistedCurriculumVersion() as [
    Version,
    (newVersion: Version) => void,
  ];
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");

  const isHighSchool = (grade: string) =>
    ["Algebra 1", "Geometry", "Algebra 2"].includes(grade);

  // Update routinesData to dynamically switch
  const routinesData = useMemo(() => {
    if (version === "ILC" && isHighSchool(selectedGrade)) {
      return ILCHSData;
    }
    return version === "ILC" ? ILCData : KHData;
  }, [version, selectedGrade]);

  // Inject curriculum into each lesson
  const routinesWithCurriculum = useMemo(() => {
    if (!version) return [];
    const curriculumLabel: "ILC" | "Kendall Hunt" =
      version === "ILC" ? "ILC" : "Kendall Hunt";
    return routinesData.map((lesson) => ({
      ...lesson,
      curriculum: curriculumLabel,
    }));
  }, [routinesData, version]);

  const allRoutines = useMemo(() => {
    const set = new Set<string>();
    routinesWithCurriculum.forEach((lesson) =>
      lesson.activities.forEach((act) =>
        act.routines.forEach((r) => set.add(r.trim())),
      ),
    );
    return Array.from(set).sort();
  }, [routinesWithCurriculum]);

  useEffect(() => {
    if (allRoutines.length > 0) {
      setSelectedRoutines(allRoutines);
    }
  }, [allRoutines]);

  const grades = useMemo(() => {
    const middleSchoolGrades = Array.from(
      new Set(
        (version === "ILC" ? ILCData : KHData)
          .map((r) => r.grade)
          .filter((g) => ["Grade 6", "Grade 7", "Grade 8"].includes(g)),
      ),
    );

    const highSchoolGrades = Array.from(
      new Set(KHData.map((r) => r.grade).filter(isHighSchool)),
    );

    if (version === "ILC") {
      return [...middleSchoolGrades, ...highSchoolGrades];
    }

    return [...middleSchoolGrades, ...highSchoolGrades].filter((g) =>
      KHData.map((r) => r.grade).includes(g),
    );
  }, [version]);

  const units = useMemo(() => {
    if (!selectedGrade) return [];
    return Array.from(
      new Set(
        routinesWithCurriculum
          .filter((r) => !selectedGrade || r.grade === selectedGrade)
          .map((r) => r.unit),
      ),
    ).sort();
  }, [routinesWithCurriculum, selectedGrade]);

  const lessons = useMemo(() => {
    return Array.from(
      new Set(
        routinesWithCurriculum
          .filter(
            (r) =>
              (!selectedGrade || r.grade === selectedGrade) &&
              (!selectedUnit || r.unit === selectedUnit),
          )
          .map((r) => r.lessonNumber),
      ),
    ).sort((a, b) => Number(a) - Number(b));
  }, [routinesWithCurriculum, selectedGrade, selectedUnit]);

  const totalLessons = useMemo(() => {
    return routinesWithCurriculum.filter(
      (r) => r.grade === selectedGrade && r.unit === selectedUnit,
    ).length;
  }, [routinesWithCurriculum, selectedGrade, selectedUnit]);

  // Filter lessons – if a lesson is selected, only return that lesson.
  const filteredLessons = useMemo(() => {
    return routinesWithCurriculum.filter(
      (r) => r.grade === selectedGrade && r.unit === selectedUnit,
    );
  }, [routinesWithCurriculum, selectedGrade, selectedUnit]);

  // When a lesson is selected, aggregate its routines.
  const lessonRoutines = selectedLesson
    ? routinesWithCurriculum
        .find(
          (r) =>
            r.grade === selectedGrade &&
            r.unit === selectedUnit &&
            r.lessonNumber === selectedLesson,
        )
        ?.activities.flatMap((a) => a.routines)
    : [];

  // Update renderLesson logic before rendering
  const renderLesson = useMemo(() => {
    if (version === "ILC" && isHighSchool(selectedGrade)) {
      return renderILCLesson;
    }
    return version === "ILC" ? renderILCLesson : renderKHLesson;
  }, [version, selectedGrade]);

  const handleLessonSelected = () => {
    // Placeholder for future lesson selection logic
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {version === null && (
        <CurriculumVersionModal
          onSelectVersion={(selected) => {
            setVersion(selected);
            setSelectedRoutines([]);
          }}
        />
      )}

      {/* Two-column grid: main content (left) and sidebar filter (right) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Content Area (Left Column) */}
        <div className="md:col-span-3 space-y-4">
          <div
            className={cn(
              "bg-surface",
              "rounded-t-md py-4 pb-0 px-6 mb-0 border-2 border-b-0",
              "flex justify-between items-center",
              "border-outline",
            )}
          >
            <h1 className={cn(textSize.xl, weight.bold, "text-text")}>
              IM Routines Viewer
            </h1>
            {selectedGrade && selectedUnit && (
              <p className={cn(textSize.sm, "text-text", weight.bold)}>
                Unit {selectedUnit}:
                <span className={cn(weight.medium, "ml-1")}>
                  {totalLessons} Lessons
                </span>
              </p>
            )}
          </div>
          <div
            className={cn(
              "sticky top-0 z-20",
              "bg-surface",
              "rounded-b-md pb-4 py-2 px-6",
              "border-2 border-t-0",
              "border-outline",
            )}
          >
            <GradeUnitLessonSelector
              selectedGrade={selectedGrade}
              setSelectedGrade={setSelectedGrade}
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              selectedLesson={selectedLesson}
              setSelectedLesson={setSelectedLesson}
              grades={grades}
              units={units}
              lessons={lessons}
            />
          </div>
          {selectedGrade && selectedUnit && version ? (
            (() => {
              // Extract curriculum value to a variable for clarity and to avoid repetition
              const curriculumValue =
                version === "ILC" ? "ILC" : "Kendall Hunt";

              return (
                <LessonDetailView
                  lessonsData={filteredLessons}
                  selectedRoutines={selectedRoutines}
                  selectedLesson={selectedLesson}
                  setSelectedLesson={setSelectedLesson}
                  curriculum={curriculumValue}
                  renderLessonContent={(lesson, routines, isSelected) =>
                    renderLesson(lesson, routines, isSelected, curriculumValue)
                  }
                />
              );
            })()
          ) : (
            <Text className={cn(textSize.base, "text-text", "italic")}>
              Select <strong>grade</strong> and <strong>unit</strong> to view
              lesson routines.
            </Text>
          )}
        </div>

        {/* Sidebar Filter Area (Right Column) */}
        <div className="md:col-span-1">
          <div className="sticky top-4">
            {version && (
              <RoutineFilter
                allRoutines={allRoutines}
                selectedRoutines={selectedRoutines}
                setSelectedRoutines={setSelectedRoutines}
                selectedLesson={selectedLesson}
                lessonRoutines={lessonRoutines}
                onLessonSelected={handleLessonSelected}
                version={version}
                setVersion={setVersion}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
