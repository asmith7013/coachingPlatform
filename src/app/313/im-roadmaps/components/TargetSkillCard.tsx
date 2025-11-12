interface SkillWithDetails {
  originalText: string;
  skillId: string;
  title: string;
  description: string;
  skillChallengeCriteria: string;
  roadmapsUrl: string;
  masteryStatus?: 'Mastered' | 'Attempted But Not Mastered' | 'Not Started';
}

interface TargetSkillCardProps {
  targetSkill: SkillWithDetails;
  relatedEssentialSkills: SkillWithDetails[];
  relatedHelpfulSkills: SkillWithDetails[];
}

// Helper function to get mastery status styling
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

export function TargetSkillCard({ 
  targetSkill, 
  relatedEssentialSkills, 
  relatedHelpfulSkills 
}: TargetSkillCardProps) {
  const targetSkillStyles = getMasteryStyles(targetSkill.masteryStatus);
  
  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6 ${targetSkillStyles.containerClass}`}>
      {/* Target Skill Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {targetSkillStyles.indicator && (
                <span className={targetSkillStyles.indicatorClass}>
                  {targetSkillStyles.indicator}
                </span>
              )}
              <h3 className={`text-xl font-bold text-blue-900 ${targetSkillStyles.textClass}`}>
                Target Skill: {targetSkill.title} (Skill {targetSkill.skillId})
              </h3>
            </div>
            {targetSkill.masteryStatus && (
              <div className="mb-2">
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  targetSkill.masteryStatus === 'Mastered' 
                    ? 'bg-green-100 text-green-800'
                    : targetSkill.masteryStatus === 'Attempted But Not Mastered'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {targetSkill.masteryStatus}
                </span>
              </div>
            )}
            <p className={`text-gray-700 mb-3 ${targetSkillStyles.textClass}`}>{targetSkill.description}</p>
            {/* {targetSkill.skillChallengeCriteria && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Challenge Criteria:</p>
                <p className="text-sm text-blue-700">{targetSkill.skillChallengeCriteria}</p>
              </div>
            )} */}
          </div>
          {targetSkill.skillId && (
            <a
              href={targetSkill.roadmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium ml-4"
            >
              View on Roadmaps →
            </a>
          )}
        </div>
        
        {targetSkill.skillId && (
          <div className="text-xs text-gray-500">
            Skill ID: {targetSkill.skillId}
          </div>
        )}
      </div>

      {/* Prerequisites Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-red-700 border-b border-red-200 pb-2">
            Essential Skills
          </h4>
          {relatedEssentialSkills.length > 0 ? (
            <div className="space-y-3">
              {relatedEssentialSkills.map((skill, index) => {
                const skillStyles = getMasteryStyles(skill.masteryStatus);
                return (
                  <div key={index} className={`bg-red-50 p-3 rounded-lg border border-red-100 ${skillStyles.containerClass}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1 flex-1">
                        {skillStyles.indicator && (
                          <span className={skillStyles.indicatorClass}>
                            {skillStyles.indicator}
                          </span>
                        )}
                        <h5 className={`font-medium text-red-900 text-sm ${skillStyles.textClass}`}>
                          {skill.title}
                        </h5>
                      </div>
                      {skill.skillId && (
                        <a
                          href={skill.roadmapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-800 text-xs underline ml-2"
                        >
                          View →
                        </a>
                      )}
                    </div>
                    {skill.masteryStatus && (
                      <div className="mb-1">
                        <span className={`text-xs font-medium px-1 py-0.5 rounded ${
                          skill.masteryStatus === 'Mastered' 
                            ? 'bg-green-100 text-green-700'
                            : skill.masteryStatus === 'Attempted But Not Mastered'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {skill.masteryStatus}
                        </span>
                      </div>
                    )}
                    <p className={`text-red-700 text-xs ${skillStyles.textClass}`}>{skill.description}</p>
                    {skill.skillId && (
                      <div className="text-xs text-red-500 mt-1">ID: {skill.skillId}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No essential prerequisites identified</p>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-green-700 border-b border-green-200 pb-2">
            Helpful Skills
          </h4>
          {relatedHelpfulSkills.length > 0 ? (
            <div className="space-y-3">
              {relatedHelpfulSkills.map((skill, index) => {
                const skillStyles = getMasteryStyles(skill.masteryStatus);
                return (
                  <div key={index} className={`bg-green-50 p-3 rounded-lg border border-green-100 ${skillStyles.containerClass}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1 flex-1">
                        {skillStyles.indicator && (
                          <span className={skillStyles.indicatorClass}>
                            {skillStyles.indicator}
                          </span>
                        )}
                        <h5 className={`font-medium text-green-900 text-sm ${skillStyles.textClass}`}>
                          {skill.title}
                        </h5>
                      </div>
                      {skill.skillId && (
                        <a
                          href={skill.roadmapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 text-xs underline ml-2"
                        >
                          View →
                        </a>
                      )}
                    </div>
                    {skill.masteryStatus && (
                      <div className="mb-1">
                        <span className={`text-xs font-medium px-1 py-0.5 rounded ${
                          skill.masteryStatus === 'Mastered' 
                            ? 'bg-green-100 text-green-700'
                            : skill.masteryStatus === 'Attempted But Not Mastered'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {skill.masteryStatus}
                        </span>
                      </div>
                    )}
                    <p className={`text-green-700 text-xs ${skillStyles.textClass}`}>{skill.description}</p>
                    {skill.skillId && (
                      <div className="text-xs text-green-500 mt-1">ID: {skill.skillId}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No helpful supporting skills identified</p>
          )}
        </div>
      </div>
    </div>
  );
}
