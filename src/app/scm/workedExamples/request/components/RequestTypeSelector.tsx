"use client";

import {
  CheckCircleIcon,
  AcademicCapIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";

export type RequestType = "mastery-check" | "prerequisite-skill" | "custom";

interface RequestTypeSelectorProps {
  selectedType: RequestType | null;
  onTypeSelect: (type: RequestType) => void;
  disabled?: boolean;
}

interface TypeCardProps {
  type: RequestType;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function TypeCard({
  type: _type,
  title,
  description,
  icon,
  isSelected,
  onClick,
  disabled,
}: TypeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 p-6 rounded-lg border-2 transition-all text-left cursor-pointer
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
          flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
          ${isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}
        `}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-semibold ${isSelected ? "text-blue-900" : "text-gray-900"}`}
            >
              {title}
            </h3>
            {isSelected && (
              <CheckCircleSolidIcon className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <p
            className={`text-sm mt-1 ${isSelected ? "text-blue-700" : "text-gray-600"}`}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export function RequestTypeSelector({
  selectedType,
  onTypeSelect,
  disabled,
}: RequestTypeSelectorProps) {
  const typeConfigs: {
    type: RequestType;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: "mastery-check",
      title: "Mastery Check",
      description:
        "Create a worked example from the lesson's target skills practice problems.",
      icon: <CheckCircleIcon className="w-6 h-6" />,
    },
    {
      type: "prerequisite-skill",
      title: "Prerequisite Skill",
      description:
        "Browse prerequisite skills and select a practice problem for students who need extra support.",
      icon: <AcademicCapIcon className="w-6 h-6" />,
    },
    {
      type: "custom",
      title: "Custom",
      description:
        "Upload your own problem image and provide custom details for the worked example.",
      icon: <PencilSquareIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardDocumentListIcon className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Select Request Type
        </h2>
      </div>
      <div className="flex gap-4">
        {typeConfigs.map((config) => (
          <TypeCard
            key={config.type}
            type={config.type}
            title={config.title}
            description={config.description}
            icon={config.icon}
            isSelected={selectedType === config.type}
            onClick={() => onTypeSelect(config.type)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
