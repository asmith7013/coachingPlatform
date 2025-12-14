"use server";

import ExcelJS from 'exceljs';
import { fetchStudents, updateStudent } from '@actions/scm/students';
import { parseRoadmapSheet } from '../lib/parser';
import { ImportResponse, StudentUpdateResult } from '../lib/types';

/**
 * Import student mastered skills from an Excel roadmap file
 */
export async function importStudentSkills(fileBuffer: ArrayBuffer, sheetName: string): Promise<ImportResponse> {
  const errors: string[] = [];
  const studentResults: StudentUpdateResult[] = [];

  try {
    // Parse Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    // Get sheet names
    const sheetNames = workbook.worksheets.map(ws => ws.name);

    // Check if sheet exists
    if (!sheetNames.includes(sheetName)) {
      return {
        success: false,
        totalStudentsProcessed: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        studentResults: [],
        errors: [`Sheet "${sheetName}" not found. Available sheets: ${sheetNames.join(', ')}`],
      };
    }

    // Get the specific sheet
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) {
      return {
        success: false,
        totalStudentsProcessed: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        studentResults: [],
        errors: [`Sheet "${sheetName}" could not be loaded`],
      };
    }

    // Convert sheet to 2D array (preserving empty cells)
    const sheetData: string[][] = [];
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const rowData: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Pad with empty strings if there are gaps
        while (rowData.length < colNumber - 1) {
          rowData.push('');
        }
        rowData.push(cell.value?.toString() ?? '');
      });
      // Pad to ensure consistent array from row 1
      while (sheetData.length < rowNumber - 1) {
        sheetData.push([]);
      }
      sheetData.push(rowData);
    });

    if (sheetData.length === 0) {
      return {
        success: false,
        totalStudentsProcessed: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        studentResults: [],
        errors: ['Sheet is empty'],
      };
    }

    // Parse the sheet data
    let parsedData;
    try {
      parsedData = parseRoadmapSheet(sheetData);
    } catch (parseError) {
      return {
        success: false,
        totalStudentsProcessed: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        studentResults: [],
        errors: [`Failed to parse sheet: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`],
      };
    }

    // Fetch all students from database
    const studentsResponse = await fetchStudents({
      page: 1,
      limit: 1000,
      sortBy: 'lastName',
      sortOrder: 'asc',
      filters: { active: true },
      search: '',
      searchFields: [],
    });

    if (!studentsResponse.success || !studentsResponse.items) {
      return {
        success: false,
        metadata: parsedData.metadata,
        totalStudentsProcessed: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        studentResults: [],
        errors: ['Failed to fetch students from database'],
      };
    }

    const allStudents = studentsResponse.items;

    // Process each student from the sheet
    for (const studentData of parsedData.students) {
      try {
        // Find matching student by exact name match "LASTNAME, FIRSTNAME"
        const matchingStudent = allStudents.find(student => {
          const dbName = `${student.lastName.toUpperCase()}, ${student.firstName.toUpperCase()}`.trim();
          return dbName === studentData.studentName.toUpperCase();
        });

        if (!matchingStudent) {
          studentResults.push({
            studentName: studentData.studentName,
            success: false,
            skillsAdded: 0,
            totalMasteredSkills: 0,
            error: 'Student not found in database',
          });
          errors.push(`Student "${studentData.studentName}" not found in database`);
          continue;
        }

        // Get existing mastered skills
        const existingSkills = new Set(matchingStudent.masteredSkills || []);
        const newSkills = studentData.masteredSkills.filter(skill => !existingSkills.has(skill));

        // Merge with new skills
        const updatedSkills = Array.from(new Set([...existingSkills, ...studentData.masteredSkills]));

        // Update student in database
        const updateResponse = await updateStudent(matchingStudent._id, {
          masteredSkills: updatedSkills,
        });

        if (updateResponse.success) {
          studentResults.push({
            studentName: studentData.studentName,
            success: true,
            skillsAdded: newSkills.length,
            totalMasteredSkills: updatedSkills.length,
          });
        } else {
          studentResults.push({
            studentName: studentData.studentName,
            success: false,
            skillsAdded: 0,
            totalMasteredSkills: existingSkills.size,
            error: updateResponse.error || 'Failed to update student',
          });
          errors.push(`Failed to update ${studentData.studentName}: ${updateResponse.error}`);
        }
      } catch (studentError) {
        const errorMsg = studentError instanceof Error ? studentError.message : 'Unknown error';
        studentResults.push({
          studentName: studentData.studentName,
          success: false,
          skillsAdded: 0,
          totalMasteredSkills: 0,
          error: errorMsg,
        });
        errors.push(`Error processing ${studentData.studentName}: ${errorMsg}`);
      }
    }

    const successfulUpdates = studentResults.filter(r => r.success).length;
    const failedUpdates = studentResults.filter(r => !r.success).length;

    return {
      success: successfulUpdates > 0,
      metadata: parsedData.metadata,
      totalStudentsProcessed: parsedData.totalStudentsFound,
      successfulUpdates,
      failedUpdates,
      studentResults,
      errors,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      totalStudentsProcessed: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      studentResults: [],
      errors: [errorMsg],
    };
  }
}
