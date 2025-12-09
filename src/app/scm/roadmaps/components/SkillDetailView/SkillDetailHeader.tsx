"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

export const colorClasses = {
  blue: 'bg-skill-target',
  green: 'bg-skill-target',
  orange: 'bg-skill-essential',
  purple: 'bg-skill-helpful',
};

interface SkillDetailHeaderProps {
  skillNumber: string;
  title: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onClose?: () => void;
}

export function SkillDetailHeader({ skillNumber, title, color, onClose }: SkillDetailHeaderProps) {
  return (
    <div className="border-b border-gray-200 p-6 bg-gray-50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-sm flex-shrink-0 ${colorClasses[color]}`}>
            {skillNumber}
          </span>
          <div>
            <div className="text-xl font-bold text-gray-900">
              {title}
            </div>
            <a
              href={`https://roadmaps.teachtoone.org/skill/${skillNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
            >
              Open Skill on Roadmaps →
            </a>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 cursor-pointer"
            title="Close skill details"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
