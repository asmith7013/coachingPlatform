"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { RoadmapsSkill } from "@zod-schema/scm/curriculum/roadmap-skill";

interface SkillDetailModalProps {
  skill: RoadmapsSkill | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SkillDetailModal({ skill, isOpen, onClose }: SkillDetailModalProps) {
  if (!isOpen || !skill) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-blue-600">
                  {skill.skillNumber}
                </span>
                <h2 className="text-2xl font-bold text-gray-900">
                  {skill.title}
                </h2>
              </div>
              {skill.url && (
                <a
                  href={skill.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View on Roadmaps →
                </a>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Units - Show which units contain this skill */}
            {skill.units && skill.units.length > 0 && (
              <div className="border-l-4 border-slate-500 bg-slate-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Units Containing This Skill ({skill.units.length})
                </h3>
                <div className="space-y-2">
                  {skill.units.map((unit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded font-medium">
                        Unit {unit.unitNumber}
                      </span>
                      <span className="text-slate-700">{unit.grade}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-700">{unit.unitTitle}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Essential Skills - Structured with skillNumber and title */}
            {skill.essentialSkills && skill.essentialSkills.length > 0 && (
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  Essential Skills ({skill.essentialSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.essentialSkills.map((s) => (
                    <span
                      key={s.skillNumber}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium"
                    >
                      {s.skillNumber}: {s.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Helpful Skills - Structured with skillNumber and title */}
            {skill.helpfulSkills && skill.helpfulSkills.length > 0 && (
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  Helpful Skills ({skill.helpfulSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.helpfulSkills.map((s) => (
                    <span
                      key={s.skillNumber}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium"
                    >
                      {s.skillNumber}: {s.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {skill.description && (
              <Section title="Description" color="blue">
                {skill.description}
              </Section>
            )}

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
              <Section title="Launch" color="orange">
                {skill.launch}
              </Section>
            )}

            {/* Teacher/Student Strategies */}
            {skill.teacherStudentStrategies && (
              <Section title="Teacher/Student Strategies" color="indigo">
                {skill.teacherStudentStrategies}
              </Section>
            )}

            {/* Models and Manipulatives */}
            {skill.modelsAndManipulatives && (
              <Section title="Models and Manipulatives" color="teal">
                {skill.modelsAndManipulatives}
              </Section>
            )}

            {/* Questions to Help */}
            {skill.questionsToHelp && (
              <Section title="Questions to Help Students" color="pink">
                {skill.questionsToHelp}
              </Section>
            )}

            {/* Discussion Questions */}
            {skill.discussionQuestions && (
              <Section title="Discussion Questions" color="cyan">
                {skill.discussionQuestions}
              </Section>
            )}

            {/* Common Misconceptions */}
            {skill.commonMisconceptions && (
              <Section title="Common Misconceptions" color="red">
                {skill.commonMisconceptions}
              </Section>
            )}

            {/* Additional Resources */}
            {skill.additionalResources && (
              <Section title="Additional Resources" color="amber">
                {skill.additionalResources}
              </Section>
            )}

            {/* Standards */}
            {skill.standards && (() => {
              // Parse standards text to extract standard codes and descriptions
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

              // If no standards found, fall back to original rendering
              if (parsed.filter(p => p.type === 'code').length === 0) {
                return (
                  <Section title="Standards" color="gray">
                    {skill.standards}
                  </Section>
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
                <div className="border-l-4 border-gray-500 bg-gray-50 p-4 rounded">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Standards</h3>
                  <div className="space-y-3">
                    {groups.map((group, groupIndex) => (
                      <div key={groupIndex} className="flex flex-wrap items-start gap-2">
                        {group.map((part, partIndex) =>
                          part.type === 'code' ? (
                            <span
                              key={partIndex}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300 flex-shrink-0"
                            >
                              {part.content}
                            </span>
                          ) : (
                            <span key={partIndex} className="text-sm text-gray-900">
                              {part.content}
                            </span>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Vocabulary */}
            {skill.vocabulary && skill.vocabulary.length > 0 && (
              <div className="border-l-4 border-violet-500 bg-violet-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-violet-900 mb-2">
                  Vocabulary
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.vocabulary.map((vocabItem, index) => {
                    const term = typeof vocabItem === 'string' ? vocabItem : vocabItem.term;
                    return (
                      <span
                        key={index}
                        className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {term}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Video */}
            {skill.videoUrl && (
              <Section title="Worked Example Video" color="purple">
                <a
                  href={skill.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {skill.videoUrl}
                </a>
              </Section>
            )}

            {/* Images */}
            {skill.images && skill.images.length > 0 && (
              <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-emerald-900 mb-3">
                  Images ({skill.images.length})
                </h3>
                <div className="space-y-2">
                  {skill.images.map((image, index) => (
                    <a
                      key={index}
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      Image {index + 1}
                    </a>
                  ))}
                </div>
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
      </div>
    </div>
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

  return (
    <div className={`border-l-4 ${colorClasses[color]} p-4 rounded`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-sm whitespace-pre-wrap">{children}</div>
    </div>
  );
}
