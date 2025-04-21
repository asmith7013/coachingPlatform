'use client';

import React, { useState, useMemo, useEffect } from 'react';
import KHData from '@lib/json/KH_Routines.json';
import ILCData from '@lib/json/ILC_routines.json';
import ILCHSData from '@lib/json/ILC_HS.json';
import { GradeUnitLessonSelector } from '@/components/features/imRoutine/GradeUnitLessonSelector';
import { RoutineFilter } from '@/components/features/imRoutine/RoutineFilter';
import { LessonDetailView } from '@/components/features/imRoutine/LessonDetailView';
import { renderKHLesson } from '@/lib/imRoutine/renderKHLesson';
import { renderILCLesson } from '@/lib/imRoutine/renderILCLesson';
import { CurriculumVersionModal } from '@/components/features/imRoutine/CurriculumVersionModal';
import { usePersistedCurriculumVersion } from '@/lib/hooks/usePersistedCurriculumVersion';
import { textSize, weight } from '@/lib/ui/tokens/typography';
import { cn } from '@/lib/utils';
import { Text } from '@/components/core/typography/Text';

export default function IMRoutinesPage() {
  const [version, setVersion] = usePersistedCurriculumVersion();
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');

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
    const curriculumLabel: 'ILC' | 'Kendall Hunt' = version === 'ILC' ? 'ILC' : 'Kendall Hunt';
    return routinesData.map((lesson) => ({
      ...lesson,
      curriculum: curriculumLabel,
    }));
  }, [routinesData, version]);

  const allRoutines = useMemo(() => {
    const set = new Set<string>();
    routinesWithCurriculum.forEach((lesson) =>
      lesson.activities.forEach((act) =>
        act.routines.forEach((r) => set.add(r.trim()))
      )
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
        (version === 'ILC' ? ILCData : KHData)
          .map((r) => r.grade)
          .filter((g) => ["Grade 6", "Grade 7", "Grade 8"].includes(g))
      )
    );

    const highSchoolGrades = Array.from(
      new Set(
        KHData.map((r) => r.grade).filter(isHighSchool)
      )
    );

    if (version === "ILC") {
      return [...middleSchoolGrades, ...highSchoolGrades];
    }

    return [...middleSchoolGrades, ...highSchoolGrades].filter((g) =>
      (KHData.map((r) => r.grade).includes(g))
    );
  }, [version]);

  const units = useMemo(() => {
    if (!selectedGrade) return [];
    return Array.from(
      new Set(
        routinesWithCurriculum
          .filter((r) => !selectedGrade || r.grade === selectedGrade)
          .map((r) => r.unit)
      )
    ).sort();
  }, [routinesWithCurriculum, selectedGrade]);

  const lessons = useMemo(() => {
    return Array.from(
      new Set(
        routinesWithCurriculum
          .filter(
            (r) =>
              (!selectedGrade || r.grade === selectedGrade) &&
              (!selectedUnit || r.unit === selectedUnit)
          )
          .map((r) => r.lessonNumber)
      )
    ).sort((a, b) => Number(a) - Number(b));
  }, [routinesWithCurriculum, selectedGrade, selectedUnit]);

  const totalLessons = useMemo(() => {
    return routinesWithCurriculum.filter(
      (r) => r.grade === selectedGrade && r.unit === selectedUnit
    ).length;
  }, [routinesWithCurriculum, selectedGrade, selectedUnit]);

  // Filter lessons – if a lesson is selected, only return that lesson.
  const filteredLessons = useMemo(() => {
    return routinesWithCurriculum.filter(
      (r) => r.grade === selectedGrade && r.unit === selectedUnit
    );
  }, [routinesWithCurriculum, selectedGrade, selectedUnit]);

  // When a lesson is selected, aggregate its routines.
  const lessonRoutines = selectedLesson
    ? routinesWithCurriculum.find(
        (r) =>
          r.grade === selectedGrade &&
          r.unit === selectedUnit &&
          r.lessonNumber === selectedLesson
      )?.activities.flatMap((a) => a.routines)
    : [];

  // Update renderLesson logic before rendering
  const renderLesson = useMemo(() => {
    if (version === "ILC" && isHighSchool(selectedGrade)) {
      return renderKHLesson;
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
          <div className={cn(
            'bg-surface',
            'rounded-t-md py-4 pb-0 px-6 mb-0 border-2 border-b-0',
            'flex justify-between items-center',
            'border-outline'
          )}>
            <h1 className={cn(textSize.xl, weight.bold, 'text-text')}>
              IM Routines Viewer
            </h1>
            {selectedGrade && selectedUnit && (
              <p className={cn(textSize.sm, 'text-text', weight.bold)}>
                Unit {selectedUnit}:
                <span className={cn(weight.medium, 'ml-1')}>
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
          {selectedGrade && selectedUnit && version ? (
            <LessonDetailView
              lessonsData={filteredLessons}
              selectedRoutines={selectedRoutines}
              selectedLesson={selectedLesson}
              setSelectedLesson={setSelectedLesson}
              renderLesson={(lesson, selectedRoutines, isSelected) =>
                renderLesson(lesson, selectedRoutines, isSelected, version === 'ILC' ? 'ILC' : 'Kendall Hunt')
              }
              curriculum={version === 'ILC' ? 'ILC' : 'Kendall Hunt'}
            />
          ) : (
            <Text className={cn(textSize.base, 'text-text', 'italic')}>
              Select <strong>grade</strong> and <strong>unit</strong> to view lesson routines.
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
                _selectedLesson={selectedLesson}
                _lessonRoutines={lessonRoutines}
                _onLessonSelected={handleLessonSelected}
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