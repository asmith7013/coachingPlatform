'use client'

// import { VisitView } from '@/components/features/visits'
// import type { Visit } from '@zod-schema/visits/visit'

// Mock visit data for demonstration
// const _mockVisit: Visit = {
//   _id: 'demo-visit-1',
//   ownerIds: ['demo-coach-1'],
//   schoolId: 'demo-school-1',
//   date: new Date(),
//   coachId: 'demo-coach-1',
//   gradeLevelsSupported: ['3', '4', '5'],
//   allowedPurpose: 'Classroom Observation',
//   modeDone: 'In-person',
//   events: [],
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString()
// }

export default function VisitViewDemo() {
  return (
    <div className="h-screen bg-gray-50">
      <div className="h-full">
        {/* <VisitView 
          visit={mockVisit}
          className="h-full"
        /> */}
      </div>
    </div>
  )
} 