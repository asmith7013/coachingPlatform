import React from 'react';
import { ActionPlanStage } from './ActionPlanStage';
import { MetricsTable } from './MetricsTable';
import { CoachingMovesTable } from './CoachingMovesTable';
import { ImplementationRecord } from './ImplementationRecord';
import { MonitoringProgress } from './MonitoringProgress';
import { ReflectionSection } from './ReflectionSection';

export interface ActionPlanProps {
  title: string;
  coach: string;
  teacher: string;
  subject: string;
  startDate: string;
  endDate: string;
  objective: string;
  stageInfo: {
    number: number;
    title: string;
    content: React.ReactNode;
  };
  successMetrics: {
    metrics: Array<{
      name: string;
      scores: (number | null)[];
    }>;
    dates: string[];
  };
  coachingMoves: Array<{
    category: string;
    moves: string[];
    tools: string[];
  }>;
  implementation: {
    records: Array<{
      date: string;
      moveSelected: string;
      teacherActions: string;
      studentOutcomes: string;
      nextStep: string;
    }>;
    dates: string[];
  };
  monitoring: {
    metrics: Array<{
      name: string;
      scores: (number | null)[];
    }>;
    dates: string[];
    evidence: string[];
  };
  reflections: Array<{
    question: string;
    response: string;
  }>;
}

export const ActionPlan: React.FC<ActionPlanProps> = ({
  title,
  coach,
  teacher,
  subject,
  startDate,
  endDate,
  objective,
  stageInfo,
  successMetrics,
  coachingMoves,
  implementation,
  monitoring,
  reflections
}) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-blue-800">{title}</h1>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-500">Coach</p>
            <p className="font-medium">{coach}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teacher</p>
            <p className="font-medium">{teacher}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Subject/Grade</p>
            <p className="font-medium">{subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Timeline</p>
            <p className="font-medium">{startDate} - {endDate}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Objective</h2>
        <p className="p-3 bg-blue-50 rounded-md text-blue-800 border border-blue-100">{objective}</p>
      </div>

      <ActionPlanStage 
        number={stageInfo.number}
        title={stageInfo.title}
        className=""
      >
        {stageInfo.content}
      </ActionPlanStage>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Success Metrics</h2>
        <MetricsTable 
          metrics={successMetrics.metrics} 
          dates={successMetrics.dates} 
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Coaching Activities</h2>
        <CoachingMovesTable moves={coachingMoves} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Implementation Record</h2>
        <ImplementationRecord 
          records={implementation.records} 
          dates={implementation.dates}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Progress Monitoring</h2>
        <MonitoringProgress 
          metrics={monitoring.metrics} 
          dates={monitoring.dates} 
          evidence={monitoring.evidence}
        />
      </div>

      <ReflectionSection reflections={reflections} />
    </div>
  );
}; 