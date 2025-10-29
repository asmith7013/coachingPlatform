"use client";

import { useState } from "react";
import { RoadmapsSkill, ImageWithContext } from "@zod-schema/313/roadmap-skill";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface SkillDetailViewProps {
  skill: RoadmapsSkill | null;
}

export function SkillDetailView({ skill }: SkillDetailViewProps) {
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Empty state
  if (!skill) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <div className="text-gray-400 text-lg mb-2">🎯</div>
          <div className="text-gray-600 font-medium mb-1">No Skill Selected</div>
          <div className="text-gray-500 text-sm">Select a skill to view details</div>
        </div>
      </div>
    );
  }

  const hasProblems = skill.practiceProblems && skill.practiceProblems.length > 0;

  const nextProblem = () => {
    if (hasProblems) {
      setCurrentProblemIndex((prev) => (prev + 1) % skill.practiceProblems!.length);
    }
  };

  const prevProblem = () => {
    if (hasProblems) {
      setCurrentProblemIndex((prev) =>
        prev === 0 ? skill.practiceProblems!.length - 1 : prev - 1
      );
    }
  };

  return (
    <>
      {/* Problem Viewer Modal */}
      <ProblemViewerModal
        isOpen={isModalOpen}
        problems={skill.practiceProblems || []}
        currentIndex={currentProblemIndex}
        onNext={nextProblem}
        onPrev={prevProblem}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header Card - Skill Number + Title */}
        <div className="border-b border-gray-200 p-8 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl font-bold text-blue-600">
              {skill.skillNumber}
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              {skill.title}
            </h2>
          </div>
          {skill.url && (
            <a
              href={skill.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              View on Roadmaps <span>→</span>
            </a>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* FOCUSED VIEW - Always Visible */}

          {/* Units with IM Lessons */}
          {skill.units && skill.units.length > 0 && (
            <div className="border-l-4 border-slate-500 bg-slate-50 p-4 rounded">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Units Containing This Skill ({skill.units.length})
              </h3>
              <div className="space-y-4">
                {skill.units.map((unit, index) => {
                  // Find all IM lessons for this unit
                  const lessonsInUnit = skill.imLessons?.filter(
                    lesson => lesson.unitNumber === unit.unitNumber
                  ) || [];

                  return (
                    <div key={index} className="bg-white p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="bg-slate-600 text-white px-2 py-1 rounded font-medium">
                          Unit {unit.unitNumber}
                        </span>
                        <span className="text-slate-700 font-medium">
                          {unit.grade.includes(' - ') ? unit.grade.split(' - ')[1] : unit.grade}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-700">
                          {unit.unitTitle.replace(/^\d+\s*-\s*/, '')}
                        </span>
                      </div>

                      {/* Show lessons within this unit */}
                      {lessonsInUnit.length > 0 && (
                        <div className="ml-4 mt-2 space-y-1">
                          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                            IM Lessons ({lessonsInUnit.length})
                          </div>
                          {lessonsInUnit.map((lesson, lessonIdx) => (
                            <div
                              key={lessonIdx}
                              className="flex items-center gap-2 text-xs text-slate-600 bg-teal-50 px-2 py-1 rounded border border-teal-200"
                            >
                              <span className="font-mono font-semibold text-teal-700">
                                Lesson {lesson.lessonNumber}
                              </span>
                              {lesson.lessonName && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-700">{lesson.lessonName}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prerequisite Skills Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="space-y-3">
              {/* Essential Skills Row */}
              <div className="flex items-start gap-3">
                <div className="text-gray-700 font-medium min-w-[90px]">Essential:</div>
                <div className="flex flex-wrap gap-2">
                  {skill.essentialSkills && skill.essentialSkills.length > 0 ? (
                    skill.essentialSkills.map((s) => (
                      <span
                        key={s.skillNumber}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-200 transition-colors cursor-pointer"
                      >
                        {s.title} ({s.skillNumber})
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
              </div>

              {/* Helpful Skills Row */}
              <div className="flex items-start gap-3">
                <div className="text-gray-700 font-medium min-w-[90px]">Helpful:</div>
                <div className="flex flex-wrap gap-2">
                  {skill.helpfulSkills && skill.helpfulSkills.length > 0 ? (
                    skill.helpfulSkills.map((s) => (
                      <span
                        key={s.skillNumber}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        {s.title} ({s.skillNumber})
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm italic">N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {skill.description && (
            <Section title="Description" color="blue">
              {skill.description}
            </Section>
          )}

          {/* Models and Manipulatives */}
          {skill.modelsAndManipulatives && (
            <SectionWithImages
              title="Models and Manipulatives"
              color="teal"
              content={skill.modelsAndManipulatives}
              images={skill.imagesWithContext?.filter(img => img.section === 'modelsAndManipulatives')}
            />
          )}

          {/* Video */}
          {skill.videoUrl && skill.videoUrl.trim() !== '' && (
            <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">
                Worked Example Video
              </h3>
              <div className="bg-white rounded-lg overflow-hidden border border-purple-200">
                <video
                  controls
                  className="w-full max-w-4xl mx-auto"
                  preload="metadata"
                  style={{ aspectRatio: '16/9' }}
                >
                  <source src={skill.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Practice Problems Carousel */}
          {hasProblems && (
            <PracticeProblemsCarousel
              problems={skill.practiceProblems!}
              currentIndex={currentProblemIndex}
              onNext={nextProblem}
              onPrev={prevProblem}
              onImageClick={() => setIsModalOpen(true)}
            />
          )}

          {/* Show All Details Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowAllDetails(!showAllDetails)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
            >
              {showAllDetails ? (
                <>
                  <ChevronUpIcon className="w-5 h-5" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-5 h-5" />
                  Show All Details
                </>
              )}
            </button>
          </div>

          {/* EXPANDED VIEW - Hidden by default */}
          {showAllDetails && (
            <div className="space-y-6 pt-6 border-t-2 border-gray-200">

              {/* Essential Question */}
              {skill.essentialQuestion && (
                <Section title="Essential Question" color="purple">
                  {skill.essentialQuestion}
                </Section>
              )}

              {/* Skill Challenge Criteria */}
              {skill.skillChallengeCriteria && (
                <Section title="Skill Challenge Criteria" color="green">
                  {skill.skillChallengeCriteria}
                </Section>
              )}

              {/* Launch */}
              {skill.launch && (
                <SectionWithImages
                  title="Launch"
                  color="orange"
                  content={skill.launch}
                  images={skill.imagesWithContext?.filter(img => img.section === 'launch')}
                />
              )}

              {/* Teacher/Student Strategies */}
              {skill.teacherStudentStrategies && (
                <SectionWithImages
                  title="Teacher/Student Strategies"
                  color="indigo"
                  content={skill.teacherStudentStrategies}
                  images={skill.imagesWithContext?.filter(img => img.section === 'teacherStudentStrategies')}
                />
              )}

              {/* Questions to Help */}
              {skill.questionsToHelp && (
                <SectionWithImages
                  title="Questions to Help Students"
                  color="pink"
                  content={skill.questionsToHelp}
                  images={skill.imagesWithContext?.filter(img => img.section === 'questionsToHelp')}
                />
              )}

              {/* Discussion Questions */}
              {skill.discussionQuestions && (
                <SectionWithImages
                  title="Discussion Questions"
                  color="cyan"
                  content={skill.discussionQuestions}
                  images={skill.imagesWithContext?.filter(img => img.section === 'discussionQuestions')}
                />
              )}

              {/* Common Misconceptions */}
              {skill.commonMisconceptions && (
                <SectionWithImages
                  title="Common Misconceptions"
                  color="red"
                  content={skill.commonMisconceptions}
                  images={skill.imagesWithContext?.filter(img => img.section === 'commonMisconceptions')}
                />
              )}

              {/* Additional Resources */}
              {skill.additionalResources && (
                <SectionWithImages
                  title="Additional Resources"
                  color="amber"
                  content={skill.additionalResources}
                  images={skill.imagesWithContext?.filter(img => img.section === 'additionalResources')}
                />
              )}

              {/* Standards */}
              {skill.standards && (
                <Section title="Standards" color="gray">
                  {skill.standards}
                </Section>
              )}

              {/* Vocabulary */}
              {skill.vocabulary && skill.vocabulary.length > 0 && (
                <div className="border-l-4 border-violet-500 bg-violet-50 p-4 rounded">
                  <h3 className="text-lg font-semibold text-violet-900 mb-2">
                    Vocabulary
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.vocabulary.map((term, index) => (
                      <span
                        key={index}
                        className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback: Legacy Images */}
              {(!skill.imagesWithContext || skill.imagesWithContext.length === 0) && skill.images && skill.images.length > 0 && (
                <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3">
                    Images ({skill.images.length})
                  </h3>
                  <div className="bg-amber-50 border border-amber-300 rounded p-2 mb-3 text-xs text-amber-800">
                    ⚠️ These images were scraped without section context. Re-scrape this skill to see images in their proper sections.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skill.images.map((image, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-emerald-200">
                        <div className="text-sm font-medium text-emerald-900 mb-2">
                          Image {index + 1}
                        </div>
                        <a
                          href={image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full rounded border border-gray-200 hover:border-emerald-400 transition-colors cursor-pointer"
                            loading="lazy"
                          />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <div className="flex gap-4">
              <span>
                <strong>Scraped:</strong> {new Date(skill.scrapedAt).toLocaleString()}
              </span>
              {skill.tags && skill.tags.length > 0 && (
                <span>
                  <strong>Tags:</strong> {skill.tags.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface SectionProps {
  title: string;
  color: "blue" | "purple" | "green" | "orange" | "indigo" | "teal" | "pink" | "cyan" | "red" | "amber" | "gray";
  children: React.ReactNode;
}

function Section({ title, color, children }: SectionProps) {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-50 text-blue-900",
    purple: "border-purple-500 bg-purple-50 text-purple-900",
    green: "border-green-500 bg-green-50 text-green-900",
    orange: "border-orange-500 bg-orange-50 text-orange-900",
    indigo: "border-indigo-500 bg-indigo-50 text-indigo-900",
    teal: "border-teal-500 bg-teal-50 text-teal-900",
    pink: "border-pink-500 bg-pink-50 text-pink-900",
    cyan: "border-cyan-500 bg-cyan-50 text-cyan-900",
    red: "border-red-500 bg-red-50 text-red-900",
    amber: "border-amber-500 bg-amber-50 text-amber-900",
    gray: "border-gray-500 bg-gray-50 text-gray-900",
  };

  // Check if content is HTML or plain text
  const content = typeof children === 'string' && children.includes('<')
    ? <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: children }} />
    : <div className="text-sm whitespace-pre-wrap">{children}</div>;

  return (
    <div className={`border-l-4 ${colorClasses[color]} p-4 rounded`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {content}
    </div>
  );
}

interface SectionWithImagesProps {
  title: string;
  color: "blue" | "purple" | "green" | "orange" | "indigo" | "teal" | "pink" | "cyan" | "red" | "amber" | "gray";
  content: string;
  images?: ImageWithContext[];
}

function SectionWithImages({ title, color, content, images }: SectionWithImagesProps) {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-50 text-blue-900",
    purple: "border-purple-500 bg-purple-50 text-purple-900",
    green: "border-green-500 bg-green-50 text-green-900",
    orange: "border-orange-500 bg-orange-50 text-orange-900",
    indigo: "border-indigo-500 bg-indigo-50 text-indigo-900",
    teal: "border-teal-500 bg-teal-50 text-teal-900",
    pink: "border-pink-500 bg-pink-50 text-pink-900",
    cyan: "border-cyan-500 bg-cyan-50 text-cyan-900",
    red: "border-red-500 bg-red-50 text-red-900",
    amber: "border-amber-500 bg-amber-50 text-amber-900",
    gray: "border-gray-500 bg-gray-50 text-gray-900",
  };

  const borderColor = {
    blue: "border-blue-200",
    purple: "border-purple-200",
    green: "border-green-200",
    orange: "border-orange-200",
    indigo: "border-indigo-200",
    teal: "border-teal-200",
    pink: "border-pink-200",
    cyan: "border-cyan-200",
    red: "border-red-200",
    amber: "border-amber-200",
    gray: "border-gray-200",
  };

  const hoverBorderColor = {
    blue: "hover:border-blue-400",
    purple: "hover:border-purple-400",
    green: "hover:border-green-400",
    orange: "hover:border-orange-400",
    indigo: "hover:border-indigo-400",
    teal: "hover:border-teal-400",
    pink: "hover:border-pink-400",
    cyan: "hover:border-cyan-400",
    red: "hover:border-red-400",
    amber: "hover:border-amber-400",
    gray: "hover:border-gray-400",
  };

  // Check if content is HTML or plain text
  const contentDisplay = typeof content === 'string' && content.includes('<')
    ? <div className="text-sm prose prose-sm max-w-none mb-3" dangerouslySetInnerHTML={{ __html: content }} />
    : <div className="text-sm whitespace-pre-wrap mb-3">{content}</div>;

  return (
    <div className={`border-l-4 ${colorClasses[color]} p-4 rounded`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {contentDisplay}

      {/* Images for this section */}
      {images && images.length > 0 && (
        <div className="space-y-3 mt-4">
          {images
            .sort((a, b) => a.orderInSection - b.orderInSection)
            .map((image, index) => (
              <div key={index} className="bg-white p-3 rounded border border-gray-200">
                {image.caption && (
                  <p className="text-sm text-gray-700 mb-2 italic">{image.caption}</p>
                )}
                <a
                  href={image.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={image.url}
                    alt={image.altText || `Image ${index + 1}`}
                    className={`w-full rounded border ${borderColor[color]} ${hoverBorderColor[color]} transition-colors cursor-pointer`}
                    loading="lazy"
                  />
                </a>
                {image.altText && (
                  <p className="text-xs text-gray-500 mt-2">{image.altText}</p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ====================================
// PRACTICE PROBLEMS CAROUSEL COMPONENT
// ====================================

interface PracticeProblemsCarouselProps {
  problems: Array<{
    problemNumber: number;
    screenshotUrl: string;
    scrapedAt: string;
  }>;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onImageClick: () => void;
}

function PracticeProblemsCarousel({
  problems,
  currentIndex,
  onNext,
  onPrev,
  onImageClick
}: PracticeProblemsCarouselProps) {
  if (problems.length === 0) return null;

  const currentProblem = problems[currentIndex];

  return (
    <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded">
      <h3 className="text-lg font-semibold text-indigo-900 mb-3">
        Practice Problems ({problems.length})
      </h3>

      <div className="relative bg-white rounded-lg border border-indigo-200 overflow-hidden">
        {/* Problem Image - Fixed height container */}
        <div
          className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-gray-50"
          style={{ height: '600px' }}
          onClick={onImageClick}
        >
          <img
            src={currentProblem.screenshotUrl}
            alt={`Practice Problem ${currentProblem.problemNumber}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Navigation Arrows */}
        {problems.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-900 rounded-full p-2 shadow-lg transition-all"
              aria-label="Previous problem"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-900 rounded-full p-2 shadow-lg transition-all"
              aria-label="Next problem"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Problem Counter */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {problems.length}
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-2 text-center">
        Problem {currentProblem.problemNumber} • Click image to enlarge
      </p>
    </div>
  );
}

// ====================================
// PROBLEM VIEWER MODAL COMPONENT
// ====================================

interface ProblemViewerModalProps {
  isOpen: boolean;
  problems: Array<{
    problemNumber: number;
    screenshotUrl: string;
    scrapedAt: string;
  }>;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

function ProblemViewerModal({
  isOpen,
  problems,
  currentIndex,
  onNext,
  onPrev,
  onClose
}: ProblemViewerModalProps) {
  if (!isOpen || problems.length === 0) return null;

  const currentProblem = problems[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Problem {currentProblem.problemNumber} ({currentIndex + 1} of {problems.length})
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Image Content */}
        <div className="relative flex items-center justify-center bg-gray-100 p-8">
          <img
            src={currentProblem.screenshotUrl}
            alt={`Practice Problem ${currentProblem.problemNumber}`}
            className="max-w-full max-h-[70vh] object-contain rounded shadow-lg"
          />

          {/* Navigation Arrows */}
          {problems.length > 1 && (
            <>
              <button
                onClick={onPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 rounded-full p-3 shadow-xl transition-all"
                aria-label="Previous problem"
              >
                <ChevronLeftIcon className="w-8 h-8 text-indigo-600" />
              </button>
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 rounded-full p-3 shadow-xl transition-all"
                aria-label="Next problem"
              >
                <ChevronRightIcon className="w-8 h-8 text-indigo-600" />
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-600">
          Use arrow buttons or keyboard arrows to navigate
        </div>
      </div>
    </div>
  );
}
