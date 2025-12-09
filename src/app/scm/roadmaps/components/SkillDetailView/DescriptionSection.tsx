"use client";

interface DescriptionSectionProps {
  description: string;
}

export function DescriptionSection({ description }: DescriptionSectionProps) {
  if (!description) return null;

  return (
    <div className="border-b border-gray-200 pb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
      <div
        className="text-sm text-gray-600 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}
