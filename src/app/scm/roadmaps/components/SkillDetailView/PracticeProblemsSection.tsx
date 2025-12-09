"use client";

import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { PracticeProblem } from "@zod-schema/313/curriculum/roadmap-skill";

interface PracticeProblemsSectionProps {
  practiceProblems: PracticeProblem[];
  skillNumber: string;
  skillTitle?: string;
  skillColor?: 'green' | 'orange' | 'purple';
  onAddToQueue?: (problem: PracticeProblem, skillNumber: string, skillTitle: string, skillColor: 'green' | 'orange' | 'purple') => void;
  isInQueue?: (skillNumber: string, problemNumber: number | string) => boolean;
}

export function PracticeProblemsSection({
  practiceProblems,
  skillNumber,
  skillTitle = '',
  skillColor = 'green',
  onAddToQueue,
  isInQueue,
}: PracticeProblemsSectionProps) {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reset currentProblemIndex when skill changes
  useEffect(() => {
    setCurrentProblemIndex(0);
  }, [skillNumber]);

  if (!practiceProblems || practiceProblems.length === 0) return null;

  const currentProblem = practiceProblems[currentProblemIndex];
  if (!currentProblem) return null;

  const nextProblem = () => {
    setCurrentProblemIndex((prev) => (prev + 1) % practiceProblems.length);
  };

  const prevProblem = () => {
    setCurrentProblemIndex((prev) =>
      prev === 0 ? practiceProblems.length - 1 : prev - 1
    );
  };

  return (
    <>
      <div className="border-b border-gray-200 py-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Practice Problems ({practiceProblems.length})
        </h4>
        <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-center bg-gray-50" style={{ height: '600px' }}>
            <img
              src={currentProblem.screenshotUrl}
              alt={`Practice Problem ${currentProblem.problemNumber}`}
              className="max-w-full max-h-full object-contain cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            />
          </div>

          {practiceProblems.length > 1 && (
            <>
              <button
                onClick={prevProblem}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-900 rounded-full p-2 shadow-lg transition-all cursor-pointer"
                aria-label="Previous problem"
              >
                <ChevronLeftIcon className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextProblem}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-900 rounded-full p-2 shadow-lg transition-all cursor-pointer"
                aria-label="Next problem"
              >
                <ChevronRightIcon className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                {currentProblemIndex + 1} / {practiceProblems.length}
              </div>
            </>
          )}

          {/* Expand button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-2 right-2 bg-gray-800/80 hover:bg-gray-900 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-lg transition-all cursor-pointer"
          >
            Click to Expand
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Problem {currentProblem.problemNumber}
          </p>
          {onAddToQueue && (
            <button
              onClick={() => {
                if (!isInQueue?.(skillNumber, currentProblem.problemNumber)) {
                  onAddToQueue(currentProblem, skillNumber, skillTitle, skillColor);
                }
              }}
              disabled={isInQueue?.(skillNumber, currentProblem.problemNumber)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                isInQueue?.(skillNumber, currentProblem.problemNumber)
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isInQueue?.(skillNumber, currentProblem.problemNumber) ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  In Queue
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  Add to Consideration
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Practice Problem Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
              {/* Close button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 bg-gray-800/80 hover:bg-gray-900 text-white rounded-full p-2 shadow-lg transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              {/* Image container */}
              <div className="flex items-center justify-center bg-gray-50 p-8" style={{ minHeight: '80vh' }}>
                <img
                  src={currentProblem.screenshotUrl}
                  alt={`Practice Problem ${currentProblem.problemNumber}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Navigation */}
              {practiceProblems.length > 1 && (
                <>
                  <button
                    onClick={prevProblem}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-900 rounded-full p-3 shadow-lg transition-all cursor-pointer"
                    aria-label="Previous problem"
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextProblem}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-900 rounded-full p-3 shadow-lg transition-all cursor-pointer"
                    aria-label="Next problem"
                  >
                    <ChevronRightIcon className="w-6 h-6 text-white" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Problem {currentProblem.problemNumber} - {currentProblemIndex + 1} / {practiceProblems.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
