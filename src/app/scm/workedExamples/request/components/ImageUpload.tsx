"use client";

import { CameraIcon } from "@heroicons/react/24/outline";

interface UploadedImage {
  file: File;
  preview: string;
}

interface ImageUploadProps {
  uploadedImage: UploadedImage | null;
  preloadedImageUrl?: string | null;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
}

export function ImageUpload({
  uploadedImage,
  preloadedImageUrl,
  onImageUpload,
  onImageRemove,
}: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file);
    }
  };

  const hasImage = uploadedImage !== null || preloadedImageUrl !== null;
  const imageUrl = uploadedImage?.preview || preloadedImageUrl;
  const imageName = uploadedImage?.file.name || "Practice problem from queue";

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Practice Problem Image *
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          hasImage
            ? "border-green-300 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        {hasImage && imageUrl ? (
          <div className="space-y-4">
            <img
              src={imageUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg shadow-sm"
            />
            <p className="text-sm text-gray-600">{imageName}</p>
            <button
              onClick={onImageRemove}
              className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
            >
              Remove image
            </button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <CameraIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                Drop an image here or{" "}
                <span className="text-blue-600 hover:text-blue-800">browse</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Upload a screenshot of the practice problem
              </p>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
