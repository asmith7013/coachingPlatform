"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { SimpleCard } from '@/components/core/cards/SimpleCard';
import { UnitData } from '../lib/types';
import { ChevronDownIcon, ChevronUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface UnitResultDisplayProps {
  unitData: UnitData | null;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
}

export function UnitResultDisplay({
  unitData,
  isLoading,
  error,
  onClear
}: UnitResultDisplayProps) {
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  const toggleSkillExpansion = (skillId: string) => {
    setExpandedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  const exportResults = () => {
    if (!unitData) return;

    const dataStr = JSON.stringify(unitData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `roadmaps-unit-${unitData.unitTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center text-white font-medium text-sm">
            ⏳
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Scraping in Progress</h3>
            <p className="text-sm text-gray-500">Please wait while we extract unit content from Roadmaps...</p>
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

  if (!unitData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-md flex items-center justify-center text-white font-medium text-sm">
            ✓
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{unitData.unitTitle}</h3>
            <p className="text-sm text-gray-500">
              Unit successfully scraped at {new Date(unitData.scrapedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{unitData.targetCount}</div>
              <div className="text-sm text-gray-500">Target Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{unitData.supportCount}</div>
              <div className="text-sm text-gray-500">Support Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{unitData.extensionCount}</div>
              <div className="text-sm text-gray-500">Extension Skills</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
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

      {/* Target Skills List */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-800">Target Skills ({unitData.targetSkills.length})</h3>
        {unitData.targetSkills.map((skill) => (
          <div key={skill.skillNumber}>
            <SimpleCard
              initials={skill.skillNumber}
              title={skill.title}
              subtitle={`Essential: ${skill.essentialSkills.length} | Helpful: ${skill.helpfulSkills.length}`}
              colorVariant="info"
              size="md"
              className="cursor-pointer"
              onClick={() => toggleSkillExpansion(skill.skillNumber)}
              showAction
              actionIcon={expandedSkills.has(skill.skillNumber) ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
              onActionClick={(e) => {
                e.stopPropagation();
                toggleSkillExpansion(skill.skillNumber);
              }}
            />
            {expandedSkills.has(skill.skillNumber) && (
              <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm -mt-1 px-6 pb-6 space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Essential Skills ({skill.essentialSkills.length})</h4>
                  {skill.essentialSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skill.essentialSkills.map((s) => (
                        <span key={s.skillNumber} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {s.title} ({s.skillNumber})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No essential skills</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Helpful Skills ({skill.helpfulSkills.length})</h4>
                  {skill.helpfulSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skill.helpfulSkills.map((s) => (
                        <span key={s.skillNumber} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {s.title} ({s.skillNumber})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No helpful skills</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Support Skills */}
      {unitData.additionalSupportSkills.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            Additional Support Skills ({unitData.additionalSupportSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {unitData.additionalSupportSkills.map((skill) => (
              <span key={skill.skillNumber} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {skill.title} ({skill.skillNumber})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Extension Skills */}
      {unitData.extensionSkills.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">
            Extension Skills ({unitData.extensionSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {unitData.extensionSkills.map((skill) => (
              <span key={skill.skillNumber} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {skill.title} ({skill.skillNumber})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
