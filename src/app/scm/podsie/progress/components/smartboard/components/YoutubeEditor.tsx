"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import type { YoutubeLink } from "@zod-schema/scm/podsie/section-config";

interface YoutubeEditorProps {
  youtubeLinks: YoutubeLink[];
  activeYoutubeUrl?: string;
  sections: Array<{ school: string; classSection: string }>;
  currentSection: string;
  onSelectVideo: (url: string | null) => void;
  onAddLink: (link: YoutubeLink) => void;
  onRemoveLink: (url: string) => void;
  onCopyFromSection: (sourceSchool: string, sourceClassSection: string) => void;
  isFullscreen?: boolean;
}

export function YoutubeEditor({
  youtubeLinks,
  activeYoutubeUrl,
  sections,
  currentSection,
  onSelectVideo,
  onAddLink,
  onRemoveLink,
  onCopyFromSection,
  isFullscreen = false,
}: YoutubeEditorProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out current section from copy options
  const otherSections = sections.filter(s => s.classSection !== currentSection);

  const handleAddLink = () => {
    if (!newUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }
    if (!newTitle.trim()) {
      setError("Please enter a title for the video");
      return;
    }

    // Basic YouTube URL validation (supports youtube.com, youtu.be, youtubeeducation.com)
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtubeeducation\.com)\/.+/;
    if (!youtubePattern.test(newUrl)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    onAddLink({ url: newUrl.trim(), title: newTitle.trim() });
    setNewUrl("");
    setNewTitle("");
    setIsAddingNew(false);
    setError(null);
  };

  const handleCopyFromSection = (section: { school: string; classSection: string }) => {
    onCopyFromSection(section.school, section.classSection);
    setShowCopyModal(false);
  };

  const textSize = isFullscreen ? "text-base" : "text-sm";
  const inputPadding = isFullscreen ? "px-4 py-2.5" : "px-3 py-2";

  return (
    <div className="space-y-3">
      {/* Video Selection Dropdown */}
      <div>
        <label className={`block ${textSize} font-medium text-indigo-200 mb-1`}>
          Video
        </label>
        <select
          value={activeYoutubeUrl || ""}
          onChange={(e) => onSelectVideo(e.target.value || null)}
          className={`
            w-full ${inputPadding} ${textSize} bg-indigo-900/50 border border-indigo-600
            rounded-lg text-white cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          `}
        >
          <option value="">No video selected</option>
          {youtubeLinks.map((link) => (
            <option key={link.url} value={link.url}>
              {link.title}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsAddingNew(true)}
          className={`
            flex items-center gap-1.5 ${inputPadding} ${textSize}
            bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg
            transition-colors cursor-pointer
          `}
        >
          <PlusIcon className="h-4 w-4" />
          Add New
        </button>

        {otherSections.length > 0 && (
          <button
            onClick={() => setShowCopyModal(true)}
            className={`
              flex items-center gap-1.5 ${inputPadding} ${textSize}
              bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg
              transition-colors cursor-pointer
            `}
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
            Copy from Section
          </button>
        )}
      </div>

      {/* Add New Link Form */}
      {isAddingNew && (
        <div className="bg-indigo-900/50 rounded-lg p-3 space-y-2">
          <input
            type="text"
            placeholder="YouTube URL"
            value={newUrl}
            onChange={(e) => {
              setNewUrl(e.target.value);
              setError(null);
            }}
            className={`
              w-full ${inputPadding} ${textSize} bg-indigo-800 border border-indigo-600
              rounded-lg text-white placeholder-indigo-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            `}
          />
          <input
            type="text"
            placeholder="Video title"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              setError(null);
            }}
            className={`
              w-full ${inputPadding} ${textSize} bg-indigo-800 border border-indigo-600
              rounded-lg text-white placeholder-indigo-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            `}
          />
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAddLink}
              className={`
                ${inputPadding} ${textSize} bg-green-600 hover:bg-green-500
                text-white rounded-lg transition-colors cursor-pointer
              `}
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setNewUrl("");
                setNewTitle("");
                setError(null);
              }}
              className={`
                ${inputPadding} ${textSize} bg-gray-600 hover:bg-gray-500
                text-white rounded-lg transition-colors cursor-pointer
              `}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Current Links List (for deletion) */}
      {youtubeLinks.length > 0 && (
        <div className="space-y-1">
          <label className={`block ${textSize} font-medium text-indigo-200`}>
            Saved Videos
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {youtubeLinks.map((link) => (
              <div
                key={link.url}
                className={`
                  flex items-center justify-between ${textSize}
                  bg-indigo-900/30 rounded px-2 py-1.5
                `}
              >
                <span className="text-indigo-200 truncate flex-1 mr-2">
                  {link.title}
                </span>
                <button
                  onClick={() => onRemoveLink(link.url)}
                  className="text-red-400 hover:text-red-300 cursor-pointer p-1"
                  title="Remove video"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copy from Section Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-indigo-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              Copy Videos from Section
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {otherSections.map((section) => (
                <button
                  key={`${section.school}-${section.classSection}`}
                  onClick={() => handleCopyFromSection(section)}
                  className="
                    w-full text-left px-4 py-3 bg-indigo-800 hover:bg-indigo-700
                    rounded-lg text-white transition-colors cursor-pointer
                  "
                >
                  {section.classSection} ({section.school})
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCopyModal(false)}
              className="
                mt-4 w-full px-4 py-2 bg-gray-600 hover:bg-gray-500
                text-white rounded-lg transition-colors cursor-pointer
              "
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
