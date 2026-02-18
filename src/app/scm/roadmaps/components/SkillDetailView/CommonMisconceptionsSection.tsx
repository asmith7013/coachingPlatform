"use client";

interface CommonMisconceptionsSectionProps {
  commonMisconceptions: string;
}

export function CommonMisconceptionsSection({
  commonMisconceptions,
}: CommonMisconceptionsSectionProps) {
  if (!commonMisconceptions) return null;

  return (
    <div className="border-b border-gray-200 py-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">
        Common Misconceptions
      </h4>
      <div
        className="text-sm text-gray-600 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: commonMisconceptions }}
      />
    </div>
  );
}
