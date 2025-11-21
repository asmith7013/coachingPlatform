"use client";

import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { uploadGifToBlob } from "./actions/upload-gif";

export default function GifConverterPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [gifUrl, setGifUrl] = useState<string>("");
  const [uploadedGifUrl, setUploadedGifUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [gifData, setGifData] = useState<Uint8Array | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setGifUrl("");
      setCropArea({ x: 0, y: 0, width: 0, height: 0 });
      setIsCropping(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setTrimRange([0, videoDuration]);
    }
  };

  const handleTrimChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setTrimRange(value as [number, number]);
      if (videoRef.current) {
        videoRef.current.currentTime = value[0];
      }
    }
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current && ffmpegRef.current.loaded) {
      return ffmpegRef.current;
    }

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on("log", ({ message }) => {
      setProgress(message);
    });

    ffmpeg.on("progress", ({ progress: p }) => {
      const percent = Math.round(p * 100);
      setProgressPercent(percent);
      setProgress(`Converting: ${percent}%`);
    });

    // Use CDN URLs directly without converting to blob URLs
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });

    return ffmpeg;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !videoContainerRef.current) return;

    const rect = videoContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !cropStart || !videoContainerRef.current) return;

    const rect = videoContainerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setCropArea({
      x: Math.min(cropStart.x, currentX),
      y: Math.min(cropStart.y, currentY),
      width: Math.abs(currentX - cropStart.x),
      height: Math.abs(currentY - cropStart.y),
    });
  };

  const handleMouseUp = () => {
    if (isCropping) {
      setCropStart(null);
    }
  };

  const convertToGif = async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    setProgress("Loading FFmpeg...");
    setProgressPercent(0);

    try {
      const ffmpeg = await loadFFmpeg();

      // Clean up any existing files from previous conversions
      try {
        await ffmpeg.deleteFile("input.mp4");
      } catch {
        // File doesn't exist, that's fine
      }
      try {
        await ffmpeg.deleteFile("output.gif");
      } catch {
        // File doesn't exist, that's fine
      }

      setProgress("Reading video file...");
      // Read the file as ArrayBuffer first, then convert to Uint8Array
      const arrayBuffer = await videoFile.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      setProgress("Writing video file to FFmpeg...");
      await ffmpeg.writeFile("input.mp4", fileData);

      const [startTime, endTime] = trimRange;
      const duration = endTime - startTime;

      let filterComplex = `fps=10,scale=1080:-1:flags=lanczos`;

      // Add crop filter if crop area is defined
      if (cropArea.width > 0 && cropArea.height > 0 && videoRef.current) {
        const video = videoRef.current;
        const container = videoContainerRef.current;

        if (container) {
          const scaleX = video.videoWidth / container.clientWidth;
          const scaleY = video.videoHeight / container.clientHeight;

          const cropX = Math.floor(cropArea.x * scaleX);
          const cropY = Math.floor(cropArea.y * scaleY);
          const cropW = Math.floor(cropArea.width * scaleX);
          const cropH = Math.floor(cropArea.height * scaleY);

          filterComplex = `crop=${cropW}:${cropH}:${cropX}:${cropY},${filterComplex}`;
        }
      }

      filterComplex += `,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;

      setProgress("Converting to GIF...");
      await ffmpeg.exec([
        "-i", "input.mp4",
        "-ss", startTime.toString(),
        "-t", duration.toString(),
        "-filter_complex", filterComplex,
        "output.gif"
      ]);

      setProgress("Reading output...");
      const data = await ffmpeg.readFile("output.gif");
      // FFmpeg returns Uint8Array or FileData which is Uint8Array
      const gifDataArray = data as Uint8Array;
      setGifData(gifDataArray);

      const blob = new Blob([gifDataArray], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      setGifUrl(url);
      setUploadedGifUrl(""); // Reset uploaded URL on new conversion
      setProgress("Conversion complete!");
    } catch (error) {
      console.error("Error converting to GIF:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      setProgress(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadGif = async () => {
    if (!gifData) return;

    setIsUploading(true);
    try {
      const filename = videoFile?.name.replace(/\.[^/.]+$/, "") || "converted";
      const result = await uploadGifToBlob(gifData, filename);

      if (result.success && result.url) {
        setUploadedGifUrl(result.url);
        setProgress(`Upload complete! URL: ${result.url}`);
      } else {
        setProgress(`Upload failed: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error uploading GIF:", error);
      setProgress(`Upload error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadGif = () => {
    if (!gifUrl) return;

    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = "converted.gif";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyUrlToClipboard = async () => {
    if (!uploadedGifUrl) return;

    try {
      await navigator.clipboard.writeText(uploadedGifUrl);
      setProgress("URL copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      setProgress("Failed to copy URL");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Video to GIF Converter</h1>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Upload Video File
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>

        {/* Video Player */}
        {videoUrl && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Video Preview</h2>
            <div
              ref={videoContainerRef}
              className="relative bg-black rounded-lg overflow-hidden"
              style={{ cursor: isCropping ? "crosshair" : "default" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full"
                onLoadedMetadata={handleLoadedMetadata}
              />
              {/* Crop overlay */}
              {isCropping && cropArea.width > 0 && cropArea.height > 0 && (
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height,
                  }}
                />
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  setIsCropping(!isCropping);
                  if (isCropping) {
                    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
                  }
                }}
                className={`px-4 py-2 rounded-lg ${
                  isCropping
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition-colors`}
              >
                {isCropping ? "Cancel Crop" : "Enable Cropping"}
              </button>
              {cropArea.width > 0 && cropArea.height > 0 && (
                <span className="ml-4 text-sm text-gray-600">
                  Crop area: {Math.round(cropArea.width)}×{Math.round(cropArea.height)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Trim Controls */}
        {duration > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Trim Video</h2>
            <div className="px-2">
              <Slider
                range
                min={0}
                max={duration}
                step={0.1}
                value={trimRange}
                onChange={handleTrimChange}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Start: {formatTime(trimRange[0])}</span>
                <span>Duration: {formatTime(trimRange[1] - trimRange[0])}</span>
                <span>End: {formatTime(trimRange[1])}</span>
              </div>
            </div>
          </div>
        )}

        {/* Convert Button */}
        {videoFile && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <button
              onClick={convertToGif}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isProcessing ? "Converting..." : "Convert to GIF"}
            </button>

            {isProcessing && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600 text-center">{progress}</p>
              </div>
            )}

            {!isProcessing && progress && (
              <p className="mt-4 text-sm text-gray-600 text-center">{progress}</p>
            )}
          </div>
        )}

        {/* GIF Output */}
        {gifUrl && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Generated GIF</h2>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <img src={gifUrl} alt="Generated GIF" className="max-w-full mx-auto" />
            </div>

            <div className="space-y-3">
              <button
                onClick={downloadGif}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Download GIF
              </button>

              <button
                onClick={uploadGif}
                disabled={isUploading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isUploading ? "Uploading to Vercel Blob..." : "Upload to Vercel Blob"}
              </button>

              {uploadedGifUrl && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Upload successful!
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={uploadedGifUrl}
                      readOnly
                      className="flex-1 text-sm px-3 py-2 border border-green-300 rounded bg-white text-gray-700"
                    />
                    <button
                      onClick={copyUrlToClipboard}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
