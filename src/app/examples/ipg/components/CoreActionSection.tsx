"use client";

import { IPGScoreCard } from "./IPGScoreCard";

interface CoreAction1Data {
  ca1a_gradeLevel?: string;
  ca1b_priorSkills?: string;
  ca1c_rigorTargeting?: string;
}

interface CoreAction2Data {
  ca2a_makeExplicit?: number;
  ca2b_shareRepresentations?: number;
  ca2c_checkUnderstanding?: number;
  ca2d_facilitateSummary?: number;
}

interface CoreAction3Data {
  ca3a_gradeLevelProblems?: number;
  ca3b_productiveStruggle?: number;
  ca3c_explainThinking?: number;
  ca3d_studentConversations?: number;
  ca3e_mathematicalLanguage?: number;
}

interface CoreActionSectionProps {
  title: string;
  data: CoreAction1Data | CoreAction2Data | CoreAction3Data;
  type: "coreAction1" | "coreAction2" | "coreAction3";
}

export function CoreActionSection({
  title,
  data,
  type,
}: CoreActionSectionProps) {
  const renderCards = () => {
    if (type === "coreAction1") {
      const ca1Data = data as CoreAction1Data;
      return (
        <>
          <IPGScoreCard
            label="1A - Grade Level Focus"
            yesNo={ca1Data.ca1a_gradeLevel}
          />
          <IPGScoreCard
            label="1B - Prior Skills Connection"
            yesNo={ca1Data.ca1b_priorSkills}
          />
          <IPGScoreCard
            label="1C - Rigor Targeting"
            yesNo={ca1Data.ca1c_rigorTargeting}
          />
        </>
      );
    }

    if (type === "coreAction2") {
      const ca2Data = data as CoreAction2Data;
      return (
        <>
          <IPGScoreCard
            label="2A - Make Math Explicit"
            score={ca2Data.ca2a_makeExplicit}
          />
          <IPGScoreCard
            label="2B - Share Representations"
            score={ca2Data.ca2b_shareRepresentations}
          />
          <IPGScoreCard
            label="2C - Check Understanding"
            score={ca2Data.ca2c_checkUnderstanding}
          />
          <IPGScoreCard
            label="2D - Facilitate Summary"
            score={ca2Data.ca2d_facilitateSummary}
          />
        </>
      );
    }

    if (type === "coreAction3") {
      const ca3Data = data as CoreAction3Data;
      return (
        <>
          <IPGScoreCard
            label="3A - Grade Level Problems"
            score={ca3Data.ca3a_gradeLevelProblems}
          />
          <IPGScoreCard
            label="3B - Productive Struggle"
            score={ca3Data.ca3b_productiveStruggle}
          />
          <IPGScoreCard
            label="3C - Explain Thinking"
            score={ca3Data.ca3c_explainThinking}
          />
          <IPGScoreCard
            label="3D - Student Conversations"
            score={ca3Data.ca3d_studentConversations}
          />
          <IPGScoreCard
            label="3E - Mathematical Language"
            score={ca3Data.ca3e_mathematicalLanguage}
          />
        </>
      );
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
      <div className="space-y-3">{renderCards()}</div>
    </div>
  );
}
