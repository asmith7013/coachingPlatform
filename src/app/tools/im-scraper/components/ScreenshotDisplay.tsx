"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  copyImageWithFallback,
  isClipboardImageSupported,
} from "../lib/image-clipboard";

interface Screenshot {
  filename: string;
  type: "task" | "response" | "image" | "full";
  markdownReference: string;
}

interface ScreenshotDisplayProps {
  screenshots: Screenshot[];
  lessonId: string;
}

export function ScreenshotDisplay({
  screenshots,
  lessonId: _lessonId,
}: ScreenshotDisplayProps) {
  const [copiedImage, setCopiedImage] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const handleCopyImage = async (filename: string) => {
    setCopyError(null);

    const imageUrl = `/screenshots/${filename}`;
    const result = await copyImageWithFallback(imageUrl);

    if (result.success) {
      setCopiedImage(filename);
      setTimeout(() => setCopiedImage(null), 2000);
    } else {
      setCopyError(result.error || "Failed to copy image");
      setTimeout(() => setCopyError(null), 3000);
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "task":
        return "Task";
      case "response":
        return "Response";
      case "image":
        return "Image";
      case "full":
        return "Full";
      default:
        return "Screenshot";
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-800";
      case "response":
        return "bg-green-100 text-green-800";
      case "image":
        return "bg-purple-100 text-purple-800";
      case "full":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (screenshots.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No screenshots available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Copy error notification */}
      {copyError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {copyError}
        </div>
      )}

      {/* Clipboard support warning */}
      {!isClipboardImageSupported() && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded text-sm">
          Image clipboard not supported in this browser. Images will open in new
          tab for manual copy.
        </div>
      )}

      {/* Screenshot grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {screenshots.map((screenshot) => (
          <div
            key={screenshot.filename}
            className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Image thumbnail */}
            <div className="aspect-video relative">
              <Image
                src={`/screenshots/${screenshot.filename}`}
                alt={`${getTypeLabel(screenshot.type)} screenshot`}
                className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setExpandedImage(screenshot.filename)}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Hover overlay with buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyImage(screenshot.filename);
                    }}
                    className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                      copiedImage === screenshot.filename
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    title="Copy image to clipboard"
                    disabled={copiedImage === screenshot.filename}
                  >
                    {copiedImage === screenshot.filename
                      ? "✓ Copied!"
                      : "📋 Copy"}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedImage(screenshot.filename);
                    }}
                    className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 font-medium transition-colors"
                    title="Expand image"
                  >
                    🔍 View
                  </button>
                </div>
              </div>
            </div>

            {/* Screenshot info */}
            <div className="p-2">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTypeColor(screenshot.type)}`}
                >
                  {getTypeLabel(screenshot.type)}
                </span>

                <button
                  onClick={() => handleCopyImage(screenshot.filename)}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedImage === screenshot.filename ? "✓" : "📋"}
                </button>
              </div>

              <p
                className="text-xs text-gray-500 mt-1 truncate"
                title={screenshot.filename}
              >
                {screenshot.filename}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded image modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            {/* Modal controls */}
            <div className="absolute top-4 right-4 space-x-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyImage(expandedImage);
                }}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  copiedImage === expandedImage
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {copiedImage === expandedImage
                  ? "✓ Copied to Clipboard!"
                  : "📋 Copy to Clipboard"}
              </button>

              <button
                onClick={() => setExpandedImage(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Expanded image */}
            <Image
              src={`/screenshots/${expandedImage}`}
              alt="Expanded screenshot"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              width={1200}
              height={800}
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />

            {/* Image info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded">
              <p className="text-sm font-medium">{expandedImage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
