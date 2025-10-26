"use client";

import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";

interface SkillDetailViewProps {
  skill: RoadmapsSkill | null;
}

export function SkillDetailView({ skill }: SkillDetailViewProps) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header Card - Skill Number + Title */}
      <div className="border-b border-gray-200 p-6 bg-gray-50">
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

      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto">
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

        {/* Images with Context */}
        {skill.imagesWithContext && skill.imagesWithContext.length > 0 && (
          <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded">
            <h3 className="text-lg font-semibold text-emerald-900 mb-3">
              Images ({skill.imagesWithContext.length})
            </h3>
            <div className="space-y-4">
              {/* Group images by section */}
              {Object.entries(
                skill.imagesWithContext.reduce((acc: Record<string, typeof skill.imagesWithContext>, img) => {
                  const section = img.section || 'other';
                  if (!acc[section]) acc[section] = [];
                  acc[section].push(img);
                  return acc;
                }, {})
              ).map(([section, images]) => (
                <div key={section} className="space-y-3">
                  <h4 className="text-md font-medium text-emerald-800 capitalize">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  {images.map((image, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-emerald-200">
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
                          className="w-full rounded border border-gray-200 hover:border-emerald-400 transition-colors cursor-pointer"
                          loading="lazy"
                        />
                      </a>
                      {image.altText && (
                        <p className="text-xs text-gray-500 mt-2">{image.altText}</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback: Legacy Images (if no context available) */}
        {(!skill.imagesWithContext || skill.imagesWithContext.length === 0) && skill.images && skill.images.length > 0 && (
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

        {/* Practice Problems */}
        {skill.practiceProblems && skill.practiceProblems.length > 0 && (
          <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">
              Practice Problems ({skill.practiceProblems.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skill.practiceProblems.map((problem) => (
                <div key={problem.problemNumber} className="bg-white p-3 rounded border border-indigo-200">
                  <div className="text-sm font-medium text-indigo-900 mb-2">
                    Problem {problem.problemNumber}
                  </div>
                  <a
                    href={problem.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={problem.screenshotUrl}
                      alt={`Practice Problem ${problem.problemNumber}`}
                      className="w-full rounded border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                    />
                  </a>
                  <div className="text-xs text-gray-500 mt-2">
                    Click to view full size
                  </div>
                </div>
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
