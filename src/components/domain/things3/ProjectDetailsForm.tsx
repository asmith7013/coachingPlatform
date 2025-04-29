import React from 'react';
import { FormSection } from '@/components/composed/forms/FormSection';
import { Input } from '@/components/core/fields/Input';
import { Label } from '@/components/core/fields/Label';
import { Select } from '@/components/core/fields/Select';

interface ProjectDetailsFormProps {
  projectTitle: string;
  setProjectTitle: (value: string) => void;
  projectNotes: string;
  setProjectNotes: (value: string) => void;
  projectWhen: string;
  setProjectWhen: (value: string) => void;
}

export function ProjectDetailsForm({
  projectTitle,
  setProjectTitle,
  projectNotes,
  setProjectNotes,
  projectWhen,
  setProjectWhen
}: ProjectDetailsFormProps) {
  return (
    <FormSection title="Project Details">
      <div className="mb-4">
        <Label htmlFor="projectTitle">Project Title</Label>
        <Input
          placeholder="Enter project title"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <Label htmlFor="projectNotes">Project Notes</Label>
        <Input
          placeholder="Optional project notes"
          value={projectNotes}
          onChange={(e) => setProjectNotes(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <Label htmlFor="projectWhen">When</Label>
        <Select 
          options={[
            { value: "today", label: "Today" },
            { value: "tomorrow", label: "Tomorrow" },
            { value: "evening", label: "Evening" },
            { value: "someday", label: "Someday" },
            { value: "anytime", label: "Anytime" }
          ]}
          value={projectWhen}
          onChange={(value) => setProjectWhen(value as string)}
          multiple={false}
        />
      </div>
    </FormSection>
  );
} 