"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { SimpleCard } from '@/components/core/cards/SimpleCard';
import { UnitScrapingResponse, UnitData } from '../lib/types';
import { ChevronDownIcon, ChevronUpIcon, DocumentArrowDownIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import { bulkCreateRoadmapUnits } from '@/app/actions/scm/roadmaps/roadmaps-units';

interface BatchUnitResultDisplayProps {
  response: UnitScrapingResponse | null;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
}

export function BatchUnitResultDisplay({
  response,
  isLoading,
  error,
  onClear
}: BatchUnitResultDisplayProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  const toggleUnitExpansion = (unitTitle: string) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitTitle)) {
        newSet.delete(unitTitle);
      } else {
        newSet.add(unitTitle);
      }
      return newSet;
    });
  };

  const toggleSkillExpansion = (skillKey: string) => {
    setExpandedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillKey)) {
        newSet.delete(skillKey);
      } else {
        newSet.add(skillKey);
      }
      return newSet;
    });
  };

  const exportResults = () => {
    if (!response) return;

    const dataStr = JSON.stringify(response, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    const roadmapSlug = response.roadmap.replace(/\s+/g, '-').toLowerCase();
    link.download = `roadmaps-${roadmapSlug}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const saveToDatabase = async () => {
    if (!response || !response.units) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Prepare data in new format: { grade, units }
      const dataToSave = {
        grade: response.roadmap,
        units: response.units
      };

      const result = await bulkCreateRoadmapUnits(dataToSave);

      if (result.success) {
        setSaveStatus({
          success: true,
          message: result.message || 'Units saved successfully to database'
        });
      } else {
        setSaveStatus({
          success: false,
          message: result.error || 'Failed to save units to database'
        });
      }
    } catch (err) {
      setSaveStatus({
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center text-white font-medium text-sm">
            ⏳
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Batch Scraping in Progress</h3>
            <p className="text-sm text-gray-500">Scraping all units in the selected roadmap. This may take several minutes...</p>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert intent="error">
        <Alert.Title>Scraping Error</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert>
    );
  }

  if (!response || !response.units) {
    return null;
  }

  const successfulUnits = response.units.filter(u => u.success);
  const failedUnits = response.units.filter(u => !u.success);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className={`flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center text-white font-medium text-sm ${
            failedUnits.length === 0 ? 'bg-green-500' : 'bg-yellow-500'
          }`}>
            {failedUnits.length === 0 ? '✓' : '⚠'}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{response.roadmap}</h3>
            <p className="text-sm text-gray-500">
              Batch scraping completed in {response.duration}
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{response.totalUnits}</div>
              <div className="text-sm text-gray-500">Total Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{response.successfulUnits}</div>
              <div className="text-sm text-gray-500">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{response.failedUnits}</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {successfulUnits.reduce((total, unit) => total + unit.targetSkills.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Target Skills</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
            <Button
              onClick={saveToDatabase}
              intent="primary"
              appearance="solid"
              padding="sm"
              icon={<CircleStackIcon className="w-4 h-4" />}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save to Database'}
            </Button>

            <Button
              onClick={exportResults}
              intent="secondary"
              appearance="outline"
              padding="sm"
              icon={<DocumentArrowDownIcon className="w-4 h-4" />}
            >
              Export JSON
            </Button>

            <Button
              onClick={onClear}
              intent="danger"
              appearance="outline"
              padding="sm"
            >
              Clear Results
            </Button>
          </div>
        </div>
      </div>

      {/* Save Status Alert */}
      {saveStatus && (
        <Alert intent={saveStatus.success ? "success" : "error"}>
          <Alert.Title>{saveStatus.success ? 'Success' : 'Error'}</Alert.Title>
          <Alert.Description>{saveStatus.message}</Alert.Description>
        </Alert>
      )}

      {/* Errors List */}
      {response.errors.length > 0 && (
        <Alert intent="warning">
          <Alert.Title>Errors Encountered ({response.errors.length})</Alert.Title>
          <Alert.Description>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {response.errors.map((err, idx) => (
                <li key={idx} className="text-sm">{err}</li>
              ))}
            </ul>
          </Alert.Description>
        </Alert>
      )}

      {/* Units List */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-800">
          Units ({response.units.length})
        </h3>
        {response.units.map((unit, unitIdx) => (
          <UnitCard
            key={`${unit.unitTitle}-${unitIdx}`}
            unit={unit}
            unitIdx={unitIdx}
            isExpanded={expandedUnits.has(unit.unitTitle)}
            onToggleExpansion={() => toggleUnitExpansion(unit.unitTitle)}
            expandedSkills={expandedSkills}
            onToggleSkill={toggleSkillExpansion}
          />
        ))}
      </div>
    </div>
  );
}

interface UnitCardProps {
  unit: UnitData;
  unitIdx: number;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  expandedSkills: Set<string>;
  onToggleSkill: (skillKey: string) => void;
}

function UnitCard({ unit, unitIdx, isExpanded, onToggleExpansion, expandedSkills, onToggleSkill }: UnitCardProps) {
  const colorVariant = unit.success ? "success" : "danger";

  return (
    <div>
      <SimpleCard
        initials={`${unitIdx + 1}`}
        title={unit.unitTitle}
        subtitle={unit.success
          ? `Target: ${unit.targetCount} | Support: ${unit.supportCount} | Extension: ${unit.extensionCount}`
          : `Error: ${unit.error}`}
        colorVariant={colorVariant}
        size="md"
        className="cursor-pointer"
        onClick={onToggleExpansion}
        showAction
        actionIcon={isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
        onActionClick={(e) => {
          e.stopPropagation();
          onToggleExpansion();
        }}
      />
      {isExpanded && unit.success && (
        <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm -mt-1 px-6 pb-6 space-y-4">
          {/* Target Skills */}
          {unit.targetSkills.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Target Skills ({unit.targetSkills.length})</h4>
              <div className="space-y-2">
                {unit.targetSkills.map((skill, idx) => {
                  const skillKey = `${unit.unitTitle}-${skill.skillNumber}`;
                  const isSkillExpanded = expandedSkills.has(skillKey);
                  return (
                    <div key={skill.skillNumber} className="border border-blue-200 rounded-lg">
                      <div
                        onClick={() => onToggleSkill(skillKey)}
                        className="bg-blue-50 p-3 cursor-pointer hover:bg-blue-100 transition-colors flex justify-between items-center"
                      >
                        <span className="text-sm font-medium text-blue-900">
                          {idx + 1}. {skill.title} ({skill.skillNumber})
                        </span>
                        {isSkillExpanded ? (
                          <ChevronUpIcon className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      {isSkillExpanded && (
                        <div className="p-3 space-y-2 bg-white">
                          <div>
                            <p className="text-xs font-medium text-green-700 mb-1">Essential Skills ({skill.essentialSkills.length})</p>
                            {skill.essentialSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {skill.essentialSkills.map((s) => (
                                  <span key={s.skillNumber} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    {s.title} ({s.skillNumber})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">None</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-700 mb-1">Helpful Skills ({skill.helpfulSkills.length})</p>
                            {skill.helpfulSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {skill.helpfulSkills.map((s) => (
                                  <span key={s.skillNumber} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {s.title} ({s.skillNumber})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">None</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Support Skills */}
          {unit.additionalSupportSkills.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-green-900 mb-2">
                Additional Support Skills ({unit.additionalSupportSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {unit.additionalSupportSkills.map((skill) => (
                  <span key={skill.skillNumber} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {skill.title} ({skill.skillNumber})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extension Skills */}
          {unit.extensionSkills.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-purple-900 mb-2">
                Extension Skills ({unit.extensionSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {unit.extensionSkills.map((skill) => (
                  <span key={skill.skillNumber} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    {skill.title} ({skill.skillNumber})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
