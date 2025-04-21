'use client';

import { useState } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Button } from '@/components/core/Button';
import {
  mockSchools,
  mockNYCPSStaff,
  mockTLStaff,
  mockCycles,
  mockCoachingLogs,
} from '@/lib/dev-utils/mockData';
import { createSchool } from '@/app/actions/schools/schools';
import { createNYCPSStaff } from '@/app/actions/staff/nycps';
import { createTeachingLabStaff } from '@/app/actions/staff/tl';
import { createCycle } from '@/app/actions/visits/cycles';
import { createCoachingLog } from '@/app/actions/visits/coachingLogs';
import { SchoolInputZodSchema } from '@/lib/zod-schema/core/school';
import { NYCPSStaffInputZodSchema, TeachingLabStaffInputZodSchema } from '@/lib/zod-schema/core/staff';
import { CycleInputZodSchema } from '@/lib/zod-schema/core/cycle';
import { CoachingLogZodSchema } from '@/lib/zod-schema/visits/coaching-log';
import type { SchoolInput } from '@/lib/zod-schema/core/school';
import type { NYCPSStaffInput, TeachingLabStaffInput } from '@/lib/zod-schema/core/staff';
import type { CycleInput } from '@/lib/zod-schema/core/cycle';

// Component to show expandable JSON data
function JsonPreview<T extends Record<string, unknown>>({
  data,
  title,
}: {
  data: T | T[];
  title: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-4">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-600 underline flex items-center"
      >
        {expanded ? '▼ Hide' : '▶ Show'} {title}
      </button>
      
      {expanded && (
        <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

// Section component that handles the seeding logic
function SeedSection<T extends Record<string, unknown>>({
  title,
  data,
  schema,
  createFn,
}: {
  title: string;
  data: T[];
  schema: { safeParse: (d: unknown) => { success: boolean; data?: T; error?: { message: string; issues?: { message: string }[] } } };
  createFn: (d: T) => Promise<unknown>;
}) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<{success: number; failed: number}>({ success: 0, failed: 0 });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSeed = async () => {
    if (isSeeding) return;
    
    setIsSeeding(true);
    setResults({ success: 0, failed: 0 });
    setErrors([]);
    
    let successCount = 0;
    let failedCount = 0;
    const newErrors: string[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      // Validate with Zod before submission
      const validationResult = schema.safeParse(item);
      
      if (!validationResult.success) {
        failedCount++;
        newErrors.push(`Item ${i + 1}: ${validationResult.error?.message ?? 'Unknown validation error'}`);
        continue;
      }
      
      try {
        // Call the create function with non-null assertion since we checked success above
        await createFn(validationResult.data!);
        successCount++;
      } catch (error) {
        failedCount++;
        newErrors.push(`Item ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    setResults({ success: successCount, failed: failedCount });
    setErrors(newErrors);
    setIsSeeding(false);
  };

  return (
    <Card className="mb-8">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center space-x-2">
          {results.success > 0 && (
            <span className="text-green-600 text-sm">
              ✓ {results.success} seeded
            </span>
          )}
          {results.failed > 0 && (
            <span className="text-red-600 text-sm">
              ✗ {results.failed} failed
            </span>
          )}
          <Button
            onClick={handleSeed}
            disabled={isSeeding}
            appearance="solid"
          >
            Seed {data.length} {title}
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <JsonPreview data={data} title={`Preview ${title} JSON`} />
        
        {errors.length > 0 && (
          <div className="mt-4">
            <h3 className="text-red-600 font-semibold">Errors:</h3>
            <ul className="text-sm mt-2 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-red-600">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function SeedDataPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
        <h1 className="text-2xl font-bold mb-2">🚧 Internal Dev Page: Seed Mock Data</h1>
        <p className="text-gray-700">
          This page allows developers to seed mock data into the database for testing and development purposes.
          Each section lets you preview the mock data and seed it with a single click.
        </p>
      </div>
      
      <SeedSection<SchoolInput>
        title="Schools"
        data={mockSchools as SchoolInput[]}
        schema={SchoolInputZodSchema}
        createFn={createSchool}
      />
      
      <SeedSection<NYCPSStaffInput>
        title="NYCPS Staff"
        data={mockNYCPSStaff as NYCPSStaffInput[]}
        schema={NYCPSStaffInputZodSchema}
        createFn={createNYCPSStaff}
      />
      
      <SeedSection<TeachingLabStaffInput>
        title="Teaching Lab Staff"
        data={mockTLStaff as TeachingLabStaffInput[]}
        schema={TeachingLabStaffInputZodSchema}
        createFn={createTeachingLabStaff}
      />
      
      <SeedSection<CycleInput>
        title="Cycles"
        data={mockCycles as CycleInput[]}
        schema={CycleInputZodSchema}
        createFn={createCycle}
      />
      
      <SeedSection<Record<string, unknown>>
        title="Coaching Logs"
        data={mockCoachingLogs as Record<string, unknown>[]}
        schema={CoachingLogZodSchema}
        createFn={createCoachingLog as (d: Record<string, unknown>) => Promise<unknown>}
      />
    </div>
  );
} 