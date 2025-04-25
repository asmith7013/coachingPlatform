'use client'

import React, { useState } from 'react';
import { Card } from '@/components/composed/cards';
import { Button } from '@/components/core/Button';
import Header from './components/Header';
import BasicInfo from './components/BasicInfo';
import CurriculumSelector from './components/CurriculumSelector';
import FeedbackSection from './components/FeedbackSection';
import LearningSection from './components/LearningSection';
import LessonFlow from './components/LessonFlow';
import ProgressMonitoring from './components/ProgressMonitoring';
import TimeTracking from './components/TimeTracking';
import Transcripts from './components/Transcripts';
import PreExitChecklist from './components/PreExitChecklist';
import { curriculumData, exampleLessonData } from './data';

// Type definitions for form data
export interface TimeData {
  startTime: string;
  endTime: string;
  stopwatchTime: string;
  startedWhen: string;
}

export interface ActivitySection {
  launch: string;
  workTime: string;
  synthesis: string;
}

export interface ProgressMonitoring {
  teacherDebriefing: boolean;
  intentionalCallOuts: boolean;
  studentExplaining: boolean;
  activeListening: boolean;
  engagementMoves: boolean;
  visibleThinking: boolean;
  followUpQuestions: boolean;
}

export interface Transcripts {
  warmUpLaunch: string;
  activity1Launch: string;
  activity2Launch: string;
  synthesisLaunch: string;
}

export interface CurriculumSelection {
  course: string;
  unit: string;
  lesson: string;
  title: string;
}

export interface FormData {
  cycle: string;
  session: string;
  date: string;
  teacher: string;
  curriculum: CurriculumSelection;
  otherContext: string;
  
  learningTargets: string;
  coolDown: string;
  
  glow: string;
  wonder: string;
  grow: string;
  nextSteps: string;
  
  // Activity sections
  warmUp: ActivitySection;
  activity1: ActivitySection;
  activity2: ActivitySection;
  lessonSynthesis: ActivitySection;
  
  // Progress monitoring
  progressMonitoring: ProgressMonitoring;
  
  // Transcripts
  transcripts: Transcripts;
}

const ClassroomNotesPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeData, setTimeData] = useState<TimeData>({
    startTime: '',
    endTime: '',
    stopwatchTime: '00:00:00',
    startedWhen: '',
  });
  
  // Form data state - pre-populated with example data
  const [formData, setFormData] = useState<FormData>({
    cycle: 'Cycle 2',
    session: 'Session 3',
    date: new Date().toISOString().split('T')[0],
    teacher: 'Ms. Johnson',
    curriculum: {
      course: exampleLessonData.course,
      unit: exampleLessonData.unit,
      lesson: exampleLessonData.lesson,
      title: exampleLessonData.title
    },
    otherContext: 'Block period class. 28 students present. Co-teaching with Mr. Smith.',
    
    learningTargets: exampleLessonData.learningGoals.map(goal => `• ${goal}`).join('\n'),
    coolDown: '',
    
    glow: '',
    wonder: '',
    grow: '',
    nextSteps: '',
    
    // Activity sections
    warmUp: {
      launch: '',
      workTime: '',
      synthesis: '',
    },
    activity1: {
      launch: '',
      workTime: '',
      synthesis: '',
    },
    activity2: {
      launch: '',
      workTime: '',
      synthesis: '',
    },
    lessonSynthesis: {
      launch: '',
      workTime: '',
      synthesis: '',
    },
    
    // Progress monitoring
    progressMonitoring: {
      teacherDebriefing: false,
      intentionalCallOuts: false,
      studentExplaining: false,
      activeListening: false,
      engagementMoves: false,
      visibleThinking: false,
      followUpQuestions: false,
    },
    
    // Transcripts
    transcripts: {
      warmUpLaunch: '',
      activity1Launch: '',
      activity2Launch: '',
      synthesisLaunch: '',
    }
  });
  
  const startStopwatch = () => {
    console.log("Starting stopwatch");
    // Stopwatch logic implementation
  };
  
  const pauseStopwatch = () => {
    console.log("Pausing stopwatch");
    // Pause stopwatch logic
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      
      if (section === 'warmUp' || section === 'activity1' || section === 'activity2' || section === 'lessonSynthesis') {
        setFormData({
          ...formData,
          [section]: {
            ...formData[section as keyof typeof formData] as ActivitySection,
            [field]: value
          }
        });
      } else if (section === 'transcripts') {
        setFormData({
          ...formData,
          transcripts: {
            ...formData.transcripts,
            [field]: value
          }
        });
      } else if (section === 'curriculum') {
        handleCurriculumChange(field, value);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleCurriculumChange = (field: string, value: string) => {
    // Update the curriculum field
    const newCurriculum = { ...formData.curriculum, [field]: value };
    
    // If changing to the example lesson, populate with example data
    let learningTargets = formData.learningTargets;
    let title = formData.curriculum.title;
    
    if (field === 'lesson' && 
        newCurriculum.course === exampleLessonData.course && 
        newCurriculum.unit === exampleLessonData.unit && 
        value === exampleLessonData.lesson) {
      learningTargets = exampleLessonData.learningGoals.map(goal => `• ${goal}`).join('\n');
      title = exampleLessonData.title;
    } else if (field === 'course' || field === 'unit') {
      // Reset lesson title for other selections
      title = '';
    }
    
    // Update form data
    setFormData({
      ...formData,
      curriculum: {
        ...newCurriculum,
        title
      },
      learningTargets
    });
  };
  
  const handleCheckboxChange = (name: string) => {
    // For progress monitoring checkboxes
    const [section, field] = name.split('.');
    
    if (section === 'progressMonitoring') {
      setFormData({
        ...formData,
        progressMonitoring: {
          ...formData.progressMonitoring,
          [field as keyof ProgressMonitoring]: !formData.progressMonitoring[field as keyof ProgressMonitoring]
        }
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save to database logic would go here
      console.log("Submitting form data:", formData);
      
      // Mock successful submission
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to visit summary or teacher profile
        // router.push(`/teachers/${formData.teacher}/visits`);
      }, 1000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsLoading(false);
    }
  };

  // Custom Card components for compatibility
  const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={className}>{children}</div>
  );
  
  const CardBody: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={className}>{children}</div>
  );
  
  const CardFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={className}>{children}</div>
  );

  // Composite Card component
  const CompositeCard = Object.assign(Card, {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter
  });
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <form onSubmit={handleSubmit}>
        <CompositeCard className="mb-6">
          <CompositeCard.Header className="p-4 border-b">
            <Header startStopwatch={startStopwatch} pauseStopwatch={pauseStopwatch} />
          </CompositeCard.Header>
          
          <CompositeCard.Body className="p-4">
            <BasicInfo 
              formData={formData} 
              handleInputChange={handleInputChange} 
            />
            
            <CurriculumSelector 
              formData={formData}
              handleInputChange={handleInputChange}
              curriculumData={curriculumData}
              exampleLessonData={exampleLessonData}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FeedbackSection 
                formData={formData} 
                handleInputChange={handleInputChange} 
              />
              
              <LearningSection 
                formData={formData} 
                handleInputChange={handleInputChange} 
              />
            </div>
            
            <LessonFlow 
              formData={formData} 
              handleInputChange={handleInputChange} 
            />
            
            <ProgressMonitoring 
              formData={formData} 
              handleCheckboxChange={handleCheckboxChange} 
            />
            
            <TimeTracking 
              timeData={timeData} 
              setTimeData={setTimeData} 
            />
            
            <Transcripts 
              formData={formData} 
              handleInputChange={handleInputChange} 
            />
            
            <PreExitChecklist />
          </CompositeCard.Body>
          
          <CompositeCard.Footer className="flex justify-end space-x-3 p-4 border-t">
            <Button appearance="outline" type="button">Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Observation Notes'}
            </Button>
          </CompositeCard.Footer>
        </CompositeCard>
      </form>
    </div>
  );
};

export default ClassroomNotesPage;