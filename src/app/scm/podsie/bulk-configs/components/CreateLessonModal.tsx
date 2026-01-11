'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/components/core/feedback/Spinner';
import { createScopeAndSequence } from '@/app/actions/scm/scope-and-sequence/scope-and-sequence';
import {
  GRADE_OPTIONS,
  SECTION_OPTIONS,
  LESSON_TYPE_OPTIONS,
  SCOPE_SEQUENCE_TAG_OPTIONS,
} from '@zod-schema/scm/scope-and-sequence/scope-and-sequence';

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (lessonId: string) => void;
  /** Pre-fill lesson name from the unmatched assignment */
  initialLessonName?: string;
  /** Pre-fill scope tag from the section config */
  initialScopeTag?: string;
}

export function CreateLessonModal({
  isOpen,
  onClose,
  onCreated,
  initialLessonName = '',
  initialScopeTag,
}: CreateLessonModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [grade, setGrade] = useState<string>('8');
  const [unit, setUnit] = useState('');
  const [unitLessonId, setUnitLessonId] = useState('');
  const [unitNumber, setUnitNumber] = useState<number>(1);
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [lessonName, setLessonName] = useState(initialLessonName);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<string>('assessment');
  const [section, setSection] = useState<string>('Unit Assessment');
  const [scopeSequenceTag, setScopeSequenceTag] = useState<string>(initialScopeTag || 'Grade 8');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLessonName(initialLessonName);
      setScopeSequenceTag(initialScopeTag || 'Grade 8');
      setError(null);

      // Auto-detect grade from initial lesson name (e.g., "Mid-Unit Assessment 8.3" -> grade 8)
      const gradeMatch = initialLessonName.match(/(\d+)\.\d+/);
      if (gradeMatch) {
        const detectedGrade = gradeMatch[1];
        if (GRADE_OPTIONS.includes(detectedGrade as typeof GRADE_OPTIONS[number])) {
          setGrade(detectedGrade);
        }
      }

      // Auto-detect unit number from initial lesson name
      const unitMatch = initialLessonName.match(/(\d+)\.(\d+)/);
      if (unitMatch) {
        setUnitNumber(parseInt(unitMatch[1]));
      }

      // Set lessonTitle to be same as lessonName initially
      setLessonTitle(initialLessonName);
    }
  }, [isOpen, initialLessonName, initialScopeTag]);

  // Auto-generate unitLessonId when unitNumber changes
  useEffect(() => {
    if (lessonType === 'assessment') {
      // For assessments, use unit number with suffix
      const suffix = lessonName.toLowerCase().includes('mid-unit') ? 'MU' : '1';
      setUnitLessonId(`${unitNumber}.${suffix}`);
    }
  }, [unitNumber, lessonType, lessonName]);

  // Auto-update unit name when unitNumber or grade changes
  useEffect(() => {
    setUnit(`Unit ${unitNumber}`);
  }, [unitNumber]);

  // Auto-update scopeSequenceTag when grade changes
  useEffect(() => {
    if (grade === 'Algebra 1') {
      setScopeSequenceTag('Algebra 1');
    } else {
      setScopeSequenceTag(`Grade ${grade}`);
    }
  }, [grade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await createScopeAndSequence({
        grade: grade as '6' | '7' | '8' | 'Algebra 1',
        unit,
        unitLessonId,
        unitNumber,
        lessonNumber,
        lessonName,
        lessonTitle: lessonTitle || lessonName,
        lessonType: lessonType as 'lesson' | 'rampUp' | 'assessment',
        section: section as typeof SECTION_OPTIONS[number],
        scopeSequenceTag: scopeSequenceTag as typeof SCOPE_SEQUENCE_TAG_OPTIONS[number],
        roadmapSkills: [],
        targetSkills: [],
        standards: [],
        learningTargets: [],
        ownerIds: [],
      });

      if (result.success && result.data) {
        onCreated(String(result.data._id));
        onClose();
      } else {
        setError(result.error || 'Failed to create lesson');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Lesson Entry
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Grade, Scope Tag */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g === 'Algebra 1' ? 'Algebra 1' : `Grade ${g}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope/Sequence Tag
                </label>
                <select
                  value={scopeSequenceTag}
                  onChange={(e) => setScopeSequenceTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SCOPE_SEQUENCE_TAG_OPTIONS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Unit Number, Unit Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Number *
                </label>
                <input
                  type="number"
                  min="1"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Name *
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., Unit 3 - Linear Relationships"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Row 3: Lesson Type, Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Type *
                </label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {LESSON_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type === 'lesson' ? 'Lesson' : type === 'rampUp' ? 'Ramp Up' : 'Assessment'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section *
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {SECTION_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 4: Unit Lesson ID, Lesson Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Lesson ID *
                </label>
                <input
                  type="text"
                  value={unitLessonId}
                  onChange={(e) => setUnitLessonId(e.target.value)}
                  placeholder="e.g., 3.MU or 3.15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Number *
                </label>
                <input
                  type="number"
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Row 5: Lesson Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Name *
              </label>
              <input
                type="text"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                placeholder="e.g., Mid-Unit Assessment 8.3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Row 6: Lesson Title (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Title
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Optional - defaults to lesson name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" variant="default" />
                    Creating...
                  </>
                ) : (
                  'Create Lesson'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
