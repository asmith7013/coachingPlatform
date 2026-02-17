"use client";

import React, { useState, useEffect } from "react";
import { fetchUnitSkills, CategorizedSkill } from "../actions";

interface SkillPickerProps {
  unitId: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const CATEGORY_LABELS: Record<CategorizedSkill["category"], string> = {
  target: "🎯 Target Skills",
  essential: "⚡ Essential Prerequisites",
  helpful: "💡 Helpful Prerequisites",
};

/**
 * Dropdown for skill selection (Small Group Prerequisite)
 * Groups skills by category with header rows
 */
export function SkillPicker({
  unitId,
  value,
  onChange,
  required = false,
}: SkillPickerProps) {
  const [skills, setSkills] = useState<CategorizedSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSkills() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchUnitSkills(unitId);

        if (typeof result !== "string" && result.success && result.data) {
          setSkills(result.data as CategorizedSkill[]);
        } else {
          setError(
            typeof result !== "string" && result.error
              ? result.error
              : "Failed to load skills",
          );
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

  // Group skills by category
  const groupedSkills = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<CategorizedSkill["category"], CategorizedSkill[]>,
  );

  // Render order
  const categoryOrder: CategorizedSkill["category"][] = [
    "target",
    "essential",
    "helpful",
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select skill...</option>
      {categoryOrder.map((category) => {
        const categorySkills = groupedSkills[category];
        if (!categorySkills || categorySkills.length === 0) return null;

        return (
          <optgroup key={category} label={CATEGORY_LABELS[category]}>
            {categorySkills.map((skill) => (
              <option key={skill._id} value={skill.skillNumber}>
                {skill.skillNumber} - {skill.title}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
