"use client";

import React, { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type PercentCrop,
  type PixelCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/core/Button";
import { Alert } from "@/components/core/feedback/Alert";
import {
  getExamTitlesForGrade,
  getQuestionsForExam,
  saveCroppedScreenshot,
} from "@/app/tools/state-test-scraper/actions/crop-actions";
import type { StateTestQuestion } from "@/app/tools/state-test-scraper/lib/types";

const GRADES = ["6", "7", "8", "alg1"] as const;

interface CropState {
  [questionId: string]: PercentCrop;
}

export default function ScreenshotCropperPage() {
  const [grade, setGrade] = useState<string>("");
  const [examTitles, setExamTitles] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [questions, setQuestions] = useState<StateTestQuestion[]>([]);
  const [crops, setCrops] = useState<CropState>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const imageRefs = useRef<Record<string, HTMLImageElement | null>>({});

  const handleGradeChange = async (newGrade: string) => {
    setGrade(newGrade);
    setSelectedExam("");
    setQuestions([]);
    setCrops({});
    setExamTitles([]);
    setError(null);
    setSuccessMsg(null);

    if (!newGrade) return;

    setLoading(true);
    const result = await getExamTitlesForGrade(newGrade);
    setLoading(false);

    if (result.success && result.examTitles) {
      setExamTitles(result.examTitles);
    } else {
      setError(result.error || "Failed to load exam titles");
    }
  };

  const handleLoadExam = async () => {
    if (!grade || !selectedExam) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setCrops({});

    const result = await getQuestionsForExam(grade, selectedExam);
    setLoading(false);

    if (result.success && result.questions) {
      setQuestions(result.questions);
    } else {
      setError(result.error || "Failed to load questions");
    }
  };

  const modifiedCount = Object.keys(crops).length;

  const handleCropChange = useCallback(
    (questionId: string, crop: PercentCrop) => {
      setCrops((prev) => ({ ...prev, [questionId]: crop }));
    },
    [],
  );

  const handleResetCrop = useCallback((questionId: string) => {
    setCrops((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const updateQuestionUrl = useCallback(
    (questionId: string, newUrl: string) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.questionId === questionId ? { ...q, screenshotUrl: newUrl } : q,
        ),
      );
    },
    [],
  );

  const handleUpload = useCallback(
    async (questionId: string, file: File) => {
      const question = questions.find((q) => q.questionId === questionId);
      if (!question) return;

      setUploadingIds((prev) => new Set(prev).add(questionId));
      setError(null);

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const result = await saveCroppedScreenshot(
          questionId,
          base64,
          grade,
          question.examYear,
        );

        if (result.success && result.newUrl) {
          updateQuestionUrl(questionId, result.newUrl);
          // Clear any existing crop for this question
          setCrops((prev) => {
            const next = { ...prev };
            delete next[questionId];
            return next;
          });
        } else {
          setError(
            `Upload failed for Q${questionId}: ${result.error || "unknown error"}`,
          );
        }
      } catch (err) {
        setError(
          `Upload failed for Q${questionId}: ${err instanceof Error ? err.message : "unknown error"}`,
        );
      } finally {
        setUploadingIds((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      }
    },
    [questions, grade, updateQuestionUrl],
  );

  const handleSaveAll = async () => {
    const modifiedIds = Object.keys(crops);
    if (modifiedIds.length === 0) return;

    setSaving(true);
    setSaveProgress({ current: 0, total: modifiedIds.length });
    setError(null);
    setSuccessMsg(null);

    // Snapshot all image data BEFORE the save loop starts.
    // React re-renders from state updates mid-loop can invalidate refs,
    // so we capture everything we need upfront.
    const snapshots: Array<{
      questionId: string;
      crop: PercentCrop;
      base64: string;
      examYear: string;
    }> = [];
    const prepErrors: string[] = [];

    for (const questionId of modifiedIds) {
      const crop = crops[questionId];
      const imgEl = imageRefs.current[questionId];

      if (!imgEl) {
        console.warn(`[crop] No image ref for ${questionId}`);
        prepErrors.push(`${questionId}: image not loaded`);
        continue;
      }
      if (!crop) {
        console.warn(`[crop] No crop data for ${questionId}`);
        continue;
      }

      console.log(
        `[crop] Snapshotting ${questionId}: naturalSize=${imgEl.naturalWidth}x${imgEl.naturalHeight}, crop=`,
        crop,
      );

      const pixelCrop = convertToPixelCrop(
        crop,
        imgEl.naturalWidth,
        imgEl.naturalHeight,
      );

      if (pixelCrop.width === 0 || pixelCrop.height === 0) {
        prepErrors.push(
          `${questionId}: crop has zero dimensions (${pixelCrop.width}x${pixelCrop.height})`,
        );
        continue;
      }

      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        prepErrors.push(`${questionId}: failed to get canvas context`);
        continue;
      }

      try {
        ctx.drawImage(
          imgEl,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height,
        );
      } catch (drawErr) {
        console.error(`[crop] drawImage failed for ${questionId}:`, drawErr);
        prepErrors.push(
          `${questionId}: canvas draw failed — ${drawErr instanceof Error ? drawErr.message : "CORS or tainted canvas"}`,
        );
        continue;
      }

      let base64: string;
      try {
        const dataUrl = canvas.toDataURL("image/png");
        base64 = dataUrl.split(",")[1];
        console.log(`[crop] Base64 for ${questionId}: ${base64.length} chars`);
      } catch (exportErr) {
        console.error(`[crop] toDataURL failed for ${questionId}:`, exportErr);
        prepErrors.push(
          `${questionId}: canvas export failed — ${exportErr instanceof Error ? exportErr.message : "tainted canvas (CORS)"}`,
        );
        continue;
      }

      const question = questions.find((q) => q.questionId === questionId);
      if (!question) {
        prepErrors.push(`${questionId}: question not found in local state`);
        continue;
      }

      snapshots.push({ questionId, crop, base64, examYear: question.examYear });
    }

    // Now save all snapshots — no more reading from refs or state
    let savedCount = 0;
    const saveErrors: string[] = [];
    const savedUrls: Array<{ questionId: string; newUrl: string }> = [];

    setSaveProgress({ current: 0, total: snapshots.length });

    for (const snapshot of snapshots) {
      try {
        console.log(
          `[crop] Saving ${snapshot.questionId}, grade=${grade}, examYear=${snapshot.examYear}`,
        );
        const result = await saveCroppedScreenshot(
          snapshot.questionId,
          snapshot.base64,
          grade,
          snapshot.examYear,
        );
        console.log(`[crop] Save result for ${snapshot.questionId}:`, result);

        if (result.success && result.newUrl) {
          savedUrls.push({
            questionId: snapshot.questionId,
            newUrl: result.newUrl,
          });
          savedCount++;
        } else {
          saveErrors.push(
            `${snapshot.questionId}: ${result.error || "server returned no error message"}`,
          );
        }
      } catch (saveErr) {
        console.error(
          `[crop] Server action threw for ${snapshot.questionId}:`,
          saveErr,
        );
        saveErrors.push(
          `${snapshot.questionId}: ${saveErr instanceof Error ? saveErr.message : "server action failed"}`,
        );
      }

      setSaveProgress((prev) => ({ ...prev, current: prev.current + 1 }));
    }

    // Batch-update all URLs at once after all saves are done
    if (savedUrls.length > 0) {
      setQuestions((prev) =>
        prev.map((q) => {
          const saved = savedUrls.find((s) => s.questionId === q.questionId);
          return saved ? { ...q, screenshotUrl: saved.newUrl } : q;
        }),
      );
    }

    setCrops({});
    setSaving(false);

    const allErrors = [...prepErrors, ...saveErrors];
    const totalAttempted = modifiedIds.length;
    if (allErrors.length > 0) {
      setError(
        `Saved ${savedCount}/${totalAttempted}. Errors:\n${allErrors.join("\n")}`,
      );
    } else {
      setSuccessMsg(
        `Saved ${savedCount} cropped image${savedCount !== 1 ? "s" : ""}`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Screenshot Cropper</h1>

        {/* Exam Picker */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <select
                className="border rounded px-3 py-2 min-w-[120px]"
                value={grade}
                onChange={(e) => handleGradeChange(e.target.value)}
                disabled={loading || saving}
              >
                <option value="">Select...</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g === "alg1" ? "Algebra 1" : `Grade ${g}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam
              </label>
              <select
                className="border rounded px-3 py-2 min-w-[200px]"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                disabled={
                  !grade || examTitles.length === 0 || loading || saving
                }
              >
                <option value="">Select...</option>
                {examTitles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleLoadExam}
              disabled={!grade || !selectedExam || loading || saving}
            >
              {loading ? "Loading..." : "Load Questions"}
            </Button>
          </div>
        </div>

        {error && (
          <Alert intent="error" className="mb-4">
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </Alert>
        )}

        {successMsg && (
          <Alert intent="success" className="mb-4">
            {successMsg}
          </Alert>
        )}

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.questionId}
                question={q}
                index={idx}
                crop={crops[q.questionId]}
                onCropChange={handleCropChange}
                onResetCrop={handleResetCrop}
                onUpload={handleUpload}
                imageRefs={imageRefs}
                disabled={saving}
                uploading={uploadingIds.has(q.questionId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky Save Bar */}
      {questions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-6 py-3 z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {questions.length} questions loaded
              {modifiedCount > 0 && (
                <span className="ml-2 font-medium text-blue-600">
                  &middot; {modifiedCount} cropped
                </span>
              )}
              <span className="ml-2 text-gray-400">
                &middot; {selectedExam} &middot; Grade{" "}
                {grade === "alg1" ? "Alg1" : grade}
              </span>
            </span>
            <div className="flex items-center gap-3">
              {saving && (
                <span className="text-sm text-gray-500">
                  Saving {saveProgress.current}/{saveProgress.total}...
                </span>
              )}
              <Button
                onClick={handleSaveAll}
                disabled={modifiedCount === 0 || saving}
              >
                {saving ? "Saving..." : `Save All (${modifiedCount})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface QuestionCardProps {
  question: StateTestQuestion;
  index: number;
  crop: PercentCrop | undefined;
  onCropChange: (questionId: string, crop: PercentCrop) => void;
  onResetCrop: (questionId: string) => void;
  onUpload: (questionId: string, file: File) => void;
  imageRefs: React.MutableRefObject<Record<string, HTMLImageElement | null>>;
  disabled: boolean;
  uploading: boolean;
}

function QuestionCard({
  question,
  index,
  crop,
  onCropChange,
  onResetCrop,
  onUpload,
  imageRefs,
  disabled,
  uploading,
}: QuestionCardProps) {
  const hasCrop = !!crop;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(question.questionId, file);
      // Reset input so same file can be re-selected
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">Q{index + 1}</span>
          {question.standard && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
              {question.standard}
            </span>
          )}
          {question.questionType && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
              {question.questionType}
            </span>
          )}
          <span className="text-xs text-gray-400">{question.questionId}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
            disabled={disabled || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {hasCrop && (
            <button
              onClick={() => onResetCrop(question.questionId)}
              className="text-xs text-red-500 hover:text-red-700"
              disabled={disabled}
            >
              Reset crop
            </button>
          )}
        </div>
      </div>

      <div className="border-2 border-red-300 rounded inline-block">
        <ReactCrop
          crop={crop}
          onChange={(_: PixelCrop, percentCrop: PercentCrop) =>
            onCropChange(question.questionId, percentCrop)
          }
          disabled={disabled || uploading}
        >
          <img
            ref={(el) => {
              imageRefs.current[question.questionId] = el;
            }}
            src={question.screenshotUrl}
            alt={`Question ${index + 1}`}
            crossOrigin="anonymous"
            loading="lazy"
            className="max-w-full"
          />
        </ReactCrop>
      </div>
    </div>
  );
}
