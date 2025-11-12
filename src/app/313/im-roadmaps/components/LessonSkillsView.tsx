import { useState, useEffect } from 'react';
import { getRoadmapsLessons } from '@actions/313/roadmaps-lessons';
import { RoadmapsLesson } from '@zod-schema/313/roadmap';
import { AccordionList } from './AccordionList';

interface RoadmapsSkill {
  _id: string;
  title: string;
  description: string;
  skillChallengeCriteria: string;
  essentialQuestion: string;
  skillNumber: string;
}

interface LessonSkillsViewProps {
  lessonId: string;
  lessons: RoadmapsLesson[];
  studentData?: {
    studentId: string;
    studentName: string;
    skillPerformances: Array<{
      skillCode: string;
      status: 'Mastered' | 'Attempted But Not Mastered' | 'Not Started';
      score?: string;
      lastUpdated?: string;
    }>;
  } | null;
}

// Helper function to get mastery status styling (moved from TargetSkillCard)
const getMasteryStyles = (status?: string) => {
  switch (status) {
    case 'Mastered':
      return {
        containerClass: 'opacity-60 bg-gray-50',
        textClass: 'text-gray-500 line-through',
        indicator: '✅',
        indicatorClass: 'text-green-600'
      };
    case 'Attempted But Not Mastered':
      return {
        containerClass: 'border-amber-300 bg-amber-50',
        textClass: 'text-amber-900',
        indicator: '⚠️',
        indicatorClass: 'text-amber-600'
      };
    case 'Not Started':
    default:
      return {
        containerClass: '',
        textClass: '',
        indicator: '',
        indicatorClass: ''
      };
  }
};

// Target Skill Display Component
interface TargetSkillDisplayProps {
  targetSkill: {
    originalText: string;
    skillId: string;
    title: string;
    description: string;
    skillChallengeCriteria: string;
    roadmapsUrl: string;
    masteryStatus?: 'Mastered' | 'Attempted But Not Mastered' | 'Not Started';
  };
  isSelected: boolean;
}

function TargetSkillDisplay({ targetSkill, isSelected }: TargetSkillDisplayProps) {
  const masteryStyles = getMasteryStyles(targetSkill.masteryStatus);
  
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${masteryStyles.containerClass} ${
      isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {/* Mastery Status Badge - inline with title */}
            {targetSkill.masteryStatus && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                targetSkill.masteryStatus === 'Mastered' 
                  ? 'bg-green-600 text-white'
                  : targetSkill.masteryStatus === 'Attempted But Not Mastered'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}>
                <span>
                  {targetSkill.masteryStatus === 'Mastered' 
                    ? '✓'
                    : targetSkill.masteryStatus === 'Attempted But Not Mastered'
                    ? '⚠'
                    : '○'
                  }
                </span>
              </span>
            )}
            
            <h3 className={`text-lg font-bold text-blue-900 ${masteryStyles.textClass}`}>
              {targetSkill.title} ({targetSkill.skillId})
            </h3>
          </div>
          <p className={`text-blue-800 text-sm ${masteryStyles.textClass}`}>
            {targetSkill.description}
          </p>
        </div>
        {targetSkill.skillId && (
          <a
            href={targetSkill.roadmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors ml-3"
          >
            View →
          </a>
        )}
      </div>

    </div>
  );
}

// Accordion Skills Component
interface AccordionSkillsProps {
  title: string;
  skills: Array<{
    originalText: string;
    skillId: string;
    title: string;
    description: string;
    roadmapsUrl: string;
    masteryStatus?: 'Mastered' | 'Attempted But Not Mastered' | 'Not Started';
  }>;
  colorScheme: 'red' | 'green';
  accordionId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function AccordionSkills({ title, skills, colorScheme, isExpanded, onToggle }: AccordionSkillsProps) {
  // Count skills by mastery status - combine into complete/incomplete
  const completeCount = skills.filter(skill => skill.masteryStatus === 'Mastered').length;

  return (
    <AccordionList
      title={title}
      items={skills.map(skill => ({ label: skill.title, details: skill.description }))}
      colorScheme={colorScheme}
      accordionId={title}
      isExpanded={isExpanded}
      onToggle={onToggle}
      completedCount={completeCount}
      renderItem={(_, index) => (
        <SkillCard
          key={index}
          skill={skills[index]}
          colorScheme={colorScheme}
        />
      )}
    />
  );
}

// Skill Card Component
interface SkillCardProps {
  skill: {
    originalText: string;
    skillId: string;
    title: string;
    description: string;
    roadmapsUrl: string;
    masteryStatus?: 'Mastered' | 'Attempted But Not Mastered' | 'Not Started';
  };
  colorScheme: 'red' | 'green';
}

function SkillCard({ skill, colorScheme }: SkillCardProps) {
  const masteryStyles = getMasteryStyles(skill.masteryStatus);
  const colorClasses = colorScheme === 'red' 
    ? {
        bg: 'bg-red-50',
        border: 'border-red-100',
        text: 'text-red-900',
        link: 'text-red-600 hover:text-red-800',
        id: 'text-red-500'
      }
    : {
        bg: 'bg-green-50',
        border: 'border-green-100', 
        text: 'text-green-900',
        link: 'text-green-600 hover:text-green-800',
        id: 'text-green-500'
      };

  return (
    <div className={`${colorClasses.bg} ${colorClasses.border} border rounded-lg p-3 ${masteryStyles.containerClass}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-1">
          {/* Mastery Status Badge - inline with title */}
          {skill.masteryStatus && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              skill.masteryStatus === 'Mastered' 
                ? 'bg-green-600 text-white'
                : skill.masteryStatus === 'Attempted But Not Mastered'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}>
              <span>
                {skill.masteryStatus === 'Mastered' 
                  ? '✓'
                  : skill.masteryStatus === 'Attempted But Not Mastered'
                  ? '⚠'
                  : '○'
                }
              </span>
            </span>
          )}
          
          <h5 className={`font-medium ${colorClasses.text} text-sm ${masteryStyles.textClass}`}>
            {skill.title} {skill.skillId && `(${skill.skillId})`}
          </h5>
        </div>
        {skill.skillId && (
          <a
            href={skill.roadmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${colorClasses.link} text-xs underline ml-2`}
          >
            View →
          </a>
        )}
      </div>
      <p className={`${colorClasses.text} text-xs ${masteryStyles.textClass}`}>
        {skill.description}
      </p>
    </div>
  );
}

export function LessonSkillsView({ lessonId, lessons, studentData }: LessonSkillsViewProps) {
  const [roadmapsSkills, setRoadmapsSkills] = useState<RoadmapsSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTargetSkillIndex, _setSelectedTargetSkillIndex] = useState<number | null>(null);
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});

  const selectedLesson = lessons.find(lesson => lesson._id === lessonId);

  const toggleAccordion = (accordionId: string) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [accordionId]: !prev[accordionId]
    }));
  };

  useEffect(() => {
    const loadRoadmapsSkills = async () => {
      try {
        setIsLoading(true);
        const result = await getRoadmapsLessons({ limit: 1000 }); // Get all skills
        if (result.success && result.data) {
          // Handle both array and object responses from server action
          const rawSkills = Array.isArray(result.data) ? result.data : ((result.data as any)?.items || result.data || []); // eslint-disable-line @typescript-eslint/no-explicit-any
          const skillsWithStringIds = rawSkills.map((skill: any): RoadmapsSkill => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            _id: skill._id?.toString() || skill._id,
            title: skill.title,
            description: skill.description,
            skillChallengeCriteria: skill.skillChallengeCriteria,
            essentialQuestion: skill.essentialQuestion,
            skillNumber: skill.skillNumber
          }));
          setRoadmapsSkills(skillsWithStringIds);
        } else {
          setError(result.error || 'Failed to load roadmaps skills');
        }
      } catch (err) {
        setError('Failed to load roadmaps skills --> ' + err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoadmapsSkills();
  }, []);

  // Helper function to extract skill ID from text like "Understand Types of Transformations (262)"
  const extractSkillId = (skillText: string): string => {
    const match = skillText.match(/\((\d+)\)/);
    return match ? match[1] : '';
  };

  // Helper function to get skill mastery status from student data
  const getSkillMasteryStatus = (skillCode: string) => {
    if (!studentData) return undefined;
    
    const performance = studentData.skillPerformances.find(
      (perf) => perf.skillCode === skillCode
    );
    
    return performance?.status;
  };

  // Helper function to find roadmaps skill details by matching skill ID
  const getSkillDetails = (skillTexts: string[]) => {
    return skillTexts.map(skillText => {
      const skillId = extractSkillId(skillText);
      const roadmapsSkill = roadmapsSkills.find(skill => 
        skill.skillNumber === skillId
      );

      const masteryStatus = getSkillMasteryStatus(skillId);

      return {
        originalText: skillText,
        skillId,
        title: skillText.replace(/\s*\(\d+\)/, ''), // Remove ID from title
        description: roadmapsSkill?.description || 'Skill details not found in roadmaps collection',
        skillChallengeCriteria: roadmapsSkill?.skillChallengeCriteria || '',
        roadmapsUrl: `https://roadmaps.teachtoone.org/skill/${skillId}`,
        masteryStatus
      };
    });
  };

  if (!selectedLesson) {
    return <div className="text-gray-500">Lesson not found</div>;
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading skill details...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading skills: {error}</div>;
  }

  const targetSkills = getSkillDetails(selectedLesson.suggestedTargetSkills);
  const essentialSkills = getSkillDetails(selectedLesson.essentialSkills);
  const helpfulSkills = getSkillDetails(selectedLesson.helpfulSkills);

  return (
    <div className="space-y-6">
      {/* Target Skills & Prerequisites Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Target Skills & Prerequisites
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {selectedLesson.grade} {selectedLesson.unit} - Section {selectedLesson.section}, Lesson {selectedLesson.lesson}
        </p>
        
        {/* Target Skill Badges */}
        {/* {targetSkills.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600 mb-3">Click on a target skill to focus on its prerequisites:</p>
            <div className="flex flex-wrap gap-2">
              {targetSkills.map((targetSkill, index) => {
                const masteryStyles = getMasteryStyles(targetSkill.masteryStatus);
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedTargetSkillIndex(selectedTargetSkillIndex === index ? null : index)}
                    className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      selectedTargetSkillIndex === index
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                        : `bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 ${masteryStyles.containerClass}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {masteryStyles.indicator && (
                        <span className={masteryStyles.indicatorClass}>
                          {masteryStyles.indicator}
                        </span>
                      )}
                      <span className={selectedTargetSkillIndex === index ? '' : masteryStyles.textClass}>
                        {targetSkill.title}
                      </span>
                      {targetSkill.skillId && (
                        <span className={`text-xs ${selectedTargetSkillIndex === index ? 'text-blue-200' : 'text-gray-500'}`}>
                          ({targetSkill.skillId})
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )} */}

        {targetSkills.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {targetSkills.map((targetSkill, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 ${
                  selectedTargetSkillIndex !== null && selectedTargetSkillIndex !== index 
                    ? 'opacity-30 transition-opacity' 
                    : ''
                }`}
              >
                {/* Target Skill Card */}
                <TargetSkillDisplay 
                  targetSkill={targetSkill}
                  isSelected={selectedTargetSkillIndex === index}
                />
                
                {/* Essential Skills Accordion */}
                <AccordionSkills
                  title="Essential Skills"
                  skills={essentialSkills}
                  colorScheme="red"
                  accordionId={`essential-${index}`}
                  isExpanded={expandedAccordions[`essential-${index}`] || false}
                  onToggle={() => toggleAccordion(`essential-${index}`)}
                />

                {/* Helpful Skills Accordion */}
                <AccordionSkills
                  title="Helpful Skills"
                  skills={helpfulSkills}
                  colorScheme="green"
                  accordionId={`helpful-${index}`}
                  isExpanded={expandedAccordions[`helpful-${index}`] || false}
                  onToggle={() => toggleAccordion(`helpful-${index}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No target skills specified for this lesson.</p>
          </div>
        )}
      </div>

      {/* Vocabulary Section */}
      {selectedLesson.vocabulary && selectedLesson.vocabulary.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Vocabulary ({selectedLesson.vocabulary.length})
          </h2>
          <div className="space-y-3">
            {selectedLesson.vocabulary.map((term, index) => {
              // Split by first colon to separate term from definition
              const colonIndex = term.indexOf(':');
              const word = colonIndex > -1 ? term.substring(0, colonIndex).trim() : term;
              const definition = colonIndex > -1 ? term.substring(colonIndex + 1).trim() : '';

              return (
                <AccordionList
                  key={index}
                  title={word}
                  items={definition ? [{ label: definition }] : []}
                  colorScheme="purple"
                  accordionId={`vocab-${index}`}
                  isExpanded={expandedAccordions[`vocab-${index}`] || false}
                  onToggle={() => toggleAccordion(`vocab-${index}`)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
