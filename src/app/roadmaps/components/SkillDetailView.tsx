"use client";

import { useState } from "react";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, ChevronDownIcon, ChevronRightIcon as ChevronRightIconSolid } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";

interface SkillDetailViewProps {
  skill: RoadmapsSkill | null;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
  onClose?: () => void;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  masteredSkills?: string[];
}

const colorClasses = {
  blue: 'bg-skill-target',
  green: 'bg-skill-target', // Target skills
  orange: 'bg-skill-essential', // Essential skills
  purple: 'bg-skill-helpful', // Helpful skills
};

export function SkillDetailView({ skill, onSkillClick, onClose, color = 'blue', masteredSkills = [] }: SkillDetailViewProps) {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [expandedStandards, setExpandedStandards] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleStandard = (index: number) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStandards(newExpanded);
  };

  if (!skill) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="text-gray-400 text-lg mb-2">🎯</div>
        <div className="text-sm">Click any skill to view details</div>
      </div>
    );
  }

  // Check if skill was not found
  if ((skill as unknown as { notFound?: boolean }).notFound) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-600 text-white font-bold text-sm flex-shrink-0">
              {skill.skillNumber}
            </span>
            <div className="text-xl font-bold text-gray-900">
              Skill Not Found
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div>
                <div className="font-semibold text-yellow-900 mb-1">
                  Skill {skill.skillNumber} not found in database
                </div>
                <div className="text-sm text-yellow-800">
                  This skill may not have been scraped yet or the skill number might be incorrect.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasEssentialSkills = skill.essentialSkills && skill.essentialSkills.length > 0;
  const hasHelpfulSkills = skill.helpfulSkills && skill.helpfulSkills.length > 0;
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
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-sm flex-shrink-0 ${colorClasses[color]}`}>
              {skill.skillNumber}
            </span>
            <div className="text-xl font-bold text-gray-900">
              {skill.title}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
              title="Close skill details"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-0">
        {/* Description */}
        {skill.description && (
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
            <div
              className="text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: skill.description }}
            />
          </div>
        )}

        {/* Standards */}
        {skill.standards && (() => {
          // Parse standards HTML to extract standard codes and descriptions
          const parser = new DOMParser();
          const doc = parser.parseFromString(skill.standards, 'text/html');
          const text = doc.body.textContent || '';

          // Split by "NY." to find standard boundaries
          const segments = text.split(/\b(NY\.[A-Z0-9.a-z]+)/g).filter(s => s.trim());

          const parsed: Array<{ type: 'code' | 'text', content: string }> = [];

          segments.forEach((segment) => {
            if (segment.match(/^NY\.[A-Z0-9.a-z]+/)) {
              // This is a standard code - extract up to first space or colon, then remove trailing colon
              const match = segment.match(/^(NY\.[A-Z0-9.a-z]+):?/);
              if (match) {
                const code = match[1]; // Get code without colon
                parsed.push({ type: 'code', content: code });

                // Get remaining text after the code (and optional colon)
                const remaining = segment.substring(match[0].length).trim();
                if (remaining) {
                  parsed.push({ type: 'text', content: remaining });
                }
              }
            } else {
              // Regular text - remove leading colon if present
              const trimmed = segment.trim().replace(/^:\s*/, '');
              if (trimmed) {
                parsed.push({ type: 'text', content: trimmed });
              }
            }
          });

          // If no standards found, fall back to original HTML rendering
          if (parsed.filter(p => p.type === 'code').length === 0) {
            return (
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Standards</h4>
                <div
                  className="text-sm text-gray-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: skill.standards }}
                />
              </div>
            );
          }

          // Group by standard code
          const groups: Array<Array<{ type: 'code' | 'text', content: string }>> = [];
          let currentGroup: Array<{ type: 'code' | 'text', content: string }> = [];

          parsed.forEach((item) => {
            if (item.type === 'code') {
              if (currentGroup.length > 0) {
                groups.push(currentGroup);
              }
              currentGroup = [item];
            } else {
              currentGroup.push(item);
            }
          });

          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }

          return (
            <div className="border-b border-gray-200 py-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Standards</h4>
              <div className="space-y-2">
                {groups.map((group, groupIndex) => {
                  const isExpanded = expandedStandards.has(groupIndex);
                  const code = group.find(p => p.type === 'code')?.content || '';
                  const description = group.filter(p => p.type === 'text').map(p => p.content).join(' ');

                  return (
                    <div key={groupIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleStandard(groupIndex)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                          {code}
                        </span>
                        {isExpanded ? (
                          <ChevronDownIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        ) : (
                          <ChevronRightIconSolid className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        )}
                      </button>
                      {isExpanded && description && (
                        <div className="px-3 py-2 bg-white border-t border-gray-200">
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Prerequisites - moved to top */}
        {(hasEssentialSkills || hasHelpfulSkills) && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Prerequisites</h4>

            {/* Essential Skills */}
            {hasEssentialSkills && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">Essential Skills</div>
                <div className="flex flex-wrap gap-2">
                  {skill.essentialSkills!.map((essentialSkill) => {
                    const skillNum = typeof essentialSkill === 'string' ? essentialSkill : essentialSkill.skillNumber;
                    const skillTitle = typeof essentialSkill === 'object' ? essentialSkill.title : undefined;
                    const isSkillMastered = masteredSkills.includes(skillNum);
                    return (
                      <div
                        key={skillNum}
                        onClick={() => onSkillClick?.(skillNum, 'orange')}
                        className="flex items-center gap-2 px-2 py-1 rounded bg-skill-essential-100 border border-skill-essential-300 max-w-full cursor-pointer hover:bg-skill-essential-200 hover:shadow-sm transition-all"
                      >
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-skill-essential text-white font-bold text-xs flex-shrink-0"
                        >
                          {skillNum}
                        </span>
                        {masteredSkills.length > 0 && (
                          <div className="flex-shrink-0">
                            {isSkillMastered ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-600" title="Mastered" />
                            ) : (
                              <CheckCircleOutlineIcon className="w-4 h-4 text-gray-400" title="Not yet mastered" />
                            )}
                          </div>
                        )}
                        {skillTitle && (
                          <span className="text-xs text-gray-900 break-words">{skillTitle}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Helpful Skills */}
            {hasHelpfulSkills && (
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-2">Helpful Skills</div>
                <div className="flex flex-wrap gap-2">
                  {skill.helpfulSkills!.map((helpfulSkill) => {
                    const skillNum = typeof helpfulSkill === 'string' ? helpfulSkill : helpfulSkill.skillNumber;
                    const skillTitle = typeof helpfulSkill === 'object' ? helpfulSkill.title : undefined;
                    const isSkillMastered = masteredSkills.includes(skillNum);
                    return (
                      <div
                        key={skillNum}
                        onClick={() => onSkillClick?.(skillNum, 'purple')}
                        className="flex items-center gap-2 px-2 py-1 rounded bg-skill-helpful-100 border border-skill-helpful-300 max-w-full cursor-pointer hover:bg-skill-helpful-200 hover:shadow-sm transition-all"
                      >
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-skill-helpful text-white font-bold text-xs flex-shrink-0"
                        >
                          {skillNum}
                        </span>
                        {masteredSkills.length > 0 && (
                          <div className="flex-shrink-0">
                            {isSkillMastered ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-600" title="Mastered" />
                            ) : (
                              <CheckCircleOutlineIcon className="w-4 h-4 text-gray-400" title="Not yet mastered" />
                            )}
                          </div>
                        )}
                        {skillTitle && (
                          <span className="text-xs text-gray-900 break-words">{skillTitle}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video */}
        {skill.videoUrl && skill.videoUrl.trim() !== '' && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Worked Example Video</h4>
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <video
                controls
                className="w-full"
                preload="metadata"
                style={{ aspectRatio: '16/9' }}
              >
                <source src={skill.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* Practice Problems */}
        {hasProblems && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Practice Problems ({skill.practiceProblems!.length})
            </h4>
            <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-center bg-gray-50" style={{ height: '600px' }}>
                <img
                  src={skill.practiceProblems![currentProblemIndex].screenshotUrl}
                  alt={`Practice Problem ${skill.practiceProblems![currentProblemIndex].problemNumber}`}
                  className="max-w-full max-h-full object-contain cursor-pointer"
                  onClick={() => setIsModalOpen(true)}
                />
              </div>

              {skill.practiceProblems!.length > 1 && (
                <>
                  <button
                    onClick={prevProblem}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-900 rounded-full p-2 shadow-lg transition-all"
                    aria-label="Previous problem"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={nextProblem}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-900 rounded-full p-2 shadow-lg transition-all"
                    aria-label="Next problem"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-white" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {currentProblemIndex + 1} / {skill.practiceProblems!.length}
                  </div>
                </>
              )}

              {/* Expand button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-2 right-2 bg-gray-800/80 hover:bg-gray-900 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-lg transition-all"
              >
                Click to Expand
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Problem {skill.practiceProblems![currentProblemIndex].problemNumber}
            </p>
          </div>
        )}

        {/* Practice Problem Modal */}
        {isModalOpen && hasProblems && (
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
                  className="absolute top-4 right-4 z-10 bg-gray-800/80 hover:bg-gray-900 text-white rounded-full p-2 shadow-lg transition-all"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Image container */}
                <div className="flex items-center justify-center bg-gray-50 p-8" style={{ minHeight: '80vh' }}>
                  <img
                    src={skill.practiceProblems![currentProblemIndex].screenshotUrl}
                    alt={`Practice Problem ${skill.practiceProblems![currentProblemIndex].problemNumber}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Navigation */}
                {skill.practiceProblems!.length > 1 && (
                  <>
                    <button
                      onClick={prevProblem}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-900 rounded-full p-3 shadow-lg transition-all"
                      aria-label="Previous problem"
                    >
                      <ChevronLeftIcon className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={nextProblem}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-900 rounded-full p-3 shadow-lg transition-all"
                      aria-label="Next problem"
                    >
                      <ChevronRightIcon className="w-6 h-6 text-white" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Problem {skill.practiceProblems![currentProblemIndex].problemNumber} - {currentProblemIndex + 1} / {skill.practiceProblems!.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Essential Question */}
        {skill.essentialQuestion && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Essential Question</h4>
            <p className="text-sm text-gray-600">{skill.essentialQuestion}</p>
          </div>
        )}

        {/* Common Misconceptions */}
        {skill.commonMisconceptions && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Common Misconceptions</h4>
            <div
              className="text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: skill.commonMisconceptions }}
            />
          </div>
        )}

        {/* Vocabulary */}
        {skill.vocabulary && skill.vocabulary.length > 0 && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Vocabulary</h4>
            <div className="flex flex-wrap gap-2">
              {skill.vocabulary.map((vocabItem, index) => {
                // Handle both old format (string) and new format (object with term/definition)
                const term = typeof vocabItem === 'string' ? vocabItem : vocabItem.term;
                const definition = typeof vocabItem === 'object' && 'definition' in vocabItem ? vocabItem.definition : null;

                return (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                    title={definition || undefined}
                  >
                    {term}
                    {definition && <span className="text-gray-500 ml-1">— {definition}</span>}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Models and Manipulatives - show full primer with other sections hidden */}
        {skill.primerHtml && (() => {
          // Parse the primer HTML and hide sections we don't want
          const parser = new DOMParser();
          const doc = parser.parseFromString(skill.primerHtml, 'text/html');

          // Find all h4 headers
          const h4Elements = Array.from(doc.querySelectorAll('h4'));

          // Hide all sections except Models and Manipulatives
          const sectionsToHide = [
            'Launch:',
            'Teacher/Student Strategies:',
            'Questions to Help Students Get Unstuck:',
            'Discussion Questions:',
            'Common Misconceptions:',
            'Additional Resources:'
          ];

          h4Elements.forEach(h4 => {
            const headerText = h4.textContent?.trim() || '';
            // Hide all h4 headers (including Models and Manipulatives)
            if (sectionsToHide.some(section => headerText.includes(section)) || headerText.includes('Models and Manipulatives')) {
              h4.style.display = 'none';

              // If it's not Models and Manipulatives, hide the content too
              if (!headerText.includes('Models and Manipulatives')) {
                let currentElement = h4.nextElementSibling;
                while (currentElement && currentElement.tagName !== 'H4') {
                  (currentElement as HTMLElement).style.display = 'none';
                  currentElement = currentElement.nextElementSibling;
                }
              }
            }
          });

          // Get the modified HTML
          const modifiedHtml = doc.body.innerHTML;

          return (
            <div className="py-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Models & Manipulatives</h4>
              <div
                className="all-initial"
                dangerouslySetInnerHTML={{ __html: modifiedHtml }}
                style={{
                  fontSize: '14px',
                  color: '#4b5563',
                  lineHeight: '1.5'
                }}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
