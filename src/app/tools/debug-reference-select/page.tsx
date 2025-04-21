// 'use client';

// import React, { useState } from 'react';
// import { URLReferenceSelect } from '@/components/core/fields/ReferenceSelect';
// import { URLReferenceSelectTest } from '@/components/core/fields/URLReferenceSelectTest';
// import { URLReferenceSelectFixed } from '@/components/core/fields/URLReferenceSelectFixed';
// import { Card } from '@/components/composed/cards/Card';
// import { Heading } from '@/components/core/typography/Heading';
// import { Text } from '@/components/core/typography/Text';
// import { Button } from '@/components/core/Button';

// export default function DebugReferencePage() {
//   const [schools, setSchools] = useState<string[]>([]);
//   const [staff, setStaff] = useState<string[]>([]);
//   const [renderCount, setRenderCount] = useState(0);
  
//   // Force re-render the page
//   const forceUpdate = () => {
//     setRenderCount(prev => prev + 1);
//   };

//   // Clear all selections
//   const clearSelections = () => {
//     setSchools([]);
//     setStaff([]);
//   };
  
//   // Log current state
//   const logState = () => {
//     console.log('Current state:', {
//       schools,
//       staff,
//       renderCount
//     });
//   };

//   // Type-safe handlers for onChange events
//   const handleSchoolsChange = (value: string | string[]) => {
//     if (typeof value === 'string') {
//       setSchools([value]);
//     } else {
//       setSchools(value);
//     }
//   };

//   const handleStaffChange = (value: string | string[]) => {
//     if (typeof value === 'string') {
//       setStaff([value]);
//     } else {
//       setStaff(value);
//     }
//   };

//   return (
//     <div className="p-8">
//       <Heading level="h1" className="mb-6">Reference Select Debugging</Heading>
//       <Text className="mb-8">
//         This page allows you to test and debug render issues with reference selects.
//         Open your browser console to see detailed debug information.
//       </Text>
      
//       <div className="flex space-x-4 mb-8">
//         <Button onClick={forceUpdate}>Force Re-render ({renderCount})</Button>
//         <Button onClick={clearSelections}>Clear Selections</Button>
//         <Button onClick={logState}>Log Current State</Button>
//       </div>
      
//       <div className="grid grid-cols-3 gap-6">
//         <Card className="p-4">
//           <Heading level="h2" className="mb-4">Original Reference Select</Heading>
//           <div className="space-y-6">
//             <URLReferenceSelect
//               label="Schools"
//               url="/api/schools"
//               value={schools}
//               onChange={handleSchoolsChange}
//               multiple={true}
//             />
            
//             <URLReferenceSelect
//               label="Staff"
//               url="/api/staff"
//               value={staff}
//               onChange={handleStaffChange}
//               multiple={true}
//             />
//           </div>
//         </Card>
        
//         <Card className="p-4">
//           <Heading level="h2" className="mb-4">Test Version (No State Updates)</Heading>
//           <div className="space-y-6">
//             <URLReferenceSelectTest
//               label="Schools"
//               url="/api/schools"
//               value={schools}
//               onChange={handleSchoolsChange}
//               multiple={true}
//             />
            
//             <URLReferenceSelectTest
//               label="Staff"
//               url="/api/staff"
//               value={staff}
//               onChange={handleStaffChange}
//               multiple={true}
//             />
//           </div>
//         </Card>
        
//         <Card className="p-4">
//           <Heading level="h2" className="mb-4">Fixed Version</Heading>
//           <div className="space-y-6">
//             <URLReferenceSelectFixed
//               label="Schools"
//               url="/api/schools"
//               value={schools}
//               onChange={handleSchoolsChange}
//               multiple={true}
//             />
            
//             <URLReferenceSelectFixed
//               label="Staff"
//               url="/api/staff"
//               value={staff}
//               onChange={handleStaffChange}
//               multiple={true}
//             />
//           </div>
//         </Card>
//       </div>
      
//       <div className="mt-8">
//         <Card className="p-4">
//           <Heading level="h3" className="mb-4">Debug Information</Heading>
//           <Text className="mb-2">Render Count: {renderCount}</Text>
//           <Text className="mb-2">Selected Schools: {schools.length}</Text>
//           <Text className="mb-2">Selected Staff: {staff.length}</Text>
//           <pre className="text-xs p-4 bg-gray-100 rounded overflow-auto">
//             {JSON.stringify({ schools, staff }, null, 2)}
//           </pre>
//         </Card>
//       </div>
//     </div>
//   );
// } 