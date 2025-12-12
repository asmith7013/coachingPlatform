interface LearningContentPanelProps {
  isEditMode: boolean;
  learningContent: string;
  onLearningContentChange: (content: string) => void;
  parsedLearningContent: string[];
}

const DEFAULT_CONTENT = [
  "Get ready for our unit about equations",
  "Steps to solve equations",
  "Strategies for making equations simpler (simplifying)",
];

export function LearningContentPanel({
  isEditMode,
  learningContent,
  onLearningContentChange,
  parsedLearningContent,
}: LearningContentPanelProps) {
  const displayContent = parsedLearningContent.length > 0 ? parsedLearningContent : DEFAULT_CONTENT;

  return (
    <div className="w-80 bg-indigo-100 rounded-xl p-5 border-4 border-indigo-300">
      <h3 className="text-indigo-900 font-bold text-lg mb-4 text-center">
        What We&apos;re Learning
      </h3>
      {isEditMode ? (
        <div>
          <textarea
            value={learningContent}
            onChange={(e) => onLearningContentChange(e.target.value)}
            placeholder="Enter learning objectives (one per line)&#10;- Learn equivalent expressions&#10;- Practice combining like terms"
            className="w-full h-40 p-3 border border-indigo-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <p className="text-xs text-indigo-600 mt-2">
            Enter one item per line. Use &quot;-&quot; or just text.
          </p>
        </div>
      ) : (
        <ul className="space-y-3 text-indigo-900">
          {displayContent.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold mt-0.5">•</span>
              <div>{item}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
