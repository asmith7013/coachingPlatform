"use client";

type ExportPhase =
  | "idle"
  | "analyzing"
  | "optimizing"
  | "uploading"
  | "saving"
  | "complete"
  | "error";

interface SlideStatus {
  status: "pending" | "analyzing" | "optimizing" | "done" | "skipped" | "error";
  wasOptimized?: boolean;
}

interface ExportProgressOverlayProps {
  isVisible: boolean;
  phase: ExportPhase;
  slideStatuses: SlideStatus[];
  elapsedTime: number;
  message: string;
  optimizedCount: number;
}

export function ExportProgressOverlay({
  isVisible,
  phase,
  slideStatuses,
  elapsedTime,
  message,
  optimizedCount,
}: ExportProgressOverlayProps) {
  if (!isVisible) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Phase indicators
  const phases: { key: ExportPhase; label: string }[] = [
    { key: "analyzing", label: "Analyze" },
    { key: "optimizing", label: "Optimize" },
    { key: "uploading", label: "Upload" },
    { key: "saving", label: "Save" },
  ];

  const getPhaseStatus = (phaseKey: ExportPhase) => {
    const phaseOrder = ["analyzing", "optimizing", "uploading", "saving"];
    const currentIdx = phaseOrder.indexOf(phase);
    const phaseIdx = phaseOrder.indexOf(phaseKey);

    if (phase === "complete") return "complete";
    if (phase === "error") return currentIdx >= phaseIdx ? "error" : "complete";
    if (phaseIdx < currentIdx) return "complete";
    if (phaseIdx === currentIdx) return "active";
    return "pending";
  };

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8">
      {/* Phase Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-2">
          {phases.map((p, idx) => {
            const status = getPhaseStatus(p.key);
            return (
              <div key={p.key} className="flex items-center">
                {idx > 0 && (
                  <div
                    className={`h-0.5 w-8 mx-1 ${
                      status === "complete"
                        ? "bg-green-500"
                        : status === "active"
                          ? "bg-yellow-500"
                          : "bg-gray-200"
                    }`}
                  />
                )}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      status === "complete"
                        ? "bg-green-500 text-white"
                        : status === "active"
                          ? "bg-yellow-500 text-white"
                          : status === "error"
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {status === "complete" ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : status === "active" ? (
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : status === "error" ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      status === "active"
                        ? "text-yellow-700 font-medium"
                        : status === "complete"
                          ? "text-green-700"
                          : "text-gray-500"
                    }`}
                  >
                    {p.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Tiles Grid - Only show during analyzing/optimizing phases */}
      {(phase === "analyzing" || phase === "optimizing") &&
        slideStatuses.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6 max-w-sm">
            {slideStatuses.map((slide, idx) => (
              <div
                key={idx}
                className={`
                w-16 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-medium
                transition-all duration-300
                ${
                  slide.status === "done" && slide.wasOptimized
                    ? "bg-green-100 border-green-500 text-green-700"
                    : slide.status === "done" || slide.status === "skipped"
                      ? "bg-gray-100 border-gray-300 text-gray-500"
                      : slide.status === "analyzing"
                        ? "bg-blue-100 border-blue-500 text-blue-700 animate-pulse"
                        : slide.status === "optimizing"
                          ? "bg-yellow-100 border-yellow-500 text-yellow-700 animate-pulse"
                          : slide.status === "error"
                            ? "bg-red-100 border-red-500 text-red-700"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                }
              `}
              >
                {slide.status === "done" && slide.wasOptimized ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : slide.status === "done" || slide.status === "skipped" ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                ) : slide.status === "analyzing" ||
                  slide.status === "optimizing" ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : slide.status === "error" ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01"
                    />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
            ))}
          </div>
        )}

      {/* Upload/Save Progress - Show during those phases */}
      {(phase === "uploading" || phase === "saving") && (
        <div className="mb-6">
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 rounded-full animate-pulse"
              style={{ width: phase === "uploading" ? "60%" : "90%" }}
            />
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className="text-center mb-4">
        <p className="text-gray-700 font-medium">{message}</p>
        {optimizedCount > 0 && phase !== "analyzing" && (
          <p className="text-sm text-green-600 mt-1">
            {optimizedCount} slide{optimizedCount > 1 ? "s" : ""} optimized for
            better quality
          </p>
        )}
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-mono tabular-nums">
          {formatTime(elapsedTime)}
        </span>
      </div>
    </div>
  );
}
