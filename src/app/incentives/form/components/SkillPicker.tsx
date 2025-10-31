"use client";

import React, { useState, useEffect } from "react";
import { fetchUnitSkills } from "../actions";

interface Skill {
  _id: string;
  skillNumber: string;
  title: string;
}

interface SkillPickerProps {
  unitId: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

/**
 * Dropdown for skill selection (Small Group Prerequisite)
 */
export function SkillPicker({
  unitId,
  value,
  onChange,
  required = false,
}: SkillPickerProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSkills() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchUnitSkills(unitId);

        if (result.success && result.data) {
          setSkills(result.data as Skill[]);
        } else {
          setError(result.error || "Failed to load skills");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    loadSkills();
  }, [unitId]);

  if (isLoading) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
        Loading skills...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
        No prerequisite skills found for this unit
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select skill...</option>
      {skills.map((skill) => (
        <option key={skill._id} value={skill.skillNumber}>
          {skill.skillNumber} - {skill.title}
        </option>
      ))}
    </select>
  );
}
