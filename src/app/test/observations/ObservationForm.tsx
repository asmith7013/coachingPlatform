"use client";

import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/composed/cards";
import { Text } from "@/components/core/typography/Text";
import { Heading } from "@/components/core/typography/Heading";
import { Input } from "@components/core/fields/Input";
import { Select } from "@components/core/fields/Select";
import { ReferenceSelect } from "@components/core/fields/ReferenceSelect";
import { Textarea } from "@components/core/fields/Textarea";
import {
  ClassroomObservationInput,
  ClassroomObservationInputZodSchema,
} from "@/lib/schema/zod-schema/visits/classroom-observation";

interface ObservationFormProps {
  mode: "create" | "edit";
  initialData: ClassroomObservationInput;
  onSubmit: (data: ClassroomObservationInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string;
}

export function ObservationForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
}: ObservationFormProps) {
  const [activeSection, setActiveSection] = useState<string>("basic");

  const form = useForm({
    defaultValues: ClassroomObservationInputZodSchema.parse(initialData || {}),
    validators: {
      onSubmit: (values) => {
        const result = ClassroomObservationInputZodSchema.safeParse(values);
        if (!result.success) throw result.error;
        return result.data;
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as ClassroomObservationInput);
    },
  });

  // Section field rendering (explicit, not config-driven)
  const renderSectionFields = (section: string) => {
    switch (section) {
      case "basic":
        return (
          <>
            <form.Field name="cycle">
              {(field) => <Input fieldApi={field} label="Cycle" />}
            </form.Field>
            <form.Field name="session">
              {(field) => <Input fieldApi={field} label="Session" />}
            </form.Field>
            <form.Field name="date">
              {(field) => <Input fieldApi={field} label="Date" type="date" />}
            </form.Field>
            <form.Field name="teacherId">
              {(field) => (
                <ReferenceSelect
                  fieldApi={field}
                  value={field.state.value as string}
                  onChange={field.handleChange}
                  label="Teacher"
                  url="/api/staff"
                />
              )}
            </form.Field>
            <form.Field name="coachId">
              {(field) => (
                <ReferenceSelect
                  fieldApi={field}
                  value={field.state.value as string}
                  onChange={field.handleChange}
                  label="Coach"
                  url="/api/staff"
                />
              )}
            </form.Field>
            <form.Field name="schoolId">
              {(field) => (
                <ReferenceSelect
                  fieldApi={field}
                  value={field.state.value as string}
                  onChange={field.handleChange}
                  label="School"
                  url="/api/schools"
                />
              )}
            </form.Field>
            <form.Field name="status">
              {(field) => (
                <Select
                  fieldApi={field}
                  value={field.state.value as string}
                  onChange={field.handleChange}
                  label="Status"
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "final", label: "Final" },
                  ]}
                />
              )}
            </form.Field>
          </>
        );
      case "lesson":
        return (
          <>
            <form.Field name="lessonTitle">
              {(field) => <Input fieldApi={field} label="Lesson Title" />}
            </form.Field>
            <form.Field name="lessonCourse">
              {(field) => <Input fieldApi={field} label="Lesson Course" />}
            </form.Field>
            <form.Field name="lessonUnit">
              {(field) => <Input fieldApi={field} label="Lesson Unit" />}
            </form.Field>
            <form.Field name="lessonNumber">
              {(field) => <Input fieldApi={field} label="Lesson Number" />}
            </form.Field>
            <form.Field name="lessonCurriculum">
              {(field) => <Input fieldApi={field} label="Lesson Curriculum" />}
            </form.Field>
          </>
        );
      case "context":
        return (
          <>
            <form.Field name="otherContext">
              {(field) => <Textarea fieldApi={field} label="Other Context" />}
            </form.Field>
            <form.Field name="coolDown">
              {(field) => <Textarea fieldApi={field} label="Cool Down" />}
            </form.Field>
          </>
        );
      case "settings":
        return (
          <>
            <form.Field name="isSharedWithTeacher">
              {(field) => (
                <Select
                  fieldApi={field}
                  value={String(field.state.value)}
                  onChange={(v) => field.handleChange(v === "true")}
                  label="Shared with Teacher"
                  options={[
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]}
                />
              )}
            </form.Field>
          </>
        );
      case "references":
        return (
          <>
            <form.Field name="visitId">
              {(field) => <Input fieldApi={field} label="Visit ID" />}
            </form.Field>
            <form.Field name="coachingActionPlanId">
              {(field) => (
                <Input fieldApi={field} label="Coaching Action Plan ID" />
              )}
            </form.Field>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <Card.Header>
        <Heading level="h3">
          {mode === "create" ? "Create New Observation" : "Edit Observation"}
        </Heading>
        <Text textSize="sm" color="muted">
          {mode === "create"
            ? "Fill in the observation details below"
            : "Update the observation details below"}
        </Text>
      </Card.Header>
      <Card.Body>
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <Text color="danger">{error}</Text>
          </div>
        )}
        {/* Section Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {Object.entries({
              basic: "Basic Info",
              lesson: "Lesson Details",
              context: "Context",
              settings: "Settings",
              references: "References",
            }).map(([key, title]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {title}
              </button>
            ))}
          </nav>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <fieldset disabled={isSubmitting} className="space-y-4">
            <div className="min-h-[400px]">
              <div className="space-y-4">
                <Heading level="h4">
                  {
                    Object.entries({
                      basic: "Basic Information",
                      lesson: "Lesson Details",
                      context: "Context",
                      settings: "Settings",
                      references: "References",
                    }).find(([key]) => key === activeSection)?.[1]
                  }
                </Heading>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSectionFields(activeSection)}
                </div>
              </div>
            </div>
            {/* Form Actions */}
            <div className="flex justify-end pt-6">
              <Button
                appearance="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.state.canSubmit}
                loading={isSubmitting}
                className="ml-4"
              >
                Save
              </Button>
            </div>
          </fieldset>
        </form>
      </Card.Body>
    </Card>
  );
}
