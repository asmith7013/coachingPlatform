/**
 * Utility functions for the worked example wizard.
 */

/**
 * Convert a File object to a base64 data URL.
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format elapsed time in seconds to a human-readable string.
 * Examples: "5s", "1m 30s", "2m 0s"
 */
export function formatElapsedTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Format elapsed time in MM:SS format.
 * Examples: "0:05", "1:30", "2:00"
 */
export function formatElapsedTimeShort(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Check if a file is a valid image type.
 */
export function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Cleanup image previews by revoking object URLs.
 */
export function revokeImagePreviews(images: { preview: string }[]): void {
  images.forEach((img) => URL.revokeObjectURL(img.preview));
}
