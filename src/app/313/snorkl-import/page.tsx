'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/core/Button';
import { Textarea } from '@/components/core/fields/Textarea';
import { Heading, Text } from '@/components/core/typography';
import { Card } from '@/components/composed/cards/Card';
import { Table } from '@/components/composed/tables/Table';
import { StudentRow } from './types';
import { parseJsonData, combineStudentDataWithFuzzyMatch } from './utils/parser';
import { createTableColumns } from './utils/table-config';
import { fetchStudents } from '@/app/actions/313/students';
import { Student } from '@/lib/schema/zod-schema/313/student';
import { handleClientError } from '@/lib/error/handlers/client';

export default function SnorklImportPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [processedData, setProcessedData] = useState<Array<{
    id: string;
    title: string;
    grades: StudentRow[];
  }>>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Student fetching state (following zearn pattern)
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string>('');

  // Load all students on component mount
  useEffect(() => {
    const loadStudents = async () => {
      setIsLoadingStudents(true);
      setStudentsError('');
      
      try {
        const result = await fetchStudents({ 
          limit: 1000,
          page: 1,
          sortBy: 'firstName',
          sortOrder: 'asc',
          filters: {}
        });
        
        if (result.success && result.items) {
          const sortedStudents = result.items.sort((a, b) => {
            const fullNameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const fullNameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            return fullNameA.localeCompare(fullNameB);
          });
          setStudents(sortedStudents);
        } else {
          setStudentsError('Failed to load students');
        }
      } catch (error) {
        const errorMsg = 'Error loading students';
        setStudentsError(errorMsg);
        handleClientError(error, 'fetchStudents');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, []);

  const handleParse = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = parseJsonData(jsonInput);
      
      // Process data with fuzzy matching for display
      const dataWithMatching = data.map(assessment => ({
        id: assessment.id,
        title: assessment.title,
        grades: combineStudentDataWithFuzzyMatch(assessment.grades, students)
      }));
      
      setProcessedData(dataWithMatching);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setProcessedData([]);
    setError('');
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div>
        <Heading level="h1">Mastery Platform Parser</Heading>
        <Text color="muted">
          Paste your JSON data below and click &quot;Parse&quot; to display student results with fuzzy name matching.
        </Text>
        {/* Show student loading status */}
        {isLoadingStudents && (
          <Text color="muted" textSize="sm">Loading student database for name matching...</Text>
        )}
        {studentsError && (
          <Text color="danger" textSize="sm">Student loading error: {studentsError}</Text>
        )}
        {students.length > 0 && (
          <Text color="muted" textSize="sm">{students.length} students loaded for matching</Text>
        )}
      </div>

      <Card>
        <Card.Header>
          <Heading level="h3">JSON Input</Heading>
        </Card.Header>
        <Card.Body className="space-y-4">
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`Paste your mastery platform JSON data here...

Example format:
[
  {
    "id": "assessment1",
    "title": "Sample Assessment",
    "grades": [
      {
        "First Name": "John",
        "Last Name": "Doe",
        "Best Response Correct - Yes or No": "Yes",
        "Best Response Explanation Score (0-4)": 4,
        "Best Response Date": "2024-01-15T10:30:00Z",
        "1st Response Correct - Yes or No": "No",
        "1st Response Explanation Score (0-4)": 2,
        "1st Response Date": "2024-01-14T09:00:00Z"
      }
    ]
  }
]`}
            rows={12}
          />
          
          {error && (
            <Text color="danger" textSize="sm">
              {error}
            </Text>
          )}
          
          <div className="flex gap-3">
            <Button 
              intent="primary" 
              onClick={handleParse}
              disabled={!jsonInput.trim() || isLoading || isLoadingStudents}
              loading={isLoading}
            >
              Parse Data
            </Button>
            <Button 
              intent="secondary" 
              appearance="outline"
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>
        </Card.Body>
      </Card>

      {processedData.length > 0 && (
        <div className="space-y-8">
          {processedData.map((assessment) => {
            const columns = createTableColumns();
            
            return (
              <Card key={assessment.id}>
                <Card.Header>
                  <Heading level="h3">{assessment.title}</Heading>
                  <Text color="muted" textSize="sm">
                    {assessment.grades.length} student{assessment.grades.length !== 1 ? 's' : ''}
                    {/* Show match statistics */}
                    {assessment.grades.length > 0 && (
                      <span className="ml-2">
                        • {assessment.grades.filter(s => s.matchedStudent).length} matched
                      </span>
                    )}
                  </Text>
                </Card.Header>
                <Card.Body>
                  <Table<StudentRow>
                    data={assessment.grades}
                    columns={columns}
                    emptyMessage="No student data available"
                    textSize="sm"
                  />
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 