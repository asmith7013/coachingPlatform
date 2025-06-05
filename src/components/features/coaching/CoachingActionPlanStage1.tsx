import React, { useState, useMemo } from 'react';
import { ActionPlanStage } from './ActionPlanStage';
import { IPGFocusCards } from '@/components/domain/coaching/IPGFocusCards';
import { IPGSubsectionCards } from '@/components/domain/coaching/IPGSubsectionCards';
import { Textarea } from '@/components/core/fields/Textarea';
import { Button } from '@/components/core/Button';
import { Edit2 } from 'lucide-react';
import { useIPGData } from '@/hooks/domain/useIPGData';

export interface CoachingActionPlanStage1Props {
  initialData?: {
    coreAction?: string;
    subsection?: string;
    description?: string;
    rationale?: string;
  };
  onChange: (data: {
    coreAction: string;
    subsection: string;
    description: string;
    rationale: string;
  }) => void;
  planId?: string;
  className?: string;
}

export const CoachingActionPlanStage1: React.FC<CoachingActionPlanStage1Props> = ({
  initialData,
  onChange,
  planId: _planId,
  className
}) => {
  const { coreActions, getSubsectionsForCoreAction, getCoreActionById, getSubsectionById } = useIPGData();
  
  // State management for selection and editing
  const [selectedCoreAction, setSelectedCoreAction] = useState<string | null>(
    initialData?.coreAction || null
  );
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(
    initialData?.subsection || null
  );
  const [rationale, setRationale] = useState<string>(initialData?.rationale || '');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Get subsections for selected core action
  const subsectionOptions = useMemo(() => {
    if (!selectedCoreAction) return [];
    
    const coreActionData = getCoreActionById(selectedCoreAction);
    if (!coreActionData) return [];
    
    const subsections = getSubsectionsForCoreAction(coreActionData.coreActionNumber);
    return subsections.map(sub => ({
      value: sub.value,
      label: sub.section,
      description: sub.description
    }));
  }, [selectedCoreAction, getCoreActionById, getSubsectionsForCoreAction]);

  // Get parent color for subsection cards
  const parentColor = useMemo(() => {
    if (!selectedCoreAction) return 'primary' as const;
    const coreActionData = getCoreActionById(selectedCoreAction);
    return coreActionData?.colorCode || 'primary';
  }, [selectedCoreAction, getCoreActionById]);

  // Selection completeness check
  const isSelectionComplete = Boolean(
    selectedCoreAction && selectedSubsection && rationale.trim()
  );

  // Handle core action selection
  const handleCoreActionSelect = (value: string) => {
    setSelectedCoreAction(value);
    setSelectedSubsection(null); // Reset subsection when core action changes
    
    // Update description based on core action
    const coreActionData = getCoreActionById(value);
    if (coreActionData) {
      setDescription(coreActionData.title);
    }
  };

  // Handle subsection selection
  const handleSubsectionSelect = (value: string) => {
    setSelectedSubsection(value);
  };

  // Handle rationale change
  const handleRationaleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRationale(e.target.value);
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  // Send data to parent when complete
  React.useEffect(() => {
    if (isSelectionComplete && selectedCoreAction && selectedSubsection) {
      onChange({
        coreAction: selectedCoreAction,
        subsection: selectedSubsection,
        description: description.trim(),
        rationale: rationale.trim()
      });
    }
  }, [selectedCoreAction, selectedSubsection, description, rationale, isSelectionComplete, onChange]);

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Format options for IPGFocusCards
  const coreActionOptions = coreActions.map(ca => ({
    value: ca.value,
    label: ca.label,
    colorCode: ca.colorCode
  }));

  return (
    <ActionPlanStage
      number={1}
      title="Identify Needs + Determine Focus"
      className={className}
    >
      <div className="space-y-6">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Area of Focus (IPG Category)
          </label>

          {/* Show selection interface if editing or no complete selection */}
          {(isEditing || !isSelectionComplete) && (
            <div className="space-y-6">
              {/* Core Action Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Select Core Action</h3>
                <IPGFocusCards
                  selectedValue={selectedCoreAction || undefined}
                  onSelect={handleCoreActionSelect}
                  options={coreActionOptions}
                />
              </div>

              {/* Subsection Selection - only show if core action selected */}
              {selectedCoreAction && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Select Subsection</h3>
                  <IPGSubsectionCards
                    selectedValue={selectedSubsection || undefined}
                    onSelect={handleSubsectionSelect}
                    options={subsectionOptions}
                    parentColor={parentColor}
                  />
                </div>
              )}

              {/* Description Field */}
              {selectedCoreAction && selectedSubsection && (
                <div>
                  <Textarea
                    label="Focus Description"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Describe the specific focus area for coaching"
                    rows={3}
                    required
                  />
                </div>
              )}

              {/* Rationale Field - show when subsection is selected */}
              {selectedCoreAction && selectedSubsection && (
                <div>
                  <Textarea
                    label="Rationale"
                    value={rationale}
                    onChange={handleRationaleChange}
                    placeholder="Explain why this focus area was selected based on teacher needs and student data"
                    rows={4}
                    required={Boolean(selectedCoreAction && selectedSubsection)}
                  />
                </div>
              )}

              {/* Done editing button */}
              {isSelectionComplete && isEditing && (
                <div className="flex justify-end">
                  <Button
                    intent="primary"
                    appearance="solid"
                    textSize="sm"
                    padding="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Show focus box when selection is complete and not editing */}
          {isSelectionComplete && !isEditing && (
            <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-4">
              {/* Edit button overlay */}
              <Button
                intent="primary"
                appearance="outline"
                textSize="sm"
                padding="xs"
                icon={<Edit2 size={16} />}
                onClick={handleEditClick}
                className="absolute top-2 right-2"
              >
                Edit
              </Button>

              {/* Focus content */}
              <div className="pr-16"> {/* Add padding to avoid overlap with edit button */}
                <h4 className="font-semibold text-lg mb-2">
                  {getCoreActionById(selectedCoreAction!)?.label}
                </h4>
                <h5 className="font-medium text-base mb-2 text-gray-700">
                  {getSubsectionById(selectedSubsection!)?.section}
                </h5>
                <p className="text-sm text-gray-600 mb-3">
                  {description}
                </p>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Rationale:</p>
                  <p className="text-sm text-gray-600">
                    {rationale}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ActionPlanStage>
  );
}; 