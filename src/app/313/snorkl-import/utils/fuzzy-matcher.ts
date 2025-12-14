import Fuse from 'fuse.js';
import { Student } from '@/lib/schema/zod-schema/scm/student/student';
import { StudentMatch } from '../types';

// Configure Fuse.js for name matching
const fuseOptions = {
  keys: [
    { name: 'firstName', weight: 0.4 },
    { name: 'lastName', weight: 0.4 },
    { name: 'fullName', weight: 0.2 }
  ],
  threshold: 0.7, // CHANGED: from 0.4 to 0.7 (more lenient)
  distance: 100,
  includeScore: true,
  ignoreLocation: true,
  findAllMatches: false
};

/**
 * Find the best student match using fuzzy search
 */
export function findBestStudentMatch(
  attemptedName: string, 
  students: Student[]
): StudentMatch | null {
  if (!attemptedName || !students.length) {
    return null;
  }

  // Prepare student data for Fuse.js
  const searchableStudents = students.map(student => ({
    ...student,
    fullName: `${student.firstName} ${student.lastName}`.toLowerCase().trim()
  }));

  // Create Fuse instance
  const fuse = new Fuse(searchableStudents, fuseOptions);
  
  // Search for matches
  const results = fuse.search(attemptedName.toLowerCase().trim());
  
  if (results.length === 0) {
    return null;
  }

  const bestMatch = results[0];
  const score = bestMatch.score || 1;
  
  // FIXED: Better confidence bands for Fuse.js scores
  let confidence: 'high' | 'medium' | 'low' | 'none';
  if (score <= 0.2) confidence = 'high';      // 0.0-0.2: excellent matches
  else if (score <= 0.5) confidence = 'medium'; // 0.2-0.5: good matches  
  else if (score <= 0.7) confidence = 'low';    // 0.5-0.7: acceptable matches
  else confidence = 'none';                      // >0.7: poor matches

  return {
    student: bestMatch.item,
    confidence,
    score
  };
} 