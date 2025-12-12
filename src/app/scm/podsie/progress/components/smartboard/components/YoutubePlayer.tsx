"use client";

import { useState, useMemo } from "react";
import { PlayIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface YoutubePlayerProps {
  url: string;
  title?: string;
  isFullscreen?: boolean;
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com, youtu.be, youtubeeducation.com
 */
function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    // Standard YouTube and YouTube Education watch URLs
    /(?:youtube\.com|youtubeeducation\.com)\/watch\?v=([^&\n?#]+)/,
    // Short URLs (youtu.be)
    /youtu\.be\/([^&\n?#]+)/,
    // Embed URLs
    /(?:youtube\.com|youtubeeducation\.com)\/embed\/([^&\n?#]+)/,
    // Legacy v/ URLs
    /(?:youtube\.com|youtubeeducation\.com)\/v\/([^&\n?#]+)/,
    // Shorts URLs
    /(?:youtube\.com|youtubeeducation\.com)\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function YoutubePlayer({ url, title, isFullscreen = false }: YoutubePlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const videoId = useMemo(() => extractYoutubeVideoId(url), [url]);

  if (!videoId) {
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  // Collapsed state - just show play button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`
          flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white rounded
          shadow-lg transition-all cursor-pointer
          ${isFullscreen ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs"}
        `}
        title={title || "Play Video"}
      >
        <PlayIcon className={isFullscreen ? "h-4 w-4" : "h-3 w-3"} />
        <span className="font-medium">{title || "Video"}</span>
      </button>
    );
  }

  // Expanded state - show embedded player
  return (
    <div
      className={`
        bg-black rounded shadow-2xl overflow-hidden
        ${isFullscreen ? "w-[320px] h-[200px]" : "w-[240px] h-[150px]"}
      `}
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between bg-gray-900 px-2 py-1">
        <span className="text-white text-[10px] font-medium truncate flex-1 mr-2">
          {title || "Video"}
        </span>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Close video"
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      </div>

      {/* Embedded player */}
      <iframe
        src={embedUrl}
        title={title || "YouTube video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-[calc(100%-24px)]"
      />
    </div>
  );
}
