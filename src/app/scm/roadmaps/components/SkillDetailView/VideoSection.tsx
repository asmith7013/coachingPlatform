"use client";

interface VideoSectionProps {
  videoUrl: string;
  skillNumber: string;
}

export function VideoSection({ videoUrl, skillNumber }: VideoSectionProps) {
  if (!videoUrl || videoUrl.trim() === "") return null;

  return (
    <div className="border-b border-gray-200 py-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Worked Example Video
      </h4>
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        <video
          key={skillNumber}
          controls
          className="w-full"
          preload="metadata"
          style={{ aspectRatio: "16/9" }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
