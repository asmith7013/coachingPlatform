import React from "react";
import { tv } from "tailwind-variants";
import { Input } from "@/components/core/fields/Input";
import { FormData } from "../../page";

interface BasicInfoProps {
  formData: FormData;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

const fieldLabel = tv({
  base: "text-sm font-medium text-gray-700 mb-1",
});

const BasicInfo: React.FC<BasicInfoProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div>
        <label className={fieldLabel()}>Cycle</label>
        <Input
          name="cycle"
          value={formData.cycle}
          onChange={handleInputChange}
          placeholder="Cycle #"
        />
      </div>
      <div>
        <label className={fieldLabel()}>Session</label>
        <Input
          name="session"
          value={formData.session}
          onChange={handleInputChange}
          placeholder="Session #"
        />
      </div>
      <div>
        <label className={fieldLabel()}>Date</label>
        <Input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className={fieldLabel()}>Teacher</label>
        <select
          name="teacher"
          value={formData.teacher}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Teacher</option>
          <option value="Ms. Johnson">Ms. Johnson</option>
          <option value="Mr. Smith">Mr. Smith</option>
          <option value="Ms. Garcia">Ms. Garcia</option>
        </select>
      </div>
    </div>
  );
};

export default BasicInfo;
