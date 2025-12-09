"use client";

interface EssentialQuestionSectionProps {
  essentialQuestion: string;
}

export function EssentialQuestionSection({ essentialQuestion }: EssentialQuestionSectionProps) {
  if (!essentialQuestion) return null;

  return (
    <div className="border-b border-gray-200 py-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Essential Question</h4>
      <p className="text-sm text-gray-600">{essentialQuestion}</p>
    </div>
  );
}
