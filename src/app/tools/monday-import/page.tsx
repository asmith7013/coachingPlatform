// src/app/tools/monday-import/page.tsx
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { MondayWorkspaceExplorer } from '@/components/domain/monday/MondayWorkspaceExplorer';
import { MondayTestPanel } from '@/components/domain/monday/MondayTestPanel';
import { Card } from '@/components/composed/cards/Card';

export default function MondayImportPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Monday.com Import"
        subtitle="Import coaching visits from your Monday.com boards"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-3">
          <MondayTestPanel />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <MondayWorkspaceExplorer />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <Card.Header>Import Help</Card.Header>
            <Card.Body>
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
              
              <h3 className="text-lg font-medium mb-2">After Import</h3>
              <p>
                Review imported visits in the Visits dashboard to ensure all data was imported correctly.
              </p>
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