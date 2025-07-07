'use client';

import { useState } from 'react';

export default function TestSyncPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const triggerSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/313/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: 'Full Data!A:Z',
          force: true
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
        console.log('error', error);
    //   setResult({ error: (error as Error || null).message });
    }
    setLoading(false);
  };
  
  const checkStatus = async () => {
    try {
      const response = await fetch('/api/lesson-tracking/sync');
      const data = await response.json();
      setResult(data);
    } catch (error) {
        console.log('error', error);
    //   setResult({ error: (error as Error).message });
    }
  };
  
  return (
    <div className="p-8">
      <h1>Sync Test Page</h1>
      <div className="space-x-4 mb-4">
        <button 
          onClick={triggerSync} 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Syncing...' : 'Trigger Sync'}
        </button>
        <button 
          onClick={checkStatus}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Check Status
        </button>
      </div>
      {result && (
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}