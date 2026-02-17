"use client";

import React from "react";
import { tv } from "tailwind-variants";
import { Input } from "@components/core/fields/Input";
import { Textarea } from "@components/core/fields/Textarea";
import { ReferenceSelect } from "@components/core/fields/ReferenceSelect";
import { getStaffUrl } from "@server/api/client/api_endpoints";
import { ClassroomObservationInput } from "@zod-schema/visits/classroom-observation";

const fieldLabel = tv({
  base: "text-sm font-medium text-gray-700 mb-1",
});

interface BasicInfoTabProps {
  formData: ClassroomObservationInput;
  selectedTeacher: string;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onTeacherChange: (value: string) => void;
}

export function BasicInfoTab({
  formData,
  selectedTeacher,
  onInputChange,
  onTeacherChange,
}: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Header Information - Exact layout from screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={fieldLabel()}>Cycle</label>
          <Input
            name="cycle"
            value={formData.cycle as string}
            onChange={onInputChange}
            placeholder="Cycle #"
          />
        </div>
        <div>
          <label className={fieldLabel()}>Session</label>
          <Input
            name="session"
            value={formData.session as string}
            onChange={onInputChange}
            placeholder="Session #"
          />
        </div>
        <div>
          <label className={fieldLabel()}>Date</label>
          <Input
            type="date"
            name="date"
            value={
              formData.date instanceof Date
                ? formData.date.toISOString().split("T")[0]
                : (formData.date || "").toString().split("T")[0]
            }
            onChange={(e) => {
              const dateValue = e.target.value;
              const syntheticEvent = {
                target: {
                  name: "date",
                  value: new Date(dateValue).toISOString(),
                },
              } as React.ChangeEvent<HTMLInputElement>;
              onInputChange(syntheticEvent);
            }}
          />
        </div>
        <div>
          <ReferenceSelect
            label="Teacher"
            url={getStaffUrl("nycps")}
            value={selectedTeacher}
            onChange={(value) =>
              onTeacherChange(Array.isArray(value) ? value[0] : value)
            }
            placeholder="Select Teacher"
          />
        </div>
      </div>
      {/* Lesson Information */}
      <div>
        <label className={fieldLabel()}>Lesson Title</label>
        <Input
          name="lessonTitle"
          value={(formData.lessonTitle as string) || ""}
          onChange={onInputChange}
          placeholder="Lesson title or topic"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={fieldLabel()}>Course</label>
          <Input
            name="lessonCourse"
            value={(formData.lessonCourse as string) || ""}
            onChange={onInputChange}
            placeholder="Course name"
          />
        </div>
        <div>
          <label className={fieldLabel()}>Unit</label>
          <Input
            name="lessonUnit"
            value={(formData.lessonUnit as string) || ""}
            onChange={onInputChange}
            placeholder="Unit name"
          />
        </div>
        <div>
          <label className={fieldLabel()}>Lesson Number</label>
          <Input
            name="lessonNumber"
            value={(formData.lessonNumber as string) || ""}
            onChange={onInputChange}
            placeholder="Lesson #"
          />
        </div>
      </div>
      <div>
        <label className={fieldLabel()}>Other Context</label>
        <Textarea
          name="otherContext"
          value={formData.otherContext as string}
          onChange={onInputChange}
          placeholder="Additional context about the classroom, students, etc."
          rows={2}
        />
      </div>
    </div>
  );
}
