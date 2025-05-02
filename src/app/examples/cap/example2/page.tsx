"use client";

import React from 'react';
import { ActionPlanStage } from '../components/ActionPlanStage';
import { exampleData } from './data';
import { GoalSection } from '../components/GoalSection';
// import { Input } from '@/components/core/fields/Input';
import { Textarea } from '@/components/core/fields/Textarea';
// import Image from 'next/image';
export default function Example2Page() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        {/* Teaching Lab Logo */}
        <div className="mb-6">
          {/* <Image 
            src="/images/teaching-lab-logo.svg" 
            alt="Teaching Lab Logo" 
            className="h-16"
            // Fallback text in case image doesn't load
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.parentElement!.innerHTML = '<div class="h-16 flex items-center justify-start text-2xl font-bold text-blue-700">Teaching Lab</div>';
            }}
          /> */}
        </div>
        
        {/* Header with coach information */}
        <div className="bg-gray-100 p-6 rounded-md mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Coaching Action Plan Template
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Coach Name: {exampleData.coachName}</p>
              <p>District: {exampleData.district}</p>
              <p>School: {exampleData.school}</p>
            </div>
            <div>
              <p>Teacher Name(s): {exampleData.teacherName}</p>
              <p>Cycle #{exampleData.cycleNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stage 1: Identify Needs & Determine Focus */}
      <div className="mb-8">
        <ActionPlanStage
          number={1}
          title="Identify Needs & Determine Focus"
          className="bg-orange-100"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Focus: {exampleData.focus}</h3>
              <div className="p-3 bg-white rounded-md border border-gray-200">
                {exampleData.rationale}
              </div>
            </div>
          </div>
        </ActionPlanStage>
      </div>

      {/* Stage 2: Set Goals */}
      <div className="mb-8">
        <ActionPlanStage
          number={2}
          title="Set Goals"
          className="bg-teal-100"
        >
          <div className="space-y-4">
            {/* Use the GoalSection component */}
            <GoalSection 
              goalText={exampleData.goalSet} 
              className="mb-4"
            />
            
            <div>
              <h3 className="font-semibold text-lg mb-2">
                <span className="inline-block mr-2">🍎</span>
                Teacher Outcome & Metric:
              </h3>
              <div className="p-3 bg-white rounded-md border border-gray-200">
                {exampleData.teacherOutcome}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">
                <span className="inline-block mr-2">✏️</span>
                Student Outcome & Metric:
              </h3>
              <div className="p-3 bg-white rounded-md border border-gray-200">
                {exampleData.studentOutcome}
              </div>
            </div>
          </div>
        </ActionPlanStage>
      </div>

      {/* Stage 3: Planning Implementation and Support */}
      <div className="mb-8">
        <ActionPlanStage
          number={3}
          title="Planning Implementation and Support"
          className="bg-purple-100"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Action Steps towards Goal:</h3>
              <p className="mb-4">Identify the steps you plan to take to support teacher and student outcomes</p>
              <div className="p-3 bg-white rounded-md border border-gray-200 mb-4">
                {exampleData.actionSteps}
              </div>
              
              <p className="mb-4">What are the actions and evidence you&apos;re going to collect each session to get to your goal?</p>
              
              {/* Session Planning Section */}
              {exampleData.sessions.map((session, index) => (
                <div key={index} className="bg-primary-50/50 p-4 rounded-md mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="font-bold text-primary">
                      {session.checkmarks} Session {session.number}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                  <div className="space-y-3">
  <div className="w-full">
    <Textarea
      label="📆 Weekly Focus:"
      defaultValue={session.weeklyFocus}
      placeholder="Enter weekly focus"
      rows={4}
      width="full"
      resize="vertical"
      className="min-h-[100px]"
    />
  </div>
  
  <div className="w-full">
    <Textarea
      label="🔎 Weekly Look Fors:"
      defaultValue={session.weeklyLookFors}
      placeholder="Enter weekly look fors"
      rows={4}
      width="full"
      resize="vertical"
      className="min-h-[100px]"
    />
  </div>
  
  <div className="w-full">
    <Textarea
      label="📝 Coach Action:"
      defaultValue={session.coachAction}
      placeholder="Enter coach action"
      rows={4}
      width="full"
      resize="vertical"
      className="min-h-[100px]"
    />
  </div>
  
  <div className="w-full">
    <Textarea
      label="🍎 Teacher Action:"
      defaultValue={session.teacherAction}
      placeholder="Enter teacher action"
      rows={4}
      width="full"
      resize="vertical"
      className="min-h-[100px]"
    />
  </div>
  
  <div className="w-full">
    <Textarea 
      label="📊 Progress Monitoring:"
      defaultValue={session.progressMonitoring}
      placeholder="Enter progress monitoring"
      rows={4}
      width="full"
      resize="vertical"
      className="min-h-[100px]"
    />
  </div>
</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ActionPlanStage>
      </div>

      {/* Implementation Record */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-center bg-blue-700 text-white py-2">
          Coaching Implementation Record
        </h2>
        
        {exampleData.implementationRecords.map((record, index) => (
          <div key={index} className="mb-6 border border-gray-200 rounded-md overflow-hidden">
            <div className={`flex items-center gap-2 p-3 font-bold text-white ${index % 2 === 0 ? 'bg-blue-600' : 'bg-blue-800'}`}>
              {record.checkmarks} Session {record.number}
            </div>
            
            <div className="bg-gray-100">
              <div className="grid grid-cols-5">
                <div className="col-span-1 bg-gray-200 p-3 flex items-center">
                  <span className="font-medium">🔎 Look For</span>
                </div>
                <div className="col-span-4 p-3">
                <Textarea
                  // label="Look For"
                  defaultValue={record.lookFor}
                  placeholder="Enter look for"
                  rows={2}
                  width="full"
                />
                </div>
              </div>
              
              <div className="grid grid-cols-5">
                <div className="col-span-1 bg-gray-200 p-3 flex items-center">
                  <span className="font-medium">🌟 Glows</span>
                </div>
                <div className="col-span-4 p-3">
                <Textarea
                  // label="Glows"
                  defaultValue={record.glows}
                  placeholder="Enter glows"
                  rows={2}
                  width="full"
                />
                </div>
              </div>
              
              <div className="grid grid-cols-5">
                <div className="col-span-1 bg-gray-200 p-3 flex items-center">
                  <span className="font-medium">📈 Areas to strengthen</span>
                </div>
                <div className="col-span-4 p-3">
                <Textarea
                  // label="Areas to Strengthen"
                  defaultValue={record.areasToStrengthen}
                  placeholder="Enter areas to strengthen"
                  rows={2}
                  width="full"
                />
                </div>
              </div>
              
              <div className="grid grid-cols-5">
                <div className="col-span-1 bg-gray-200 p-3 flex items-center">
                  <span className="font-medium">💡 Metrics of Success</span>
                </div>
                <div className="col-span-4 p-3">
                <Textarea
                  // label="Metrics of Success"
                  defaultValue={record.metricsOfSuccess}
                  placeholder="Enter metrics of success"
                  rows={2}
                  width="full"
                />
                </div>
              </div>
              
              <div className="grid grid-cols-5">
                <div className="col-span-1 bg-blue-500 text-white p-3 flex items-center">
                  <span className="font-medium">Next Steps</span>
                </div>
                <div className="col-span-4">
                <Textarea
                  // label="Next Steps"
                  defaultValue={record.nextSteps}
                  placeholder="Enter next steps"
                  rows={4}
                  width="full"
                />
                </div>
                {/* <div className="col-span-4 p-3">{record.nextSteps || "-"}</div> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stage 4: Analyze and Discuss */}
      <div className="mb-8">
        <ActionPlanStage
          number={4}
          title="Analyze and Discuss"
          className="bg-teal-100"
        >
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-2">End of Cycle: What story does the data tell?</h3>
            
            <div className="mb-4">
              <p className="font-medium mb-2">Was this goal met:</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={exampleData.goalMet === 'yes'} readOnly />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={exampleData.goalMet === 'no'} readOnly />
                  <span>No</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Link to Evidence (uploaded in folder)</h4>
                <p className="text-sm text-gray-600">(How do you know?)</p>
                <div className="p-3 bg-white rounded-md border border-gray-200 mt-2">
                  {exampleData.evidence}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Cycle Impact on Learning?</h4>
                <p className="text-sm text-gray-600">What impact did this goal have on student learning? How can you build on this?</p>
                <div className="p-3 bg-white rounded-md border border-gray-200 mt-2">
                  {exampleData.cycleImpact}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <h4 className="flex items-center gap-2">
                  <span className="inline-block">🍎</span>
                  <span className="font-medium">Teacher Outcome & Metric:</span>
                </h4>
                <div className="p-3 bg-white rounded-md border border-gray-200 mt-2">
                  {exampleData.finalTeacherOutcome}
                </div>
              </div>
              
              <div>
                <h4 className="flex items-center gap-2">
                  <span className="inline-block">✏️</span>
                  <span className="font-medium">Student Outcome & Metric:</span>
                </h4>
                <div className="p-3 bg-white rounded-md border border-gray-200 mt-2">
                  {exampleData.finalStudentOutcome}
                </div>
              </div>
            </div>
          </div>
        </ActionPlanStage>
      </div>
    </div>
  );
} 