import { useState, useEffect } from 'react';
import { getRoadmapsLessons } from '@actions/313/roadmaps-lessons';
import { RoadmapsLesson } from '@zod-schema/313/roadmap';

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
      status: 'Demonstrated' | 'Attempted But Not Passed' | 'Not Started';
      score?: string;
      lastUpdated?: string;
    }>;
  } | null;
}

// Helper function to get mastery status styling (moved from TargetSkillCard)
const getMasteryStyles = (status?: string) => {
  switch (status) {
    case 'Demonstrated':
      return {
        containerClass: 'opacity-60 bg-gray-50',
        textClass: 'text-gray-500 line-through',
        indicator: '✅',
        indicatorClass: 'text-green-600'
      };
    case 'Attempted But Not Passed':
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
    masteryStatus?: 'Demonstrated' | 'Attempted But Not Passed' | 'Not Started';
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
                targetSkill.masteryStatus === 'Demonstrated' 
                  ? 'bg-green-600 text-white'
                  : targetSkill.masteryStatus === 'Attempted But Not Passed'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}>
                <span>
                  {targetSkill.masteryStatus === 'Demonstrated' 
                    ? '✓'
                    : targetSkill.masteryStatus === 'Attempted But Not Passed'
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
    masteryStatus?: 'Demonstrated' | 'Attempted But Not Passed' | 'Not Started';
  }>;
  colorScheme: 'red' | 'green';
  accordionId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function AccordionSkills({ title, skills, colorScheme, isExpanded, onToggle }: AccordionSkillsProps) {
  const colorClasses = colorScheme === 'red' 
    ? {
        headerBg: 'bg-red-100',
        headerText: 'text-red-800',
        headerBorder: 'border-red-200',
        icon: 'text-red-600'
      }
    : {
        headerBg: 'bg-green-100',
        headerText: 'text-green-800', 
        headerBorder: 'border-green-200',
        icon: 'text-green-600'
      };

  // Count skills by mastery status - combine into complete/incomplete
  const completeCount = skills.filter(skill => skill.masteryStatus === 'Demonstrated').length;
  const incompleteCount = skills.length - completeCount;

  return (
    <div className={`border ${colorClasses.headerBorder} rounded-lg overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full ${colorClasses.headerBg} ${colorClasses.headerText} p-3 text-left flex items-center justify-between hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-sm">{title}</h4>
          <div className="flex items-center gap-1">
            {/* Complete Skills Badge */}
            {completeCount > 0 && (
              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <span>✓</span>
                <span>{completeCount}</span>
              </span>
            )}
            
            {/* Incomplete Skills Badge */}
            {incompleteCount > 0 && (
              <span className={`${
                colorScheme === 'red' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
              } px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                <span>○</span>
                <span>{incompleteCount}</span>
              </span>
            )}
          </div>
        </div>
        <span className={`${colorClasses.icon} transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-3 space-y-2 bg-white">
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <SkillCard 
                key={index}
                skill={skill}
                colorScheme={colorScheme}
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm italic">
              No {title.toLowerCase()} identified
            </p>
          )}
        </div>
      )}
    </div>
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
    masteryStatus?: 'Demonstrated' | 'Attempted But Not Passed' | 'Not Started';
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
              skill.masteryStatus === 'Demonstrated' 
                ? 'bg-green-600 text-white'
                : skill.masteryStatus === 'Attempted But Not Passed'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}>
              <span>
                {skill.masteryStatus === 'Demonstrated' 
                  ? '✓'
                  : skill.masteryStatus === 'Attempted But Not Passed'
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
    </div>
  );
}
