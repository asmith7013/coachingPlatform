"use client";

import React from "react";

interface UrlPreviewProps {
  urls: string[];
}

export function UrlPreview({ urls }: UrlPreviewProps) {
  if (urls.length === 0) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-2">
        Generated URLs ({urls.length})
      </h4>
      <div className="max-h-32 overflow-y-auto">
        {urls.slice(0, 5).map((url, index) => (
          <div key={index} className="text-xs text-blue-700 mb-1">
            {url}
          </div>
        ))}
        {urls.length > 5 && (
          <div className="text-xs text-blue-600">
            ... and {urls.length - 5} more
          </div>
        )}
      </div>
    </div>
  );
}
