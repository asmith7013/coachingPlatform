import React from 'react';
import { tv } from 'tailwind-variants';

interface ExampleLessonData {
  course: string;
  unit: string;
  lesson: string;
  title: string;
  learningGoals: string[];
  coolDownUrl: string;
  handoutUrl: string;
  lessonUrl: string;
}

interface ResourceLinksProps {
  exampleLessonData: ExampleLessonData;
}

const resourceLink = tv({
  base: "flex items-center text-blue-600 hover:text-blue-800 underline text-sm mt-1"
});

const ResourceLinks: React.FC<ResourceLinksProps> = ({ exampleLessonData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 mt-3">
      <a 
        href={exampleLessonData.coolDownUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={resourceLink()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        View Cool Down PDF
      </a>
      <a 
        href={exampleLessonData.handoutUrl} 
        target="_blank"
        rel="noopener noreferrer"
        className={resourceLink()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Student Handout
      </a>
      <a 
        href={exampleLessonData.lessonUrl} 
        target="_blank"
        rel="noopener noreferrer"
        className={resourceLink()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Lesson Plan
      </a>
    </div>
  );
};

export default ResourceLinks; 