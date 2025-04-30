// src/app/tools/monday-import/page.tsx
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
// import { MondayWorkspaceExplorer } from '@/components/domain/monday/MondayWorkspaceExplorer';
import { MondayBoardFinder } from '@/components/domain/monday/MondayBoardFinder';
// import { MondayTestPanel } from '@/components/domain/monday/MondayTestPanel';
import { MondayDebugPanel } from '@/components/domain/monday/MondayDebugPanel';
import { Card } from '@/components/composed/cards/Card';

export default function MondayImportPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Monday.com Integration"
        subtitle="Configure and test your Monday.com integration"
      />
      
      {/* Debug Panel */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <MondayDebugPanel />
      </div>
      
      {/* Board Finder Component */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <MondayBoardFinder />
      </div>
      
      {/* <div className="grid grid-cols-1 gap-6 mb-8">
        <MondayWorkspaceExplorer />
      </div> */}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <Card.Header>Monday.com Integration Help</Card.Header>
            <Card.Body>
              <h3 className="text-lg font-medium mb-2">Using the Debug Tool</h3>
              <p className="mb-4">
                If you&apos;re experiencing issues with your Monday.com integration, use the diagnostic tool
                at the top of this page to identify the root cause. The tool runs a series of 
                increasingly complex tests to pinpoint exactly where the integration is failing.
              </p>
              
              <h3 className="text-lg font-medium mb-2">Common Issues</h3>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>
                  <strong>API Token Permissions</strong>: Monday.com API tokens need specific permissions
                  to access boards and items.
                </li>
                <li>
                  <strong>Board Access</strong>: Ensure you have access to the specified board.
                </li>
                <li>
                  <strong>Rate Limits</strong>: Monday.com API has rate limits that may affect
                  requests with large data volumes.
                </li>
                <li>
                  <strong>Query Structure</strong>: Complex queries may be rejected if they don&apos;t
                  adhere to Monday.com&apos;s GraphQL schema.
                </li>
              </ul>
              
              <h3 className="text-lg font-medium mb-2">Before You Import</h3>
              <p className="mb-4">
                Ensure your Monday.com board columns are properly mapped to coaching visit fields.
              </p>
              
              <h3 className="text-lg font-medium mb-2">Import Options</h3>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>
                  <strong>Update existing visits:</strong> If enabled, existing visits with the same Monday.com ID will be updated.
                </li>
                <li>
                  <strong>Import attachments:</strong> Download and import file attachments from Monday.com.
                </li>
              </ul>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 'use client';

// // src/app/admin/monday-import/page.tsx
// import { PageHeader } from '@components/shared/PageHeader';
// import { MondayImportPanel } from '@components/domain/monday/MondayImportPanel';
// import { Card } from '@components/composed/cards/Card';

// export default function MondayImportPage() {
//   return (
//     <div className="container mx-auto py-8">
//       <PageHeader
//         title="Monday.com Import"
//         subtitle="Import coaching visits and related data from your Monday.com boards"
//       />
      
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2">
//           <MondayImportPanel />
//         </div>
        
//         <div className="lg:col-span-1">
//           <Card>
//             <Card.Header>Import Help</Card.Header>
//             <Card.Body>
//               <h3 className="text-lg font-medium mb-2">Before You Import</h3>
//               <p className="mb-4">
//                 Ensure your Monday.com board columns are properly mapped to coaching visit fields.
//               </p>
              
//               <h3 className="text-lg font-medium mb-2">Import Options</h3>
//               <ul className="list-disc pl-5 mb-4 space-y-1">
//                 <li>
//                   <strong>Overwrite existing items:</strong> If enabled, existing visits with the same Monday.com ID will be updated.
//                 </li>
//                 <li>
//                   <strong>Import attachments:</strong> Download and import file attachments from Monday.com.
//                 </li>
//               </ul>
              
//               <h3 className="text-lg font-medium mb-2">After Import</h3>
//               <p>
//                 Review imported visits in the Visits dashboard to ensure all data was imported correctly.
//               </p>
//             </Card.Body>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }