'use client';

import { ExportDashboard } from '@/components/integrations/googleSheets/ExportDashboard';
import { Card } from '@/components/composed/cards/Card';

export default function GoogleSheetsExportPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <Card.Header>
          <h1 className="text-2xl font-bold">Google Sheets Export System</h1>
          <p className="text-muted-foreground">
            Export and reset daily data from Google Sheets with duplicate detection and email notifications.
          </p>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">How it works:</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Finds all sheets starting with &quot;Daily - &quot; prefix</li>
              <li>Exports data from rows B3:K50 to &quot;Combined Data&quot; sheet</li>
              <li>Detects duplicates based on student ID and name matching</li>
              <li>Logs all activity to &quot;Full Export Log&quot; sheet</li>
              <li>Sends email alerts if duplicates are found</li>
              <li>Supports dry run mode for testing</li>
            </ul>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-semibold text-yellow-800">Required Environment Variables:</h3>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li><code>GOOGLE_CLIENT_EMAIL</code> - Service account email</li>
                <li><code>GOOGLE_PRIVATE_KEY</code> - Service account private key</li>
                <li><code>EMAIL_USER</code> - Gmail address for sending alerts</li>
                <li><code>EMAIL_PASSWORD</code> - Gmail app password</li>
                <li><code>ALERT_EMAIL</code> - Email to receive duplicate alerts</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>

      <ExportDashboard />
    </div>
  );
} 