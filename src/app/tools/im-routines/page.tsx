'use client';

import React, { useState, useMemo } from 'react';
import routinesData from '@lib/json/IM_Routines.json';
import { GradeUnitLessonSelector } from '@/components/features/imRoutine/GradeUnitLessonSelector';
import { RoutineFilter } from '@/components/features/imRoutine/RoutineFilter';
import { LessonDetailView } from '@/components/features/imRoutine/LessonDetailView';
import { LessonCompactView } from '@/components/features/imRoutine/LessonCompactView';

export default function IMRoutinesPage() {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [detailedView, setDetailedView] = useState(true);

  const allRoutines = useMemo(() => {
    const set = new Set<string>();
    routinesData.forEach((lesson) =>
      lesson.activities.forEach((act) =>
        act.routines.forEach((r) => set.add(r.trim()))
      )
    );
    return Array.from(set).sort();
  }, []);

  const [selectedRoutines, setSelectedRoutines] = useState<string[]>(allRoutines);

  const grades = useMemo(() => {
    const unique = Array.from(new Set(routinesData.map((r) => r.grade)));
    return unique.sort();
  }, []);

  const units = useMemo(() => {
    return Array.from(
      new Set(
        routinesData
          .filter((r) => !selectedGrade || r.grade === selectedGrade)
          .map((r) => r.unit)
      )
    ).sort();
  }, [selectedGrade]);

  const lessons = useMemo(() => {
    return Array.from(
      new Set(
        routinesData
          .filter(
            (r) =>
              (!selectedGrade || r.grade === selectedGrade) &&
              (!selectedUnit || r.unit === selectedUnit)
          )
          .map((r) => r.lessonNumber)
      )
    ).sort((a, b) => Number(a) - Number(b));
  }, [selectedGrade, selectedUnit]);

  const totalLessons = useMemo(() => {
    return routinesData.filter(
      (r) => r.grade === selectedGrade && r.unit === selectedUnit
    ).length;
  }, [selectedGrade, selectedUnit]);

  // Filter lessons – if a lesson is selected, only return that lesson.
  const filteredLessons = useMemo(() => {
    const lessons = routinesData.filter(
      (r) => r.grade === selectedGrade && r.unit === selectedUnit
    );
    if (selectedLesson) {
      return lessons.filter((r) => r.lessonNumber === selectedLesson);
    }
    return lessons;
  }, [selectedGrade, selectedUnit, selectedLesson]);

  // When a lesson is selected, aggregate its routines.
  const lessonRoutines = selectedLesson
    ? routinesData.find(
        (r) =>
          r.grade === selectedGrade &&
          r.unit === selectedUnit &&
          r.lessonNumber === selectedLesson
      )?.activities.flatMap((activity) => activity.routines) || []
    : [];

  const handleLessonSelected = () => {
    // if (selectedLesson) setDetailedView(true);
    
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Two-column grid: main content (left) and sidebar filter (right) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Content Area (Left Column) */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-t-md py-4 pb-0 px-6 mb-0 border-2 border-b-0 flex justify-between items-center border-black">
            <h1 className="text-2xl font-bold">IM Routines Viewer</h1>
            {selectedGrade && selectedUnit && (
              <p className="text-sm font-light">
                Unit {selectedUnit}:
                <span className="font-bold ml-1">{totalLessons} Lessons</span>
              </p>
            )}
          </div>
          <div className="sticky top-0 z-20 bg-white rounded-b-md pb-4 py-2 px-6 border-2 border-t-0 border-black">
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
          {selectedGrade && selectedUnit ? (
            detailedView ? (
              <LessonDetailView
                lessonsData={filteredLessons}
                selectedRoutines={selectedRoutines}
              />
            ) : (
              <LessonCompactView
                lessonsData={filteredLessons}
                selectedRoutines={selectedRoutines}
              />
            )
          ) : (
            <p className="text-gray-900 italic">
              Select <strong>grade</strong> and <strong>unit</strong> to view lesson routines.
            </p>
          )}
        </div>

        {/* Sidebar Filter Area (Right Column) */}
        <div className="md:col-span-1">
          <div className="sticky top-4">
            <RoutineFilter
              allRoutines={allRoutines}
              selectedRoutines={selectedRoutines}
              setSelectedRoutines={setSelectedRoutines}
              selectedLesson={selectedLesson}
              lessonRoutines={lessonRoutines}
              onLessonSelected={handleLessonSelected}
              setDetailedView={setDetailedView}
              detailedView={detailedView}
            />
          </div>
        </div>
      </div>
    </div>
  );
}