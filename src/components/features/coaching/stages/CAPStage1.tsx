import React, { useState, useMemo } from 'react';
import { ActionPlanStage } from '../ActionPlanStage';
import { IPGFocusCards } from '@components/domain/coaching/IPGFocusCards';
import { IPGSubsectionCards } from '@components/domain/coaching/IPGSubsectionCards';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { useFieldRenderer } from '@ui/forms/hooks/useFieldRenderer';
import { Button } from '@components/core/Button';
import { Edit2 } from 'lucide-react';
import { useIPGData } from '@components/features/coaching/hooks/useIPGData';
import { NeedsAndFocusFieldConfig, getIPGSubCategoryOptions } from '@forms/fieldConfig/coaching/coaching-action-plan-config';
import type { NeedsAndFocus } from '@zod-schema/core/cap';
import type { Field } from '@ui-types/form';
import { useForm } from '@tanstack/react-form';
import { NeedsAndFocusZodSchema } from '@zod-schema/core/cap';

export interface CoachingActionPlanStage1Props {
  data: NeedsAndFocus;
  onChange: (updates: Partial<NeedsAndFocus>) => void;
  className?: string;
}

export const CoachingActionPlanStage1: React.FC<CoachingActionPlanStage1Props> = ({
  data,
  onChange,
  className
}) => {
  const { coreActions, getCoreActionById } = useIPGData();
  const { renderField } = useFieldRenderer<NeedsAndFocus>();
  
  // State management for UI interactions
  const [isEditing, setIsEditing] = useState<boolean>(!data.ipgCoreAction);

  // Create form instance for details form
  const detailsForm = useForm({
    defaultValues: data,
    validators: {
      onChange: NeedsAndFocusZodSchema,
    },
    onSubmit: async ({ value }) => {
      onChange(value);
      setIsEditing(false);
    },
  });

  // Get subsections for selected core action
  const subsectionOptions = useMemo(() => {
    if (!data.ipgCoreAction) return [];
    return getIPGSubCategoryOptions(data.ipgCoreAction);
  }, [data.ipgCoreAction]);

  // Get parent color for subsection cards
  const parentColor = useMemo(() => {
    if (!data.ipgCoreAction) return 'primary' as const;
    const coreActionData = getCoreActionById(data.ipgCoreAction);
    return coreActionData?.colorCode || 'primary';
  }, [data.ipgCoreAction, getCoreActionById]);

  // Selection completeness check
  const isSelectionComplete = Boolean(
    data.ipgCoreAction && data.ipgSubCategory && data.rationale?.trim()
  );

  // Handle core action selection
  const handleCoreActionSelect = (value: string) => {
    onChange({
      ipgCoreAction: value as 'CA1' | 'CA2' | 'CA3',
      ipgSubCategory: undefined // Reset subsection when core action changes
    });
  };

  // Handle subsection selection
  const handleSubsectionSelect = (value: string) => {
    onChange({
      ipgSubCategory: value as 'CA1A' | 'CA1B' | 'CA1C' | 'CA2A' | 'CA2B' | 'CA3A' | 'CA3B' | 'CA3C' | 'CA3D' | 'CA3E'
    });
  };

  // Format options for IPGFocusCards
  const coreActionOptions = coreActions.map(ca => ({
    value: ca.value,
    label: ca.label,
    colorCode: ca.colorCode
  }));

  // Create field config with dynamic subsection options
  const dynamicFieldConfig = useMemo(() => {
    return NeedsAndFocusFieldConfig.map((field) => {
      if (field.name === 'ipgSubCategory') {
        return {
          ...field,
          options: subsectionOptions
        };
      }
      return field;
    }) as Field<NeedsAndFocus>[];
  }, [subsectionOptions]);

  return (
    <ActionPlanStage
      number={1}
      title="Identify Needs + Determine Focus"
      className={className}
    >
      <div className="space-y-6">
        {/* Show compact view when complete and not editing */}
        {isSelectionComplete && !isEditing && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900">Selected Focus</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {data.ipgCoreAction} → {data.ipgSubCategory}
                </p>
              </div>
              <Button
                intent="secondary"
                appearance="outline"
                textSize="sm"
                padding="sm"
                onClick={() => setIsEditing(true)}
                icon={<Edit2 size={14} />}
              >
                Edit
              </Button>
            </div>
            
            {data.rationale && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Rationale</h4>
                <p className="text-sm text-gray-600">{data.rationale}</p>
              </div>
            )}
          </div>
        )}

        {/* Show selection interface if editing or no complete selection */}
        {(isEditing || !isSelectionComplete) && (
          <div className="space-y-6">
            {/* Core Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select IPG Core Action
              </label>
              <IPGFocusCards
                selectedValue={data.ipgCoreAction || undefined}
                onSelect={handleCoreActionSelect}
                options={coreActionOptions}
              />
            </div>

            {/* Subsection Selection - only show if core action selected */}
            {data.ipgCoreAction && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select IPG Sub-Category
                </label>
                <IPGSubsectionCards
                  selectedValue={data.ipgSubCategory || undefined}
                  onSelect={handleSubsectionSelect}
                  options={subsectionOptions}
                  parentColor={parentColor}
                />
              </div>
            )}

            {/* Form for remaining fields */}
            {data.ipgCoreAction && data.ipgSubCategory && (
              <FormLayout
                title="Complete Focus Details"
                description="Provide rationale and any supporting documentation"
                isSubmitting={detailsForm.state.isSubmitting}
                canSubmit={detailsForm.state.canSubmit}
                onCancel={() => setIsEditing(false)}
                submitLabel={isEditing ? "Save Changes" : "Complete Stage"}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    detailsForm.handleSubmit();
                  }}
                  className="space-y-4"
                >
                  {(dynamicFieldConfig as Field<NeedsAndFocus>[])
                    .filter((field) => 
                      field.name === 'rationale' || field.name === 'pdfAttachment'
                    )
                    .map((fieldConfig) => (
                      <div key={String(fieldConfig.name)} className="space-y-2">
                        <label
                          htmlFor={String(fieldConfig.name)}
                          className="text-sm font-medium leading-none"
                        >
                          {fieldConfig.label}
                        </label>
                        
                        <detailsForm.Field name={String(fieldConfig.name) as keyof NeedsAndFocus}>
                          {(field) => renderField(fieldConfig, field)}
                        </detailsForm.Field>
                      </div>
                    ))}
                </form>
              </FormLayout>
            )}
          </div>
        )}
      </div>
    </ActionPlanStage>
  );
}; 