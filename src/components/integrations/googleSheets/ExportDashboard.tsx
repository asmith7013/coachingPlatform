"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/composed/cards/Card";
import { Button } from "@/components/core/Button";
import { Select } from "@/components/core/fields/Select";
import { Badge } from "@/components/core/feedback/Badge";
import { Alert } from "@/components/core/feedback/Alert";
import { useGoogleSheetsExport } from "@/hooks/integrations/google-sheets/useGoogleSheetsExport";
import { ExportConfig } from "@/lib/schema/zod-schema/integrations/google-sheets-export";

// District options with predefined spreadsheet IDs
const districtOptions = [
  { value: "12nRSGcLlo6SMEyYUWPjfMAcEd-ZDdil-zw44tGjpN7E", label: "D9" },
  { value: "1c1B3l_e0z10Z8dnM0VngJ8oEaoxwsq0vMBrkC72P95g", label: "D11" },
  { value: "1ocvb1ak5qk-ktsd35qYMVE0QKgv4w6fUi_hcjRFq_5w", label: "Test" },
];

export function ExportDashboard() {
  const { user } = useUser();
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [dryRun, setDryRun] = useState(false);
  const [syncToMongoDB, setSyncToMongoDB] = useState(false);

  const {
    exportData,
    testConnection,
    isExporting,
    isTesting,
    exportResult,
    error,
    connectionStatus,
    resetState,
  } = useGoogleSheetsExport();

  const handleExport = async () => {
    if (!spreadsheetId || !user?.primaryEmailAddress?.emailAddress) {
      return;
    }

    const config: ExportConfig = {
      spreadsheetId: spreadsheetId,
      userEmail: user.primaryEmailAddress.emailAddress,
      dryRun,
      syncToMongoDB,
    };

    await exportData(config);
  };

  const handleTestConnection = async () => {
    if (!spreadsheetId) {
      return;
    }
    await testConnection(spreadsheetId);
  };

  const handleReset = () => {
    resetState();
    setSpreadsheetId("");
    setDryRun(false);
    setSyncToMongoDB(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold">
            Google Sheets Export Dashboard
          </h3>
          <p className="text-sm text-muted-foreground">
            Export daily data from Google Sheets to combined data sheet with
            duplicate detection
          </p>
        </Card.Header>
        <Card.Body className="space-y-4">
          <div className="space-y-2">
            <Select
              label="District"
              options={districtOptions}
              value={spreadsheetId}
              onChange={setSpreadsheetId}
              placeholder="Select a district"
              disabled={isExporting || isTesting}
            />
            <p className="text-xs text-muted-foreground">
              Select the district to export data from
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="dryRun"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              disabled={isExporting || isTesting}
            />
            <label htmlFor="dryRun" className="text-sm">
              Dry run (test without making changes)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="syncToMongoDB"
              checked={syncToMongoDB}
              onChange={(e) => setSyncToMongoDB(e.target.checked)}
              disabled={isExporting || isTesting}
            />
            <label htmlFor="syncToMongoDB" className="text-sm">
              Sync to MongoDB
            </label>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleTestConnection}
              disabled={!spreadsheetId || isExporting || isTesting}
              appearance="outline"
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              onClick={handleExport}
              disabled={
                !spreadsheetId ||
                !user?.primaryEmailAddress?.emailAddress ||
                isExporting ||
                isTesting
              }
            >
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
            <Button
              onClick={handleReset}
              appearance="outline"
              disabled={isExporting || isTesting}
            >
              Reset
            </Button>
          </div>

          {connectionStatus !== "idle" && (
            <Alert
              intent={connectionStatus === "success" ? "success" : "error"}
            >
              <Alert.Description>
                {connectionStatus === "success"
                  ? "✅ Connection successful! Ready to export data."
                  : "❌ Connection failed. Please check the spreadsheet ID and permissions."}
              </Alert.Description>
            </Alert>
          )}

          {error && (
            <Alert intent="error">
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {exportResult && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold">Export Results</h3>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Total Rows Exported</p>
                <p className="text-2xl font-bold">
                  {exportResult.totalRowsExported}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Sheets Processed</p>
                <p className="text-2xl font-bold">
                  {exportResult.processedSheets.length}
                </p>
              </div>
            </div>

            {exportResult.duplicatesFound && (
              <Alert intent="warning">
                <Alert.Description>
                  ⚠️ Duplicates detected! Email notification sent for manual
                  review.
                </Alert.Description>
              </Alert>
            )}

            {exportResult.syncResult && (
              <Alert
                intent={exportResult.syncResult.success ? "success" : "error"}
              >
                <Alert.Description>
                  {exportResult.syncResult.success
                    ? `✅ MongoDB sync successful! Created ${exportResult.syncResult.dailyEventsCreated || 0} daily events and ${exportResult.syncResult.lessonCompletionsCreated || 0} lesson completions.`
                    : `❌ MongoDB sync failed: ${exportResult.syncResult.error || "Unknown error"}`}
                </Alert.Description>
              </Alert>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">Processed Sheets</h4>
              <div className="space-y-2">
                {exportResult.processedSheets.map((sheet, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="font-medium">{sheet.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge
                        intent={
                          sheet.error
                            ? "danger"
                            : sheet.duplicatesFound
                              ? "warning"
                              : "success"
                        }
                      >
                        {sheet.error
                          ? "Error"
                          : sheet.duplicatesFound
                            ? "Duplicates"
                            : "Success"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {sheet.rowsExported} rows
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {exportResult.duplicateDetails.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Duplicate Details</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {exportResult.duplicateDetails.map(
                    (duplicate, index: number) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded"
                      >
                        <p className="font-medium">
                          Student ID: {duplicate.studentId}
                        </p>
                        <p className="text-muted-foreground">
                          New: {duplicate.new} → Existing: {duplicate.existing}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
