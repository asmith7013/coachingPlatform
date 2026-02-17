import React from "react";
import { tv } from "tailwind-variants";
import { Checkbox } from "@/components/core/fields/Checkbox";

interface ProgressMonitoringProps {
  formData: {
    progressMonitoring: {
      teacherDebriefing: boolean;
      intentionalCallOuts: boolean;
      studentExplaining: boolean;
      activeListening: boolean;
      engagementMoves: boolean;
      visibleThinking: boolean;
      followUpQuestions: boolean;
    };
  };
  handleCheckboxChange: (name: string) => void;
}

const sectionTitle = tv({
  base: "text-lg font-semibold border-b pb-2 mb-3",
});

const ProgressMonitoring: React.FC<ProgressMonitoringProps> = ({
  formData,
  handleCheckboxChange,
}) => {
  return (
    <div className="mt-6">
      <h3 className={sectionTitle()}>Progress Monitoring</h3>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Checkbox
            id="progress.teacherDebriefing"
            checked={formData.progressMonitoring.teacherDebriefing}
            onChange={() =>
              handleCheckboxChange("progressMonitoring.teacherDebriefing")
            }
          />
          <label htmlFor="progress.teacherDebriefing" className="text-sm">
            Teacher debriefs a portion of the activity to use for the synthesis
          </label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="progress.intentionalCallOuts"
            checked={formData.progressMonitoring.intentionalCallOuts}
            onChange={() =>
              handleCheckboxChange("progressMonitoring.intentionalCallOuts")
            }
          />
          <label htmlFor="progress.intentionalCallOuts" className="text-sm">
            Synthesis begins with the teacher intentionally calling on specific
            students and displaying student work
          </label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="progress.studentExplaining"
            checked={formData.progressMonitoring.studentExplaining}
            onChange={() =>
              handleCheckboxChange("progressMonitoring.studentExplaining")
            }
          />
          <label htmlFor="progress.studentExplaining" className="text-sm">
            Students who are sharing explain their reasoning
          </label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="progress.activeListening"
            checked={formData.progressMonitoring.activeListening}
            onChange={() =>
              handleCheckboxChange("progressMonitoring.activeListening")
            }
          />
          <label htmlFor="progress.activeListening" className="text-sm">
            Students actively listen and engage with peers&apos; contributions
          </label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="progress.engagementMoves"
            checked={formData.progressMonitoring.engagementMoves}
            onChange={() =>
              handleCheckboxChange("progressMonitoring.engagementMoves")
            }
          />
          <label htmlFor="progress.engagementMoves" className="text-sm">
            The teacher uses a variety of engagement moves (turn and talk, cold
            call, etc.)
          </label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="progress.visibleThinking"
            checked={formData.progressMonitoring.visibleThinking}
            onChange={() =>
              handleCheckboxChange("progressMonitoring.visibleThinking")
            }
          />
          <label htmlFor="progress.visibleThinking" className="text-sm">
            The teacher makes student thinking visible
          </label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="progress.followUpQuestions"
            checked={formData.progressMonitoring.followUpQuestions}
            onChange={() =>
              handleCheckboxChange("progressMonitoring.followUpQuestions")
            }
          />
          <label htmlFor="progress.followUpQuestions" className="text-sm">
            The teacher asks follow-up questions to clarify and deepen student
            thinking
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProgressMonitoring;
