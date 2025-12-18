'use client';

import { useState, useCallback, useRef } from 'react';
import type { WizardStateHook } from '../hooks/useWizardState';
import type { GradeLevel } from '../lib/types';
import { uploadMasteryCheckImage } from '../actions/upload-image';
import { analyzeProblem } from '../actions/analyze-problem';
import { MarkdownTextarea } from '@/components/core/fields/MarkdownTextarea';
import { LoadingProgress } from './LoadingProgress';

interface Step1InputsProps {
  wizard: WizardStateHook;
}

const GRADE_OPTIONS: { value: GradeLevel; label: string }[] = [
  { value: '6', label: 'Grade 6' },
  { value: '7', label: 'Grade 7' },
  { value: '8', label: 'Grade 8' },
  { value: 'Algebra 1', label: 'Algebra 1' },
];

export function Step1Inputs({ wizard }: Step1InputsProps) {
  const { state, setGradeLevel, setUnitNumber, setLessonNumber, setLessonName, setLearningGoals, setMasteryImage, setUploadedImageUrl, setAnalysis, setLoadingProgress, setError, nextStep } = wizard;

  const [learningGoalText, setLearningGoalText] = useState(state.learningGoals.join('\n'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image file selection
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setMasteryImage(file, preview);
      setError(null);
    },
    [setMasteryImage, setError]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError('Please drop an image file');
        return;
      }

      const preview = URL.createObjectURL(file);
      setMasteryImage(file, preview);
      setError(null);
    },
    [setMasteryImage, setError]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Parse learning goals from textarea
  const handleLearningGoalsChange = useCallback(
    (text: string) => {
      setLearningGoalText(text);
      const goals = text
        .split('\n')
        .map((g) => g.trim())
        .filter((g) => g.length > 0);
      setLearningGoals(goals);
    },
    [setLearningGoals]
  );

  // Analyze the problem
  const handleAnalyze = async () => {
    // Validate inputs
    if (!state.gradeLevel) {
      setError('Please select a grade level');
      return;
    }
    if (!state.masteryCheckImage.file && !state.masteryCheckImage.uploadedUrl) {
      setError('Please upload a mastery check question image');
      return;
    }

    setError(null);

    try {
      // Upload image if not already uploaded
      let imageUrl = state.masteryCheckImage.uploadedUrl;

      if (!imageUrl && state.masteryCheckImage.file) {
        setLoadingProgress({
          phase: 'uploading',
          message: 'Uploading image...',
          detail: 'Sending image to cloud storage',
          startTime: Date.now(),
        });

        const buffer = await state.masteryCheckImage.file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        const uploadResult = await uploadMasteryCheckImage(
          uint8Array,
          state.masteryCheckImage.file.name,
          state.masteryCheckImage.file.type
        );

        if (!uploadResult.success || !uploadResult.url) {
          setError(uploadResult.error || 'Failed to upload image');
          return;
        }

        imageUrl = uploadResult.url;
        setUploadedImageUrl(imageUrl);
      }

      if (!imageUrl) {
        setError('No image URL available');
        return;
      }

      // Analyze the problem
      setLoadingProgress({
        phase: 'analyzing',
        message: 'Analyzing problem with AI...',
        detail: 'Examining the problem structure, identifying strategy, and creating scenarios',
        startTime: Date.now(),
      });

      const result = await analyzeProblem({
        imageUrl,
        gradeLevel: state.gradeLevel,
        unitNumber: state.unitNumber,
        lessonNumber: state.lessonNumber,
        lessonName: state.lessonName,
        learningGoals: state.learningGoals,
      });

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to analyze problem');
        return;
      }

      // Set analysis results and move to next step
      setAnalysis(result.data);
      setLoadingProgress({ phase: 'idle', message: '' });
      nextStep();
    } catch (error) {
      console.error('Error during analysis:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Step 1: Input Information</h2>
        <p className="text-gray-600 text-sm mt-1">
          Provide the lesson details and upload a mastery check question image.
        </p>
      </div>

      <div className="space-y-5">
        {/* Grade Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grade Level <span className="text-red-500">*</span>
          </label>
          <select
            value={state.gradeLevel || ''}
            onChange={(e) => setGradeLevel(e.target.value as GradeLevel || null)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="">Select grade...</option>
            {GRADE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Unit and Lesson */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
            <input
              type="number"
              min="1"
              value={state.unitNumber || ''}
              onChange={(e) => setUnitNumber(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g., 4"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Number</label>
            <input
              type="number"
              value={state.lessonNumber ?? ''}
              onChange={(e) => setLessonNumber(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g., 1"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Lesson Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Name</label>
          <input
            type="text"
            value={state.lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            placeholder="e.g., Solving Two-Step Equations"
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Learning Goals */}
        <MarkdownTextarea
          value={learningGoalText}
          onChange={handleLearningGoalsChange}
          label="Learning Goals"
          placeholder="e.g., I can solve equations like **2x + 3 = 7** using inverse operations"
          hint="One goal per line. Use markdown for formatting."
          height={150}
        />

        {/* Mastery Check Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mastery Check Question <span className="text-red-500">*</span>
          </label>

          {state.masteryCheckImage.preview ? (
            <div className="relative">
              <img
                src={state.masteryCheckImage.preview}
                alt="Mastery check question"
                className="w-full max-h-64 object-contain rounded-lg border border-gray-300 bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  setMasteryImage(null, null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-gray-600">
                Drag and drop an image, or <span className="text-blue-600 font-medium">browse</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG, or GIF up to 10MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Loading Progress */}
        {state.isLoading && (
          <LoadingProgress progress={state.loadingProgress} />
        )}

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {state.error}
          </div>
        )}

        {/* Analyze Button */}
        <div className="pt-2">
          <button
            onClick={handleAnalyze}
            disabled={state.isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {state.isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Analyze Problem</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
