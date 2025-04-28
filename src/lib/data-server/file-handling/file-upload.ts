import { handleServerError } from "@error/handle-server-error";
import { UploadResponse } from "@core-types/response";
export async function uploadFileWithProgress(
  file: File,
  endpoint: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              message: `Upload successful! ${data.uploaded} items added.`,
              uploaded: data.uploaded
            });
          } catch {
            reject(new Error("Failed to parse upload response"));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed: Network error"));
      });

      xhr.open("POST", endpoint);
      xhr.send(formData);
    });
  } catch (error) {
    throw handleServerError(error);
  }
} 