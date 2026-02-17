"use client";

import { useState } from "react";
import ipgData from "./ipg.json";
import { TeacherSelector } from "./components/TeacherSelector";
import { CoreActionSection } from "./components/CoreActionSection";

export default function IPGDashboard() {
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const teachers = ipgData.map((observation) => observation.teacherName);
  const selectedObservation = ipgData.find(
    (obs) => obs.teacherName === selectedTeacher,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          IPG Observation Dashboard
        </h1>

        <TeacherSelector
          teachers={teachers}
          selectedTeacher={selectedTeacher}
          onTeacherChange={setSelectedTeacher}
        />

        {selectedObservation && (
          <div>
            {/* Sticky Teacher Header */}
            <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 -mx-4 px-4 py-4 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800">
                {selectedObservation.teacherName}
              </h2>
              <p className="text-gray-600">{selectedObservation.school}</p>
            </div>

            <div className="space-y-8">
              <CoreActionSection
                title="Core Action 1 - Focus, Coherence, and Rigor"
                data={selectedObservation.coreAction1}
                type="coreAction1"
              />

              <CoreActionSection
                title="Core Action 2 - Instructional Practices"
                data={selectedObservation.coreAction2}
                type="coreAction2"
              />

              <CoreActionSection
                title="Core Action 3 - Mathematical Practices"
                data={selectedObservation.coreAction3}
                type="coreAction3"
              />
            </div>
          </div>
        )}

        {!selectedTeacher && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Select a teacher to view their IPG observation data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
