'use client';

import React, { useState, useMemo } from 'react';
import KHData from '@lib/json/IM_Routines.json';
import ILCData from '@lib/json/ILC_routines.json';
import { GradeUnitLessonSelector } from '@/components/features/imRoutine/GradeUnitLessonSelector';
import { RoutineFilter } from '@/components/features/imRoutine/RoutineFilter';
import { LessonDetailView } from '@/components/features/imRoutine/LessonDetailView';
import { renderKHLesson } from '@/lib/imRoutine/renderKHLesson';
import { renderILCLesson } from '@/lib/imRoutine/renderILCLesson';
import { CurriculumVersionModal } from '@/components/features/imRoutine/CurriculumVersionModal';
import { usePersistedCurriculumVersion } from '@/lib/hooks/usePersistedCurriculumVersion';
import { typography } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/typography/Text';

export default function IMRoutinesPage() {
  const [version, setVersion] = usePersistedCurriculumVersion();
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');

  // Get the correct data based on version
  const routinesData = useMemo(() => {
    return version === 'ILC' ? ILCData : KHData;
  }, [version]);

  const allRoutines = useMemo(() => {
    const set = new Set<string>();
    routinesData.forEach((lesson) =>
      lesson.activities.forEach((act) =>
        act.routines.forEach((r) => set.add(r.trim()))
      )
    );
    return Array.from(set).sort();
  }, [routinesData]);

  const grades = useMemo(() => {
    const unique = Array.from(new Set(routinesData.map((r) => r.grade)));
    return unique.sort();
  }, [routinesData]);

  const units = useMemo(() => {
    if (!selectedGrade) return [];
    return Array.from(
      new Set(
        routinesData
          .filter((r) => !selectedGrade || r.grade === selectedGrade)
          .map((r) => r.unit)
      )
    ).sort();
  }, [routinesData, selectedGrade]);

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
  }, [routinesData, selectedGrade, selectedUnit]);

  const totalLessons = useMemo(() => {
    return routinesData.filter(
      (r) => r.grade === selectedGrade && r.unit === selectedUnit
    ).length;
  }, [routinesData, selectedGrade, selectedUnit]);

  // Filter lessons – if a lesson is selected, only return that lesson.
  const filteredLessons = useMemo(() => {
    const lessons = routinesData.filter(
      (r) => r.grade === selectedGrade && r.unit === selectedUnit
    );
    return selectedLesson
      ? lessons.filter((l) => l.lessonNumber === selectedLesson)
      : lessons;
  }, [routinesData, selectedGrade, selectedUnit, selectedLesson]);

  // When a lesson is selected, aggregate its routines.
  const lessonRoutines = selectedLesson
    ? routinesData.find(
        (r) =>
          r.grade === selectedGrade &&
          r.unit === selectedUnit &&
          r.lessonNumber === selectedLesson
      )?.activities.flatMap((a) => a.routines)
    : [];

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
          <div className={cn(
            'bg-surface',
            'rounded-t-md py-4 pb-0 px-6 mb-0 border-2 border-b-0',
            'flex justify-between items-center',
            'border-outline'
          )}>
            <h1 className={cn(typography.text.xl, typography.weight.bold, 'text-text')}>
              IM Routines Viewer
            </h1>
            {selectedGrade && selectedUnit && (
              <p className={cn(typography.text.sm, 'text-text', typography.weight.bold)}>
                Unit {selectedUnit}:
                <span className={cn(typography.weight.medium, 'ml-1')}>
                  {totalLessons} Lessons
                </span>
              </p>
            )}
          </div>
          <div className={cn(
            'sticky top-0 z-20',
            'bg-surface',
            'rounded-b-md pb-4 py-2 px-6',
            'border-2 border-t-0',
            'border-outline'
          )}>
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
            <LessonDetailView
              lessonsData={filteredLessons}
              selectedRoutines={selectedRoutines}
              renderLesson={version === 'ILC' ? renderILCLesson : renderKHLesson}
            />
          ) : (
            <Text className={cn(typography.text.base, 'text-text', 'italic')}>
              Select <strong>grade</strong> and <strong>unit</strong> to view lesson routines.
            </Text>
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
              version={version!}
              setVersion={setVersion}
            />
          </div>
        </div>
      </div>
    </div>
  );
}