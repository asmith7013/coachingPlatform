"use server";

import { put } from "@vercel/blob";

/**
 * Upload a mastery check image to Vercel Blob storage
 */
export async function uploadMasteryCheckImage(
  imageData: Uint8Array,
  filename: string,
  contentType: string = "image/png",
) {
  try {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blobFileName = `worked-example-creator/${sanitizedFilename}-${timestamp}`;

    const imageBlob = new Blob([imageData], { type: contentType });
    const blob = await put(blobFileName, imageBlob, {
      access: "public",
      contentType,
    });

    return {
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error("Error uploading mastery check image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}
