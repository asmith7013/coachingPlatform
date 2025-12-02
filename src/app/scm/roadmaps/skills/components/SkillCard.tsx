"use client";

interface SkillCardProps {
  skillNumber: string;
  title: string;
  onClick: () => void;
}

export function SkillCard({ skillNumber, title, onClick }: SkillCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group"
    >
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-bold text-blue-600 group-hover:text-blue-700">
          {skillNumber}
        </div>
        <div className="text-sm font-medium text-gray-900 line-clamp-2">
          {title}
        </div>
      </div>
    </div>
  );
}
