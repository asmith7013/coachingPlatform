interface LearningContentPanelProps {
  isEditMode: boolean;
  learningContent: string;
  onLearningContentChange: (content: string) => void;
  parsedLearningContent: string[];
  textSizeLevel?: number; // -1 = smaller, 0 = normal, 1 = larger
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
  textSizeLevel = 0,
}: LearningContentPanelProps) {
  const displayContent =
    parsedLearningContent.length > 0 ? parsedLearningContent : DEFAULT_CONTENT;

  // Text size helper based on textSizeLevel (-1, 0, 1, 2)
  const getTextSize = (
    smaller: string,
    normal: string,
    larger: string,
    extraLarge: string,
  ) => {
    if (textSizeLevel === 2) return extraLarge;
    if (textSizeLevel === 1) return larger;
    if (textSizeLevel === -1) return smaller;
    return normal;
  };

  return (
    <div
      className={`bg-indigo-100 rounded-xl p-5 border-4 border-indigo-300 ${getTextSize("w-72", "w-80", "w-96", "w-[28rem]")}`}
    >
      <h3
        className={`text-indigo-900 font-bold mb-4 text-center ${getTextSize("text-base", "text-lg", "text-xl", "text-2xl")}`}
      >
        What We&apos;re Learning
      </h3>
      {isEditMode ? (
        <div>
          <textarea
            value={learningContent}
            onChange={(e) => onLearningContentChange(e.target.value)}
            placeholder="Enter learning objectives (one per line)&#10;- Learn equivalent expressions&#10;- Practice combining like terms"
            className={`w-full h-40 p-3 border border-indigo-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${getTextSize("text-xs", "text-sm", "text-base", "text-lg")}`}
          />
          <p
            className={`text-indigo-600 mt-2 ${getTextSize("text-[10px]", "text-xs", "text-sm", "text-base")}`}
          >
            Enter one item per line. Use &quot;-&quot; or just text.
          </p>
        </div>
      ) : (
        <ul
          className={`space-y-3 text-indigo-900 ${getTextSize("text-sm", "text-base", "text-lg", "text-xl")}`}
        >
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
