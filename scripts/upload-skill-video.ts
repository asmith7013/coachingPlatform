/**
 * Script to upload a skill video to Vercel Blob storage
 * Usage: tsx scripts/upload-skill-video.ts <video-file-path> <skill-number>
 */

import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

async function uploadSkillVideo(filePath: string, skillNumber: string) {
  try {
    console.log(`📂 Reading video file: ${filePath}`);

    // Check if file exists
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!fileExists) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read the video file
    const videoBuffer = await fs.readFile(filePath);
    const videoSizeMB = (videoBuffer.length / 1024 / 1024).toFixed(2);
    console.log(`📦 Video file size: ${videoSizeMB}MB`);

    // Upload to Vercel Blob
    const blobFileName = `roadmaps/skill-${skillNumber}/worked-example-video.mp4`;
    console.log(`☁️ Uploading to Vercel Blob: ${blobFileName}...`);

    const blob = await put(blobFileName, videoBuffer, {
      access: "public",
      contentType: "video/mp4",
    });

    console.log(`\n✅ Video uploaded successfully!`);
    console.log(`📍 URL: ${blob.url}`);
    console.log(`📁 Pathname: ${blob.pathname}`);

    return blob.url;
  } catch (error) {
    console.error("❌ Error uploading video:", error);
    throw error;
  }
}

// Main execution
const main = async () => {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: tsx scripts/upload-skill-video.ts <video-file-path> <skill-number>");
    console.error("Example: tsx scripts/upload-skill-video.ts '161 WE.mp4' 161");
    process.exit(1);
  }

  const [filePath, skillNumber] = args;

  try {
    const url = await uploadSkillVideo(filePath, skillNumber);
    console.log(`\n🎯 Next step: Update skill ${skillNumber} in the database with videoUrl: ${url}`);
  } catch (error) {
    process.exit(1);
  }
};

main();
