'use client';

import { useState } from 'react';
import { getFeatureFlags, setFeatureFlag } from '@/lib/config/feature-flags';
import { useSchools } from '@/hooks/domain/useSchools';
import { useSchoolsRQ } from '@/hooks/domain/useSchools';
import { Alert } from '@/components/core/feedback/Alert';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Table } from '@/components/composed/tables/Table';

export default function MigrationTestPage() {
  const [flags, setFlags] = useState(getFeatureFlags());
  
  // Test both implementations
  const swrData = useSchools(1, 5);
  const rqData = useSchoolsRQ(1, 5);
  
  const toggleFlag = (flag: keyof typeof flags) => {
    const newValue = !flags[flag];
    setFeatureFlag(flag, newValue);
    setFlags({ ...flags, [flag]: newValue });
  };
  
  const testSchoolData = {
    schoolName: `Test School ${Date.now()}`,
    schoolNumber: `TST${Date.now()}`,
    district: 'Test District',
    gradeLevelsSupported: ['Grade 1', 'Grade 2'],
    staffList: [],
    schedules: [],
    cycles: [],
    owners: [],
  };
  
  return (
    <div className="p-8 space-y-8">
      <div>
        <Heading>React Query Migration Test</Heading>
        <Text color="muted" className="mt-2">
          Compare SWR and React Query implementations side by side
        </Text>
      </div>
      
      {/* Feature Flags */}
      <Card>
        <Card.Header>
          <Heading>Feature Flags</Heading>
        </Card.Header>
        <Card.Body>
          <div className="space-y-3">
            {Object.entries(flags).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleFlag(key as keyof typeof flags)}
                    className="mr-3 h-4 w-4"
                  />
                  <Text>{key}</Text>
                </label>
                <span className={`px-2 py-1 text-xs rounded ${
                  value ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}>
                  {value ? 'ON' : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
      
      {/* Data Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SWR Implementation */}
        <Card>
          <Card.Header>
            <Heading>SWR Implementation</Heading>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div>
                <Text color="muted">Status:</Text>
                {swrData.loading ? (
                  <span className="text-yellow-600">Loading...</span>
                ) : swrData.error ? (
                  <span className="text-red-600">Error: {swrData.error.message}</span>
                ) : (
                  <span className="text-green-600">Success</span>
                )}
              </div>
              
              <div>
                <Text color="muted">Schools Count: {swrData.schools?.length || 0}</Text>
              </div>
              
              <div>
                <Text color="muted">Total: {swrData.total || 0}</Text>
              </div>
              
              {swrData.schools && swrData.schools.length > 0 && (
                <Table
                  data={swrData.schools}
                  columns={[
                    {
                      id: 'schoolName',
                      label: 'School Name',
                      accessor: (row) => row.schoolName
                    },
                    {
                      id: 'district',
                      label: 'District',
                      accessor: (row) => row.district
                    }
                  ]}
                />
              )}
              
              <Button
                onClick={() => swrData.addSchool(testSchoolData)}
                disabled={swrData.loading}
              >
                Test Create (SWR)
              </Button>
            </div>
          </Card.Body>
        </Card>
        
        {/* React Query Implementation */}
        <Card>
          <Card.Header>
            <Heading>React Query Implementation</Heading>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div>
                <Text color="muted">Status:</Text>
                {rqData.loading ? (
                  <span className="text-yellow-600">Loading...</span>
                ) : rqData.error ? (
                  <span className="text-red-600">Error: {rqData.error.message}</span>
                ) : (
                  <span className="text-green-600">Success</span>
                )}
              </div>
              
              <div>
                <Text color="muted">Schools Count: {rqData.schools?.length || 0}</Text>
              </div>
              
              <div>
                <Text color="muted">Total: {rqData.total || 0}</Text>
              </div>
              
              {rqData.schools && rqData.schools.length > 0 && (
                <Table
                  data={rqData.schools}
                  columns={[
                    {
                      id: 'schoolName',
                      label: 'School Name',
                      accessor: (row) => row.schoolName
                    },
                    {
                      id: 'district',
                      label: 'District',
                      accessor: (row) => row.district
                    }
                  ]}
                />
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => rqData.addSchool(testSchoolData)}
                  disabled={rqData.loading}
                >
                  Test Create (RQ)
                </Button>
                <Button
                  onClick={() => rqData.mutate()}
                  intent="secondary"
                  disabled={rqData.loading}
                >
                  Refetch
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
} 