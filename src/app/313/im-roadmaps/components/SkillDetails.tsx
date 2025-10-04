interface SkillWithDetails {
  originalText: string;
  skillId: string;
  title: string;
  description: string;
  skillChallengeCriteria: string;
  roadmapsUrl: string;
}

interface SkillDetailsProps {
  title: string;
  skills: SkillWithDetails[];
  description: string;
  colorClass: string;
  bgClass: string;
}

export function SkillDetails({ title, skills, description, colorClass, bgClass }: SkillDetailsProps) {
  if (skills.length === 0) {
    return (
      <div className={`border-l-4 ${colorClass} pl-4`}>
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <p className="text-gray-500 italic">No {title.toLowerCase()} specified for this lesson.</p>
      </div>
    );
  }

  return (
    <div className={`border-l-4 ${colorClass} pl-4`}>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {skills.map((skill, index) => (
          <div key={index} className={`${bgClass} p-3 rounded-lg border border-gray-200`}>
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-gray-900 text-sm flex-1 leading-tight">{skill.title}</h5>
              {skill.skillId && (
                <a
                  href={skill.roadmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-xs underline ml-2 whitespace-nowrap"
                >
                  View →
                </a>
              )}
            </div>
            
            {skill.description && (
              <div className="mb-2">
                <p className="text-gray-700 text-xs leading-relaxed">{skill.description}</p>
              </div>
            )}
            
            {skill.skillId && (
              <div className="text-xs text-gray-500">
                ID: {skill.skillId}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
