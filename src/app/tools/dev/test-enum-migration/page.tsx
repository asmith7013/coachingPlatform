'use client';

import { useState } from 'react';
import { EventItemZodSchema } from '@/lib/data-schema/zod-schema/visits/visit';
import { 
  EventTypes, 
  DurationValues,
} from '@data-schema/enum';
import { Button } from '@/components/core/Button';

// Type for the validation result
type EventItemResult = {
  eventType: string;
  staff: string[];
  duration: number;
};

// Simple test component to verify enum migration
export default function TestEnumMigrationPage() {
  const [validationResult, setValidationResult] = useState<EventItemResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const testEventItemValidation = () => {
    try {
      // Test with a string duration (should be transformed to number)
      const testData = {
        eventType: Object.values(EventTypes)[0],
        staff: ["staffId1", "staffId2"],
        duration: DurationValues[0] // String duration ("15")
      };
      
      // The Zod schema will transform the string duration to a number
      const result = EventItemZodSchema.parse(testData);
      setValidationResult(result as unknown as EventItemResult);
      setValidationError(null);
      
      // Verify duration was transformed to number
      console.log('Original duration (string):', testData.duration);
      console.log('Transformed duration (number):', result.duration);
      console.log('Type of duration after validation:', typeof result.duration);
      
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError(JSON.stringify(error, null, 2));
      setValidationResult(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Enum Migration Test</h1>
      
      <div className="mb-6">
        <Button onClick={testEventItemValidation}>
          Test EventItem Validation
        </Button>
      </div>
      
      {validationResult && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Validation Result:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(validationResult, null, 2)}
          </pre>
        </div>
      )}
      
      {validationError && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Validation Error:</h2>
          <pre className="bg-red-50 p-4 rounded text-red-600">
            {validationError}
          </pre>
        </div>
      )}
    </div>
  );
} 