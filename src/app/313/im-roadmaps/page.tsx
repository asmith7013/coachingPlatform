"use client";

import { useState, useEffect } from 'react';
import { fetchIMLessons } from '@actions/313/im-lessons';
import { getAllRoadmapsStudents, getRoadmapsStudentPerformance } from '@actions/313/student-performance';
import { LessonBadges } from './components/LessonBadges';
import { LessonSkillsView } from './components/LessonSkillsView';
import { RoadmapsLesson } from '@zod-schema/313/roadmap';


export default function IMRoadmapsPage() {
  const [lessons, setLessons] = useState<RoadmapsLesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Student selection state
  const [students, setStudents] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudentData, setSelectedStudentData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentDataLoading, setStudentDataLoading] = useState(false);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        const result = await fetchIMLessons({ limit: 1000 }); // Get all lessons
        if (result.success && result.data) {
          // Handle both array and object responses from server action
          const rawLessons = Array.isArray(result.data) ? result.data : (result.data.items || []);
          const lessonsWithStringIds = rawLessons.map((lesson: Record<string, unknown>): RoadmapsLesson => ({
            _id: (lesson._id as string)?.toString() || (lesson._id as string),
            ownerIds: (lesson.ownerIds as string[]) || [],
            title: (lesson.title as string) || (lesson.lessonName as string) || '',
            url: (lesson.url as string) || '',
            section: lesson.section as string | undefined,
            lesson: lesson.lesson as number | undefined,
            lessonName: lesson.lessonName as string | undefined,
            grade: lesson.grade as string | undefined,
            unit: lesson.unit as string | undefined,
            learningTargets: lesson.learningTargets as string | undefined,
            suggestedTargetSkills: (lesson.suggestedTargetSkills as string[]) || [],
            essentialSkills: (lesson.essentialSkills as string[]) || [],
            helpfulSkills: (lesson.helpfulSkills as string[]) || [],
            description: (lesson.description as string) || '',
            skillChallengeCriteria: (lesson.skillChallengeCriteria as string) || '',
            essentialQuestion: (lesson.essentialQuestion as string) || '',
            launch: (lesson.launch as string) || '',
            teacherStudentStrategies: (lesson.teacherStudentStrategies as string) || '',
            modelsAndManipulatives: (lesson.modelsAndManipulatives as string) || '',
            questionsToHelp: (lesson.questionsToHelp as string) || '',
            discussionQuestions: (lesson.discussionQuestions as string) || '',
            commonMisconceptions: (lesson.commonMisconceptions as string) || '',
            additionalResources: (lesson.additionalResources as string) || '',
            standards: (lesson.standards as string) || '',
            vocabulary: (lesson.vocabulary as string[]) || [],
            images: (lesson.images as string[]) || [],
            videoUrl: (lesson.videoUrl as string) || '',
            practiceProblems: (lesson.practiceProblems as Array<{problemNumber: number, screenshotUrl: string, scrapedAt: string}>) || [],
            scrapedAt: (lesson.scrapedAt as string) || new Date().toISOString(),
            success: (lesson.success as boolean) ?? true,
            tags: (lesson.tags as string[]) || []
          }));
          setLessons(lessonsWithStringIds);
        } else {
          setError(result.error || 'Failed to load lessons');
        }
      } catch (err) {
        setError('Failed to load lessons');
        console.error('Error loading lessons:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLessons();
  }, []);

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setStudentsLoading(true);
        const result = await getAllRoadmapsStudents();
        
        if (result.success && result.data) {
          // Transform the server response to match our interface
          const transformedStudents = result.data.map((student: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            studentId: student.studentId,
            studentName: student.studentName,
            schoolId: student.schoolId,
            assessmentDate: student.assessmentDate,
            _id: student._id
          }));
          setStudents(transformedStudents);
          console.log(`Loaded ${transformedStudents.length} roadmaps students`);
        } else {
          console.error('Failed to load students:', result.error);
        }
      } catch (err) {
        console.error('Error loading students:', err);
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Load selected student's performance data
  useEffect(() => {
    if (!selectedStudentId) {
      setSelectedStudentData(null);
      return;
    }

    const loadStudentData = async () => {
      try {
        setStudentDataLoading(true);
        setSelectedStudentData(null); // Clear previous data
        
        // Add timeout to prevent infinite hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const result = await Promise.race([
          getRoadmapsStudentPerformance(selectedStudentId),
          timeoutPromise
        ]) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        
        if (result.success && result.data) {
          // Transform the server response to match our interface
          const transformedData = {
            studentId: result.data.studentId || '',
            studentName: result.data.studentName || '',
            schoolId: result.data.schoolId || '',
            assessmentDate: result.data.assessmentDate || '',
            skillPerformances: Array.isArray(result.data.skillPerformances) 
              ? result.data.skillPerformances.slice(0, 200) // Limit frontend data too
              : []
          };
          setSelectedStudentData(transformedData);
        } else {
          console.error('Failed to load student data:', result?.error || 'Unknown error');
          setSelectedStudentData(null);
        }
      } catch (err) {
        console.error('Error loading student data:', err);
        setSelectedStudentData(null);
        // Show user-friendly error
        if (err instanceof Error && err.message.includes('Maximum call stack')) {
          setError('Student data is too large to load. Please contact support.');
        }
      } finally {
        setStudentDataLoading(false);
      }
    };

    loadStudentData();
  }, [selectedStudentId]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading lessons...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <div className="text-red-800">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">IM Lessons & Roadmaps Skills Explorer</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-2">ℹ️</div>
            <div className="text-yellow-800">No lessons found. Please add some IM lessons to get started.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">IM Lessons & Roadmaps Skills Explorer</h1>
          <p className="text-gray-600">
            Select a student to see their skill mastery levels, then choose a lesson to explore how target skills connect to their essential prerequisites and helpful supporting skills.
          </p>
        </div>
        
        {/* Main Content with Sidebar Layout */}
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            {selectedLessonId ? (
              <LessonSkillsView 
                lessonId={selectedLessonId}
                lessons={lessons}
                studentData={selectedStudentData}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Ready to Explore Skills</h3>
                <p className="text-gray-600">
                  {selectedStudentData 
                    ? `Select a lesson from the sidebar to see how target skills connect to prerequisites for ${selectedStudentData.studentName}`
                    : 'Select a student and lesson from the sidebar to see personalized skill roadmap analysis'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Student & Lesson Selection */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Student Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">
                Students ({students.length})
              </h2>
              
              <div className="space-y-3">
                {studentsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                ) : (
                  students.map((student) => (
                    <button
                      key={student.studentId}
                      onClick={() => setSelectedStudentId(student.studentId)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors text-sm ${
                        selectedStudentId === student.studentId
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="font-medium">{student.studentName}</div>
                      <div className={`text-xs mt-1 ${
                        selectedStudentId === student.studentId ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        Assessment: {student.assessmentDate}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {studentDataLoading && (
                <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-purple-700 text-sm">Loading student performance data...</p>
                </div>
              )}

              {selectedStudentData && !studentDataLoading && (
                <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h3 className="font-medium text-purple-900 text-sm mb-1">
                    Active: {selectedStudentData.studentName}
                  </h3>
                  <div className="text-xs text-purple-700">
                    Skills Tracked: {selectedStudentData.skillPerformances.length}
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Lessons ({lessons.length})
              </h2>
              <div className="max-h-96 overflow-y-auto">
                <LessonBadges 
                  lessons={lessons}
                  selectedLessonId={selectedLessonId}
                  onLessonSelect={setSelectedLessonId}
                />
              </div>
            </div>

            {/* Selected Lesson Context */}
            {selectedLessonId && (() => {
              const selectedLesson = lessons.find(lesson => lesson._id === selectedLessonId);
              return selectedLesson ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Current Lesson
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">
                        {selectedLesson.grade} {selectedLesson.unit} - Section {selectedLesson.section}, Lesson {selectedLesson.lesson}
                      </h4>
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedLesson.lessonName}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2">
                        Learning Targets:
                      </h5>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        {selectedLesson.learningTargets}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
