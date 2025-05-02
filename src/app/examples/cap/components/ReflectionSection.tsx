import React from 'react';

interface Reflection {
  question: string;
  response: string;
}

interface ReflectionSectionProps {
  reflections: Reflection[];
}

export const ReflectionSection: React.FC<ReflectionSectionProps> = ({ reflections }) => {
  return (
    <div className="mt-8">
      <h3 className="font-semibold text-lg mb-4">Reflections and Next Steps</h3>
      <div className="space-y-6">
        {reflections.map((reflection, idx) => (
          <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">{reflection.question}</h4>
            <p className="text-gray-700">{reflection.response}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-700 mb-2">Teacher Spotlight Opportunity</h4>
        <p className="text-green-800 mb-3">
          Based on the progress shown in this coaching cycle, consider sharing these practices 
          with other teachers through professional development or peer learning.
        </p>
        <a 
          href="#" 
          className="text-green-700 font-medium hover:underline"
        >
          Create Teacher Spotlight →
        </a>
      </div>
    </div>
  );
}; 