"use client";

import { useEffect, useState } from "react";
import { getUserHistory } from "@/app/actions/analytics";
import { Card } from "@/components/ui/card";

interface PageView {
  _id: string;
  page: string;
  fullUrl: string;
  timestamp: string;
  duration?: number;
}

interface UserHistoryProps {
  userId: string;
  limit?: number;
}

export function UserHistory({ userId, limit = 50 }: UserHistoryProps) {
  const [history, setHistory] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const result = await getUserHistory(userId, limit);

        if (result.success && result.data) {
          setHistory(result.data as unknown as PageView[]);
        } else {
          setError(result.error || "Failed to load history");
        }
      } catch (err) {
        setError("Failed to load history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-500">
        No browsing history found
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Browsing History</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((view) => (
          <div key={view._id} className="border-b pb-3 last:border-b-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium">{view.page}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(view.timestamp).toLocaleString()}
                </div>
              </div>
              {view.duration && (
                <div className="text-sm text-gray-600 ml-4">
                  {Math.round(view.duration)}s
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
