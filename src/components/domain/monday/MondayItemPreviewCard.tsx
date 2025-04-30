'use client';

import { Card } from '@/components/composed/cards/Card';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { Text } from '@/components/core/typography/Text';
import { ImportPreview } from '@/app/actions/integrations/monday';

interface MondayItemPreviewCardProps {
  preview: ImportPreview;
  isSelected: boolean;
  onToggleSelect: (id: string, selected: boolean) => void;
}

export function MondayItemPreviewCard({ 
  preview, 
  isSelected, 
  onToggleSelect 
}: MondayItemPreviewCardProps) {
  const { original, transformed, valid, isDuplicate, missingRequired, errors } = preview;
  
  // Determine card status style
  const getCardStatus = () => {
    if (isDuplicate) return 'border-yellow-300 bg-yellow-50';
    if (!valid) return 'border-red-300 bg-red-50';
    return 'border-green-300 bg-green-50';
  };
  
  return (
    <Card 
      className={`transition-all ${isSelected ? getCardStatus() : 'border-gray-200'}`}
    >
      <div className="flex items-start p-4">
        <Checkbox
          checked={isSelected}
          onChange={(e) => onToggleSelect(original.id as string, e.target.checked)}
          disabled={!valid}
          className="mt-1 mr-4"
        />
        
        <div className="flex-1">
          <div className="flex justify-between">
            <Text className="text-lg font-medium">{original.name as string}</Text>
            <div>
              {isDuplicate && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full mr-2">
                  Already Imported
                </span>
              )}
              {!valid && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  Incomplete Data
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="font-semibold">Date:</span> {transformed.date as string || '(missing)'}
            </div>
            <div>
              <span className="font-semibold">School:</span> {transformed.school as string || '(missing)'}
            </div>
            <div>
              <span className="font-semibold">Coach:</span> {transformed.coach as string || '(missing)'}
            </div>
            <div>
              <span className="font-semibold">Mode:</span> {transformed.modeDone as string || 'Not specified'}
            </div>
          </div>
          
          {missingRequired.length > 0 && (
            <div className="mt-2 text-sm text-red-600">
              <span className="font-semibold">Missing fields:</span> {missingRequired.join(', ')}
            </div>
          )}
          
          {Object.keys(errors).length > 0 && (
            <div className="mt-2 text-sm text-red-600">
              <span className="font-semibold">Validation errors:</span>
              <ul className="list-disc list-inside ml-2">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{field}: {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 