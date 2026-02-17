import React, { useState } from "react";
import { tv } from "tailwind-variants";
import { Textarea } from "@/components/core/fields/Textarea";

interface TranscriptsProps {
  formData: {
    transcripts: {
      warmUpLaunch: string;
      activity1Launch: string;
      activity2Launch: string;
      synthesisLaunch: string;
    };
  };
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

const sectionTitle = tv({
  base: "text-lg font-semibold border-b pb-2 mb-3",
});

const tabButton = tv({
  base: "px-4 py-2 text-sm font-medium",
  variants: {
    active: {
      true: "border-b-2 border-blue-500 text-blue-600",
      false: "text-gray-500 hover:text-gray-700",
    },
  },
});

const Transcripts: React.FC<TranscriptsProps> = ({
  formData,
  handleInputChange,
}) => {
  const [activeTab, setActiveTab] = useState<string>("warmUp");

  return (
    <div className="mt-6">
      <h3 className={sectionTitle()}>Transcripts</h3>

      <div className="tabs-container">
        <div className="tabs-list mb-2 flex border-b">
          <button
            type="button"
            className={tabButton({ active: activeTab === "warmUp" })}
            onClick={() => setActiveTab("warmUp")}
          >
            Warm Up
          </button>
          <button
            type="button"
            className={tabButton({ active: activeTab === "activity1" })}
            onClick={() => setActiveTab("activity1")}
          >
            Activity 1
          </button>
          <button
            type="button"
            className={tabButton({ active: activeTab === "activity2" })}
            onClick={() => setActiveTab("activity2")}
          >
            Activity 2
          </button>
          <button
            type="button"
            className={tabButton({ active: activeTab === "synthesis" })}
            onClick={() => setActiveTab("synthesis")}
          >
            Synthesis
          </button>
        </div>

        {activeTab === "warmUp" && (
          <div className="tab-content">
            <Textarea
              name="transcripts.warmUpLaunch"
              value={formData.transcripts.warmUpLaunch}
              onChange={handleInputChange}
              placeholder="Transcript of warm up launch"
              rows={5}
            />
          </div>
        )}

        {activeTab === "activity1" && (
          <div className="tab-content">
            <Textarea
              name="transcripts.activity1Launch"
              value={formData.transcripts.activity1Launch}
              onChange={handleInputChange}
              placeholder="Transcript of activity 1 launch"
              rows={5}
            />
          </div>
        )}

        {activeTab === "activity2" && (
          <div className="tab-content">
            <Textarea
              name="transcripts.activity2Launch"
              value={formData.transcripts.activity2Launch}
              onChange={handleInputChange}
              placeholder="Transcript of activity 2 launch"
              rows={5}
            />
          </div>
        )}

        {activeTab === "synthesis" && (
          <div className="tab-content">
            <Textarea
              name="transcripts.synthesisLaunch"
              value={formData.transcripts.synthesisLaunch}
              onChange={handleInputChange}
              placeholder="Transcript of synthesis launch"
              rows={5}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Transcripts;
