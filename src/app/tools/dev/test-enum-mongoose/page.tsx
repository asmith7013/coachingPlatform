'use client';

import { useState } from 'react';
import { 
  Duration, 
  DurationValues,
  DurationTypesEnum,
  DurationConverter
} from '@enums';
import { Button } from '@/components/core/Button';

interface TestResult {
  testCase: string;
  input: string | number;
  outputType: string;
  output: string | number;
  isValid: boolean;
}

// Helper type to get keys of Duration enum
type DurationKey = keyof typeof Duration;

export default function TestEnumMongoosePage() {
  const [results, setResults] = useState<TestResult[]>([]);
  
  const runTests = () => {
    const tests: TestResult[] = [];
    
    // Test 1: String to Number conversion (Zod → Mongoose)
    Object.values(Duration).forEach(durationStr => {
      // Find the key for this enum value
      const key = Object.keys(Duration).find(
        k => Duration[k as DurationKey] === durationStr
      ) as DurationKey | undefined;
      
      if (key) {
        const numValue = DurationConverter.toMongoose(key);
        tests.push({
          testCase: 'String → Number (Zod → Mongoose)',
          input: durationStr,
          outputType: typeof numValue,
          output: numValue,
          isValid: Object.values(DurationTypesEnum).includes(numValue),
        });
      }
    });
    
    // Test 2: Number to String conversion (Mongoose → Zod)
    Object.values(DurationTypesEnum).forEach(numValue => {
      try {
        // Only test numeric values, skip string enum names
        if (typeof numValue === 'number') {
          try {
            const stringValue = String(numValue);
          tests.push({
            testCase: 'Number → String (Mongoose → Zod)',
            input: numValue,
            outputType: typeof stringValue,
            output: stringValue,
            isValid: DurationValues.includes(stringValue as Duration),
          });
          } catch (error) {
            tests.push({
              testCase: 'Number → String (Mongoose → Zod)',
              input: numValue,
              outputType: 'error',
              output: error instanceof Error ? error.message : String(error),
              isValid: false,
            });
          }
        }
      } catch (error) {
        tests.push({
          testCase: 'Number → String (Mongoose → Zod)',
          input: numValue,
          outputType: 'error',
          output: error instanceof Error ? error.message : String(error),
          isValid: false,
        });
      }
    });
    
    setResults(tests);
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Enum Mongoose Integration Test</h1>
      
      <div className="mb-6">
        <Button onClick={runTests}>Run Conversion Tests</Button>
      </div>
      
      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Enum Values:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-medium mb-1">String Values (Zod):</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[150px]">
                {JSON.stringify(DurationValues, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-1">Number Values (Mongoose):</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[150px]">
                {JSON.stringify(
                  Object.entries(DurationTypesEnum)
                    .filter(([key]) => isNaN(Number(key)))
                    .map(([key, value]) => ({ key, value })),
                  null, 
                  2
                )}
              </pre>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mt-6 mb-2">Test Results:</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 shadow-sm ${
                  result.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <h3 className="font-medium text-lg mb-2">{result.testCase}</h3>
                <ul className="space-y-1 text-sm">
                  <li><span className="font-medium">Input:</span> {String(result.input)} (type: {typeof result.input})</li>
                  <li><span className="font-medium">Output:</span> {String(result.output)} (type: {result.outputType})</li>
                  <li><span className="font-medium">Valid:</span> {result.isValid ? '✅' : '❌'}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 