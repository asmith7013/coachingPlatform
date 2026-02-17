"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createSectionConfig } from "./actions";
import { Spinner } from "@/components/core/feedback/Spinner";
import {
  Schools,
  SCOPE_SEQUENCE_TAG_OPTIONS,
  SpecialPopulations,
  AllSections,
  type SchoolsType,
  type AllSectionsType,
  type ScopeSequenceTagType,
  type SpecialPopulationType,
} from "@schema/enum/scm";
import type { Grade } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

interface PodsieGroupInfo {
  id: number;
  groupName: string;
  groupCode: string;
  courseName: string;
}

export default function NewSectionPage() {
  const searchParams = useSearchParams();

  // Pre-fill from URL params (from email link)
  const podsieGroupId = searchParams.get("groupId");
  const podsieGroupName = searchParams.get("groupName");
  const podsieGroupCode = searchParams.get("groupCode");
  const podsieCourseName = searchParams.get("courseName");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [school, setSchool] = useState<SchoolsType | "">("");
  const [classSection, setClassSection] = useState<AllSectionsType | "">(
    (podsieGroupCode as AllSectionsType) || "",
  );
  const [gradeLevel, setGradeLevel] = useState<Grade | "">("");
  const [scopeSequenceTag, setScopeSequenceTag] = useState<
    ScopeSequenceTagType | ""
  >("");
  const [specialPopulations, setSpecialPopulations] = useState<
    SpecialPopulationType[]
  >([]);

  // Podsie group info (from URL params)
  const [groupInfo] = useState<PodsieGroupInfo | null>(
    podsieGroupId
      ? {
          id: parseInt(podsieGroupId),
          groupName: podsieGroupName || "",
          groupCode: podsieGroupCode || "",
          courseName: podsieCourseName || "",
        }
      : null,
  );

  // Update classSection when groupCode changes
  useEffect(() => {
    if (podsieGroupCode && !classSection) {
      setClassSection(podsieGroupCode as AllSectionsType);
    }
  }, [podsieGroupCode, classSection]);

  const handleSpecialPopulationToggle = (population: SpecialPopulationType) => {
    setSpecialPopulations((prev) =>
      prev.includes(population)
        ? prev.filter((p) => p !== population)
        : [...prev, population],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate required fields (TypeScript guard)
    if (!school || !classSection || !gradeLevel) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const result = await createSectionConfig({
        school,
        classSection,
        gradeLevel,
        scopeSequenceTag: scopeSequenceTag || undefined,
        groupId: podsieGroupId || undefined,
        specialPopulations,
      });

      if (result.success) {
        setSuccess(`Section config created for ${school} ${classSection}!`);
        // Reset form after success
        setSchool("");
        setClassSection("");
        setGradeLevel("");
        setScopeSequenceTag("");
        setSpecialPopulations([]);
      } else {
        setError(result.error || "Failed to create section config");
      }
    } catch (err) {
      console.error("Error creating section config:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Get available sections based on school
  const getAvailableSections = () => {
    // For now, return all sections - could filter by school if needed
    return AllSections;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Configure New Section</h1>
          <p className="text-gray-600">
            Create a SectionConfig record for a new Podsie group
          </p>
        </div>

        {/* Podsie Group Info (if provided via URL) */}
        {groupInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Podsie Group Information
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-blue-700 font-medium">Group Name:</dt>
              <dd className="text-blue-900">{groupInfo.groupName}</dd>
              <dt className="text-blue-700 font-medium">Group Code:</dt>
              <dd className="text-blue-900 font-mono">{groupInfo.groupCode}</dd>
              <dt className="text-blue-700 font-medium">Podsie ID:</dt>
              <dd className="text-blue-900 font-mono">{groupInfo.id}</dd>
              <dt className="text-blue-700 font-medium">Course:</dt>
              <dd className="text-blue-900">{groupInfo.courseName}</dd>
            </dl>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="space-y-6">
            {/* School */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School <span className="text-red-500">*</span>
              </label>
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value as SchoolsType | "")}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a school...</option>
                {Schools.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Section <span className="text-red-500">*</span>
              </label>
              <select
                value={classSection}
                onChange={(e) =>
                  setClassSection(e.target.value as AllSectionsType | "")
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a section...</option>
                {getAvailableSections().map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {podsieGroupCode && classSection !== podsieGroupCode && (
                <p className="mt-1 text-sm text-amber-600">
                  Note: Podsie group code is &quot;{podsieGroupCode}&quot;
                </p>
              )}
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level <span className="text-red-500">*</span>
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value as Grade | "")}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a grade level...</option>
                <option value="6">6th Grade</option>
                <option value="7">7th Grade</option>
                <option value="8">8th Grade</option>
                <option value="Algebra 1">Algebra 1</option>
              </select>
            </div>

            {/* Scope Sequence Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scope & Sequence Tag
              </label>
              <select
                value={scopeSequenceTag}
                onChange={(e) =>
                  setScopeSequenceTag(
                    e.target.value as ScopeSequenceTagType | "",
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select (optional)...</option>
                {SCOPE_SEQUENCE_TAG_OPTIONS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Special Populations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Populations
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Select all that apply
              </p>
              <div className="space-y-2">
                {SpecialPopulations.map((population) => (
                  <label
                    key={population}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={specialPopulations.includes(population)}
                      onChange={() => handleSpecialPopulationToggle(population)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">
                      {population === "ICT" && "ICT (Integrated Co-Teaching)"}
                      {population === "12-1-1" &&
                        "12-1-1 (Smaller class with IEPs)"}
                      {population === "MLL" && "MLL (Multilingual Learners)"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !school || !classSection || !gradeLevel}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner
                      size="sm"
                      className="border-white/30 border-t-white"
                    />
                    Creating...
                  </span>
                ) : (
                  "Create Section Config"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
          <h3 className="font-medium text-gray-700 mb-2">
            About Special Populations
          </h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>ICT:</strong> Co-taught class with students with IEPs
              alongside general education students
            </li>
            <li>
              <strong>12-1-1:</strong> Smaller class (max 12 students) with all
              students having IEPs, served by 1 teacher and 1 paraprofessional
            </li>
            <li>
              <strong>MLL:</strong> Section for students learning English as an
              additional language
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
