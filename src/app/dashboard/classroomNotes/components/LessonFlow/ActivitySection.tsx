import React from "react";
import { tv } from "tailwind-variants";
import { Textarea } from "@/components/core/fields/Textarea";

interface ActivitySectionProps {
  title: string;
  section: string;
  data: {
    launch: string;
    workTime: string;
    synthesis: string;
  };
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

const subsectionTitle = tv({
  base: "text-base font-medium mt-4 mb-2",
});

const activitySection = tv({
  base: "border rounded-md p-3 mt-3 bg-gray-50",
});

const fieldLabel = tv({
  base: "text-sm font-medium text-gray-700 mb-1",
});

const ActivitySection: React.FC<ActivitySectionProps> = ({
  title,
  section,
  data,
  handleInputChange,
}) => {
  return (
    <div className={activitySection()}>
      <h4 className={subsectionTitle()}>{title}</h4>
      <div className="space-y-3">
        <div>
          <label className={fieldLabel()}>Launch</label>
          <Textarea
            name={`${section}.launch`}
            value={data.launch}
            onChange={handleInputChange}
            placeholder={`${title} launch notes`}
            rows={2}
          />
        </div>
        <div>
          <label className={fieldLabel()}>Work Time</label>
          <Textarea
            name={`${section}.workTime`}
            value={data.workTime}
            onChange={handleInputChange}
            placeholder={`${title} work time notes`}
            rows={2}
          />
        </div>
        <div>
          <label className={fieldLabel()}>Synthesis</label>
          <Textarea
            name={`${section}.synthesis`}
            value={data.synthesis}
            onChange={handleInputChange}
            placeholder={`${title} synthesis notes`}
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default ActivitySection;
