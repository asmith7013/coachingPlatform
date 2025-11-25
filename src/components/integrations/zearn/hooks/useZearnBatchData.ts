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
  nameMatch: {
    isMatched: boolean;
    attemptedName: string;
    confidence: 'high' | 'medium' | 'low' | 'none';
  };
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

  // Check name match between student and parsed data
  const checkNameMatch = useCallback((student: Student, parsedData: ParsedStudentData | null) => {
    if (!parsedData || !parsedData.studentName) {
      return {
        isMatched: false,
        attemptedName: '',
        confidence: 'none' as const
      };
    }

    const studentFullName = `${student.firstName} ${student.lastName}`.toLowerCase().trim();
    const zearnName = parsedData.studentName.toLowerCase().trim();
    const zearnParsedName = `${parsedData.firstName} ${parsedData.lastName}`.toLowerCase().trim();

    // Exact match
    if (studentFullName === zearnName || studentFullName === zearnParsedName) {
      return {
        isMatched: true,
        attemptedName: parsedData.studentName,
        confidence: 'high' as const
      };
    }

    // Partial match (contains all words)
    const studentWords = studentFullName.split(/\s+/);
    const zearnWords = zearnName.split(/\s+/);
    
    const allWordsMatch = studentWords.every(word => 
      zearnWords.some(zearnWord => zearnWord.includes(word) || word.includes(zearnWord))
    );

    if (allWordsMatch) {
      return {
        isMatched: true,
        attemptedName: parsedData.studentName,
        confidence: 'medium' as const
      };
    }

    // No match
    return {
      isMatched: false,
      attemptedName: parsedData.studentName,
      confidence: 'low' as const
    };
  }, []);

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
            // Map MongoDB documents to Student type
            const students: Student[] = result.items.map((item: Record<string, unknown>) => ({
              _id: (item._id as { toString(): string }).toString(),
              ownerIds: item.ownerIds as string[],
              studentID: item.studentID as number,
              firstName: item.firstName as string,
              lastName: item.lastName as string,
              school: item.school as Student['school'],
              section: item.section as Student['section'],
              active: item.active as boolean,
              roadmapSkills: item.roadmapSkills as string[],
              roadmap: item.roadmap as string,
              studentGrade: item.studentGrade as string,
              skillGrade: item.skillGrade as string,
              lastAssessmentDate: item.lastAssessmentDate as string | undefined,
              masteredSkills: (item.masteredSkills as string[]) || [],
              classActivities: (item.classActivities as Student['classActivities']) || [],
              skillPerformances: (item.skillPerformances as Student['skillPerformances']) || [],
              zearnLessons: (item.zearnLessons as Student['zearnLessons']) || [],
              rampUpProgress: (item.rampUpProgress as Student['rampUpProgress']) || []
            }));
            allStudents.push(...students);
          } else {
            console.warn(`Failed to load students for section ${section}:`, result.error);
          }
        }
        
        if (allStudents.length > 0) {
          // Sort by section first, then by firstName alphabetically
        //   const sortedStudents = allStudents.sort((a, b) => {
        //     const sectionCompare = a.section.localeCompare(b.section);
        //     if (sectionCompare !== 0) return sectionCompare;
        //     return a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase());
        //   });
          const sortedStudents = allStudents.sort((a, b) => {
            const fullNameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const fullNameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            return fullNameA.localeCompare(fullNameB);
          });
          console.log('🔍 Sorted students:', sortedStudents);
          setStudents(sortedStudents);
        } else {
          setStudentsError('No students found for selected sections');
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
          // That's it - if we have a name and week data, it's valid
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

  // Handle manual name correction
  const handleManualNameCorrection = useCallback((studentId: string, correctedName: string) => {
    const student = students.find(s => s._id === studentId);
    const studentSection = student?.section || selectedSections[0] || '';
    
    setStorageData(prev => {
      const sectionData = prev[studentSection] || {};
      const studentData = sectionData[studentId];
      
      if (!studentData || !studentData.rawData) return prev;
      
      // Re-parse with corrected name
      try {
        const correctedData = parseZearnData(studentData.rawData);
        correctedData.studentName = correctedName;
        
        // Re-parse firstName/lastName from corrected name
        const nameParts = correctedName.trim().split(/\s+/);
        correctedData.firstName = nameParts[0] || '';
        correctedData.lastName = nameParts.slice(1).join(' ') || '';
        
        return {
          ...prev,
          [studentSection]: {
            ...sectionData,
            [studentId]: {
              ...studentData,
              parsedData: correctedData,
              parseError: null
            }
          }
        };
      } catch (error) {
        return {
          ...prev,
          [studentSection]: {
            ...sectionData,
            [studentId]: {
              ...studentData,
              parseError: error instanceof Error ? error.message : 'Parse error after correction'
            }
          }
        };
      }
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
      
      const nameMatch = checkNameMatch(student, studentData.parsedData);
      
      return {
        student,
        rawData: studentData.rawData,
        parsedData: studentData.parsedData,
        parseError: studentData.parseError,
        nameMatch
      };
    });
  }, [students, storageData, checkNameMatch]);

  // Count valid entries - now requires name matching
  const validEntries = useMemo(() => {
    return tableData.filter(row => 
      row.parsedData && 
      !row.parseError && 
      row.nameMatch.isMatched
    ).length;
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

    const validRows = tableData.filter(row => 
      row.parsedData && 
      !row.parseError && 
      row.nameMatch.isMatched
    );
    
    if (validRows.length === 0) {
      setUploadError('No valid data to upload. All students must have parsed data with matching names.');
      return;
    }

    const confirmMessage = `Upload ${validRows.length} student records from ${selectedSections.join(', ')} to Google Sheets?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Transform all valid data to import records - single path for both cases
      const allRecords: ZearnImportRecordInput[] = [];
      
      for (const row of validRows) {
        const { student, parsedData } = row;
        if (!parsedData) continue;
        
        if (parsedData.zearnCompletions.length > 0) {
          // Multiple records for lessons
          parsedData.zearnCompletions.forEach(completion => {
            allRecords.push(createZearnImportRecordDefaults({
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
            }));
          });
        } else {
          // Single record with empty lesson fields
          allRecords.push(createZearnImportRecordDefaults({
            date: new Date().toLocaleDateString(),
            section: student.section,
            teacher: student.teacher,
            studentID: student.studentID,
            firstName: student.firstName,
            lastName: student.lastName,
            // lessonTitle and lessonCompletionDate default to empty
            weekRange: parsedData.zearnWeeks[0]?.week || '',
            weeklyMinutes: parsedData.zearnWeeks[0]?.zearnMin || '',
            ownerIds: []
          }));
        }
      }

      // Use district-specific spreadsheet ID
      const spreadsheetId = DISTRICT_OPTIONS[selectedDistrict].spreadsheetId;

      const result = await importZearnData({
        spreadsheetId,
        completions: allRecords,
        userEmail: user.primaryEmailAddress.emailAddress
      });

      if (result.success) {
        alert(`Successfully imported ${result.data.rowsAdded} records for ${validRows.length} students!`);
        
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
    handleClearSections,
    handleManualNameCorrection
  };
} 