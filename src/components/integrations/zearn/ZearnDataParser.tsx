'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Button } from '@/components/core/Button';
import { Textarea } from '@/components/core/fields/Textarea';
import { Select } from '@/components/core/fields/Select';
import { Alert } from '@/components/core/feedback/Alert';
import { Badge } from '@/components/core/feedback/Badge';
import { Table } from '@/components/composed/tables/Table';
import { useZearnBatchData } from './hooks/useZearnBatchData';
import type { StudentRowData } from './hooks/useZearnBatchData';

export default function ZearnDataParser() {
  const {
    selectedDistrict,
    setSelectedDistrict,
    selectedSections,
    handleSectionChange,
    availableSections,
    students,
    isLoadingStudents,
    studentsError,
    isUploading,
    uploadError,
    tableData,
    validEntries,
    handleRawDataChange,
    handleBatchUpload,
    handleClearSections
  } = useZearnBatchData();

  // District options
  const districtOptions = [
    { value: 'D9', label: 'District 9 (D9)' },
    { value: 'D11', label: 'District 11 (D11)' }
  ];

  // Section options based on selected district
  const sectionOptions = availableSections.map(section => ({
    value: section,
    label: section
  }));

  // District selection handler
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value as 'D9' | 'D11' | '');
  };

  // Multi-select handler for sections
  const handleSectionsSelectChange = (value: string | string[]) => {
    const sections = Array.isArray(value) ? value : [value].filter(Boolean);
    handleSectionChange(sections);
  };

  // Table columns definition
  const columns = useMemo(() => [
    {
      id: 'name',
      label: 'Student Name',
      accessor: (row: StudentRowData) => (
        <div>
          <div className="font-medium">{row.student.firstName} {row.student.lastName}</div>
          <div className="text-xs text-gray-500">
            ID: {row.student.studentID} • Section: {row.student.section}
          </div>
        </div>
      ),
      width: '200px'
    },
    {
      id: 'data',
      label: 'Zearn Data',
      accessor: (row: StudentRowData) => (
        <Textarea
          value={row.rawData}
          onChange={(e) => handleRawDataChange(row.student._id, e.target.value)}
          placeholder="Paste Zearn detail data here..."
          className="min-h-20 text-xs"
          rows={4}
        />
      ),
      width: '300px'
    },
    {
      id: 'results',
      label: 'Parsed Results',
      accessor: (row: StudentRowData) => (
        <div className="space-y-1">
          {row.parseError && (
            <Badge intent="danger" className="text-xs">
              Error: {row.parseError}
            </Badge>
          )}
          {row.parsedData && !row.parseError && (
            <div className="space-y-1">
              <Badge intent="success" className="text-xs">
                {row.parsedData.zearnCompletions.length} lessons
              </Badge>
              {row.parsedData.zearnWeeks.length > 0 && (
                <div className="text-xs text-gray-600">
                  {row.parsedData.zearnWeeks[0].zearnMin}
                </div>
              )}
            </div>
          )}
          {!row.rawData && (
            <div className="text-xs text-gray-400">No data</div>
          )}
        </div>
      ),
      width: '200px'
    }
  ], [handleRawDataChange]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Zearn Batch Data Parser</h2>
          <p className="text-sm text-muted-foreground">
            Select a district and sections to load students, then paste Zearn data for batch processing and upload.
          </p>
        </Card.Header>
        
        <Card.Body>
          <div className="space-y-4">
            {/* District and Section Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">District</label>
                <Select
                  options={districtOptions}
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  placeholder="Select a district..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Sections</label>
                <Select
                  options={sectionOptions}
                  value={selectedSections}
                  onChange={handleSectionsSelectChange as (value: string | string[]) => void}
                  placeholder="Select sections..."
                  multiple
                  disabled={!selectedDistrict}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {selectedSections.length > 0 && (
              <div className="flex gap-2">
                <Button
                  onClick={handleBatchUpload}
                  disabled={validEntries === 0 || isUploading}
                >
                  {isUploading ? 'Uploading...' : `Upload ${validEntries} Records`}
                </Button>
                <Button
                  appearance="outline"
                  onClick={handleClearSections}
                  disabled={isUploading}
                >
                  Clear Sections
                </Button>
              </div>
            )}

            {/* Status Messages */}
            {studentsError && (
              <Alert intent="error">
                <Alert.Description>{studentsError}</Alert.Description>
              </Alert>
            )}

            {uploadError && (
              <Alert intent="error">
                <Alert.Description>{uploadError}</Alert.Description>
              </Alert>
            )}

            {selectedSections.length > 0 && students.length > 0 && (
              <div className="flex gap-4 text-sm">
                <span>Total Students: {students.length}</span>
                <span>Sections: {selectedSections.join(', ')}</span>
                <span>With Data: {tableData.filter(row => row.rawData).length}</span>
                <span className="text-green-600">Valid: {validEntries}</span>
                <span className="text-red-600">
                  Errors: {tableData.filter(row => row.parseError).length}
                </span>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Students Table */}
      {selectedSections.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold">
              {isLoadingStudents 
                ? 'Loading Students...' 
                : `Students from ${selectedSections.join(', ')}`
              }
            </h3>
          </Card.Header>
          
          <Card.Body>
            {isLoadingStudents ? (
              <div className="text-center py-8">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found for selected sections
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table
                  data={tableData}
                  columns={columns}
                  textSize="sm"
                  padding="sm"
                  emptyMessage="No students in selected sections"
                />
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold">How to Use</h3>
        </Card.Header>
        <Card.Body className="space-y-4">
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Select a district (D9 or D11) from the dropdown</li>
            <li>Select one or more sections to load students from those sections</li>
            <li>For each student, click on their Zearn detail view and copy the content</li>
            <li>Paste the data into the student&apos;s textarea</li>
            <li>Check the parsed results column for validation</li>
            <li>Once you have valid data for students, click &quot;Upload Records&quot;</li>
            <li>Data is automatically saved locally as you work</li>
          </ol>
          
          <Alert>
            <Alert.Description>
              <strong>Data Persistence:</strong> Your progress is saved locally and will persist 
              when switching between districts/sections or refreshing the page.
            </Alert.Description>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
}
