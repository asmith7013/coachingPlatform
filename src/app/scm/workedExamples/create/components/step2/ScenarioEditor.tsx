"use client";

import type { Scenario } from "../../lib/types";

interface ScenarioEditorProps {
  scenario: Scenario;
  onChange: (scenario: Scenario) => void;
}

export function ScenarioEditor({ scenario, onChange }: ScenarioEditorProps) {
  return (
    <div className="space-y-2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={scenario.name}
          onChange={(e) => onChange({ ...scenario, name: e.target.value })}
          placeholder="Scenario name"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="text"
          value={scenario.themeIcon}
          onChange={(e) => onChange({ ...scenario, themeIcon: e.target.value })}
          placeholder="Icon"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <input
        type="text"
        value={scenario.context}
        onChange={(e) => onChange({ ...scenario, context: e.target.value })}
        placeholder="Context"
        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="text"
        value={scenario.numbers}
        onChange={(e) => onChange({ ...scenario, numbers: e.target.value })}
        placeholder="Numbers used"
        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <textarea
        value={scenario.description}
        onChange={(e) => onChange({ ...scenario, description: e.target.value })}
        placeholder="Full problem description"
        rows={3}
        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
