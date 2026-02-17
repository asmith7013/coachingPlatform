"use server";

import { put } from "@vercel/blob";

export async function uploadGifToBlob(gifData: Uint8Array, filename?: string) {
  try {
    const timestamp = Date.now();
    const blobFileName = filename
      ? `gif-converter/${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}-${timestamp}.gif`
      : `gif-converter/converted-${timestamp}.gif`;

    // Convert Uint8Array to Blob for upload
    const gifBlob = new Blob([gifData], { type: "image/gif" });
    const blob = await put(blobFileName, gifBlob, {
      access: "public",
      contentType: "image/gif",
    });

    return {
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error("Error uploading GIF to Vercel Blob:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload GIF",
    };
  }
}
