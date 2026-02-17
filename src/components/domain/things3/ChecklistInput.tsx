import React from "react";
import { FormSection } from "@components/composed/forms/FormSection";
import { Button } from "@/components/core/Button";
import { Label } from "@/components/core/fields/Label";
import { Text } from "@/components/core/typography/Text";
import { Textarea } from "@/components/core/fields/Textarea";

interface ChecklistInputProps {
  inputMode: "text" | "json";
  setInputMode: (mode: "text" | "json") => void;
  checklistInput: string;
  setChecklistInput: (value: string) => void;
  jsonInput: string;
  setJsonInput: (value: string) => void;
  loadSampleData: () => void;
}

export function ChecklistInput({
  inputMode,
  setInputMode,
  checklistInput,
  setChecklistInput,
  jsonInput,
  setJsonInput,
  loadSampleData,
}: ChecklistInputProps) {
  return (
    <FormSection title="Input Format">
      <div className="flex space-x-4 mb-4">
        <Button
          intent={inputMode === "text" ? "primary" : "secondary"}
          appearance={inputMode === "text" ? "solid" : "outline"}
          onClick={() => setInputMode("text")}
        >
          Text Format
        </Button>
        <Button
          intent={inputMode === "json" ? "primary" : "secondary"}
          appearance={inputMode === "json" ? "solid" : "outline"}
          onClick={() => setInputMode("json")}
        >
          JSON Format
        </Button>
        <Button intent="secondary" textSize="sm" onClick={loadSampleData}>
          Load Sample
        </Button>
      </div>

      {inputMode === "text" ? (
        <div>
          <Label htmlFor="checklist">Paste your checklist here</Label>
          <Text className="text-sm mb-2">
            Use numbered items (1. 2.) for sections and bullets (*) for tasks
          </Text>
          <Textarea
            placeholder="Paste your checklist here. Use numbered items (1. 2.) for sections and bullets (*) for tasks"
            className="min-h-[200px] mb-4"
            value={checklistInput}
            onChange={(e) => setChecklistInput(e.target.value)}
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="jsonInput">JSON Structure</Label>
          <Text className="text-sm mb-2">
            Enter your checklist as a JSON object with the structure shown below
          </Text>
          <Textarea
            placeholder={`{
  "title": "Project Title",
  "notes": "Project notes",
  "when": "anytime",
  "items": [
    {
      "title": "Section Title",
      "type": "heading",
      "children": [
        {
          "title": "Task 1",
          "type": "task"
        }
      ]
    }
  ]
}`}
            className="min-h-[200px] mb-4 font-mono text-sm"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
        </div>
      )}
    </FormSection>
  );
}
