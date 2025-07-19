import { useState, useCallback, useMemo, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { fetchStudentsBySection } from '@/app/actions/313/students';
import { importZearnData } from '@/app/actions/313/zearn-import';
import { handleClientError } from '@/lib/error/handlers/client';
import { useLocalStorage } from '@/hooks/ui';
import { createZearnImportRecordDefaults, type ZearnImportRecordInput } from '@zod-schema/313/zearn-import';
import { Student } from '@/lib/schema/zod-schema/313/student';
import { parseZearnData, type ParsedStudentData } from '../utils/parseZearnData';

interface LocalStorageData {
  [section: string]: {
    [studentId: string]: {
      rawData: string;
      parsedData: ParsedStudentData | null;
      parseError: string | null;
    };
  };
}

export interface StudentRowData {
  student: Student;
  rawData: string;
  parsedData: ParsedStudentData | null;
  parseError: string | null;
}

const STORAGE_KEY = 'zearn-batch-data';

// District options with predefined spreadsheet IDs
const DISTRICT_OPTIONS = {
  'D9': {
    spreadsheetId: '12nRSGcLlo6SMEyYUWPjfMAcEd-ZDdil-zw44tGjpN7E',
    sections: ['SR1', 'SR2', 'SR3']
  },
  'D11': {
    spreadsheetId: '1c1B3l_e0z10Z8dnM0VngJ8oEaoxwsq0vMBrkC72P95g',
    sections: ['SRF', 'SR6', 'SR7', 'SR8']
  }
} as const;

type District = keyof typeof DISTRICT_OPTIONS;

export function useZearnBatchData() {
  const { user } = useUser();
  const [selectedDistrict, setSelectedDistrict] = useState<District | ''>('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [storageData, setStorageData] = useLocalStorage<LocalStorageData>(STORAGE_KEY, {});

  // Get available sections based on selected district
  const availableSections = useMemo(() => {
    if (!selectedDistrict) return [];
    return DISTRICT_OPTIONS[selectedDistrict].sections;
  }, [selectedDistrict]);

  // Reset sections when district changes
  useEffect(() => {
    setSelectedSections([]);
  }, [selectedDistrict]);

  // Load students when sections change
  useEffect(() => {
    if (selectedSections.length === 0) {
      setStudents([]);
      return;
    }

    const loadStudents = async () => {
      setIsLoadingStudents(true);
      setStudentsError('');
      
      try {
        // Fetch students for all selected sections
        const allStudents: Student[] = [];
        
        for (const section of selectedSections) {
          const result = await fetchStudentsBySection(section);
          
          if (result.success && result.items) {
            allStudents.push(...result.items);
          } else {
            console.warn(`Failed to load students for section ${section}:`, result.error);
          }
        }
        
        if (allStudents.length > 0) {
          // Sort by section first, then by firstName alphabetically
          const sortedStudents = allStudents.sort((a, b) => {
            const sectionCompare = a.section.localeCompare(b.section);
            if (sectionCompare !== 0) return sectionCompare;
            return a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase());
          });
          setStudents(sortedStudents);
        } else {
          setStudentsError('No students found for selected sections');
          handleClientError(new Error('No students found for selected sections'), 'fetchStudentsBySection');
        }
      } catch (error) {
        const errorMsg = 'Error loading students';
        setStudentsError(errorMsg);
        handleClientError(error, 'fetchStudentsBySection');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, [selectedSections]);

  // Handle section selection changes
  const handleSectionChange = useCallback((sections: string[]) => {
    setSelectedSections(sections);
  }, []);

  // Handle textarea change for individual student
  const handleRawDataChange = useCallback((studentId: string, rawData: string) => {
    // Find the student's section for storage key
    const student = students.find(s => s._id === studentId);
    const studentSection = student?.section || selectedSections[0] || '';
    
    setStorageData(prev => {
      const sectionData = prev[studentSection] || {};
      
      let parsedData: ParsedStudentData | null = null;
      let parseError: string | null = null;
      
      if (rawData.trim()) {
        try {
          parsedData = parseZearnData(rawData);
          
          if (!parsedData.studentName) {
            throw new Error('Could not extract student name from data');
          }
          if (parsedData.zearnCompletions.length === 0) {
            throw new Error('No lesson completions found');
          }
        } catch (error) {
          parseError = error instanceof Error ? error.message : 'Parse error';
          parsedData = null;
        }
      }
      
      return {
        ...prev,
        [studentSection]: {
          ...sectionData,
          [studentId]: {
            rawData,
            parsedData,
            parseError
          }
        }
      };
    });
  }, [students, selectedSections, setStorageData]);

  // Create table data
  const tableData: StudentRowData[] = useMemo(() => {
    return students.map(student => {
      const sectionData = storageData[student.section] || {};
      const studentData = sectionData[student._id] || {
        rawData: '',
        parsedData: null,
        parseError: null
      };
      
      return {
        student,
        rawData: studentData.rawData,
        parsedData: studentData.parsedData,
        parseError: studentData.parseError
      };
    });
  }, [students, storageData]);

  // Count valid entries
  const validEntries = useMemo(() => {
    return tableData.filter(row => row.parsedData && !row.parseError).length;
  }, [tableData]);

  // Handle batch upload
  const handleBatchUpload = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      setUploadError('User email not available');
      return;
    }

    if (!selectedDistrict) {
      setUploadError('No district selected');
      return;
    }

    const validRows = tableData.filter(row => row.parsedData && !row.parseError);
    
    if (validRows.length === 0) {
      setUploadError('No valid data to upload');
      return;
    }

    const confirmMessage = `Upload ${validRows.length} student records from ${selectedSections.join(', ')} to Google Sheets?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Transform all valid data to import records
      const allRecords: ZearnImportRecordInput[] = [];
      
      for (const row of validRows) {
        const { student, parsedData } = row;
        if (!parsedData) continue;
        
        const records = parsedData.zearnCompletions.map(completion => 
          createZearnImportRecordDefaults({
            date: new Date().toLocaleDateString(),
            section: student.section,
            teacher: student.teacher,
            studentID: student.studentID,
            firstName: student.firstName,
            lastName: student.lastName,
            lessonTitle: completion.lessonTitle,
            lessonCompletionDate: completion.lessonCompletionDate,
            weekRange: parsedData.zearnWeeks[0]?.week || '',
            weeklyMinutes: parsedData.zearnWeeks[0]?.zearnMin || '',
            ownerIds: []
          })
        );
        
        allRecords.push(...records);
      }

      // Use district-specific spreadsheet ID
      const spreadsheetId = DISTRICT_OPTIONS[selectedDistrict].spreadsheetId;

      const result = await importZearnData({
        spreadsheetId,
        completions: allRecords,
        userEmail: user.primaryEmailAddress.emailAddress
      });

      if (result.success) {
        alert(`Successfully imported ${result.data.rowsAdded} lesson completions for ${validRows.length} students!`);
        
        // Clear localStorage for selected sections after successful upload
        setStorageData(prev => {
          const newData = { ...prev };
          selectedSections.forEach(section => {
            delete newData[section];
          });
          return newData;
        });
      } else {
        setUploadError(result.error || 'Import failed');
      }
    } catch (error) {
      const errorMsg = 'Failed to import data: ' + (error instanceof Error ? error.message : 'Unknown error');
      setUploadError(errorMsg);
      handleClientError(error, 'batchZearnUpload');
    } finally {
      setIsUploading(false);
    }
  }, [tableData, user, selectedSections, selectedDistrict, setStorageData]);

  // Handle clear section data
  const handleClearSections = useCallback(() => {
    if (window.confirm(`Clear all data for sections: ${selectedSections.join(', ')}?`)) {
      setStorageData(prev => {
        const newData = { ...prev };
        selectedSections.forEach(section => {
          delete newData[section];
        });
        return newData;
      });
    }
  }, [selectedSections, setStorageData]);

  return {
    // State
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
    
    // Computed values
    tableData,
    validEntries,
    
    // Actions
    handleRawDataChange,
    handleBatchUpload,
    handleClearSections
  };
} 