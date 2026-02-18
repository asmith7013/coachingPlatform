#!/usr/bin/env node

/**
 * Replace alg1 state test screenshots with PDF-extracted images.
 * Reads images from local folders, uploads to Vercel Blob, updates MongoDB.
 *
 * Usage: node scripts/replace-alg1-screenshots.mjs
 *
 * Requires: .env.local with DATABASE_URL and BLOB_READ_WRITE_TOKEN
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { put } from '@vercel/blob';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1); }
if (!BLOB_TOKEN) { console.error('Missing BLOB_READ_WRITE_TOKEN'); process.exit(1); }

const JOBS = [
  { folder: '/Users/alexsmith/Documents/state-exam-output/alg1-jan-2025', grade: 'alg1', year: '2025', examTitle: 'January 2025' },
  { folder: '/Users/alexsmith/Documents/state-exam-output/alg1-jun-2024', grade: 'alg1', year: '2024', examTitle: 'June 2024' },
  { folder: '/Users/alexsmith/Documents/state-exam-output/alg1-jun-2025', grade: 'alg1', year: '2025', examTitle: 'June 2025' },
  { folder: '/Users/alexsmith/Documents/state-exam-output/alg1-aug-2024', grade: 'alg1', year: '2024', examTitle: 'August 2024' },
  { folder: '/Users/alexsmith/Documents/state-exam-output/alg1-aug-2025', grade: 'alg1', year: '2025', examTitle: 'August 2025' },
];

// Connect to MongoDB
await mongoose.connect(DATABASE_URL);
console.log('Connected to MongoDB\n');

const db = mongoose.connection.db;
const collection = db.collection('state-test-questions');

function sortByNumber(files) {
  return [...files].sort((a, b) => {
    const numA = parseInt(a.match(/(\d+)/)?.[1] || '0');
    const numB = parseInt(b.match(/(\d+)/)?.[1] || '0');
    return numA - numB;
  });
}

for (const job of JOBS) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Replacing: ${job.examTitle} (grade ${job.grade})`);
  console.log(`Folder: ${job.folder}`);
  console.log('='.repeat(60));

  // 1. Read PNG files
  const allFiles = await readdir(job.folder);
  const pngFiles = sortByNumber(allFiles.filter(f => f.endsWith('.png') && !f.startsWith('_')));
  console.log(`Found ${pngFiles.length} PNG files`);

  // 2. Get matching questions from DB
  const questions = await collection
    .find({ grade: job.grade, examYear: job.year, examTitle: job.examTitle })
    .sort({ pageIndex: 1 })
    .toArray();
  console.log(`Found ${questions.length} questions in DB`);

  // 3. Verify counts
  if (pngFiles.length !== questions.length) {
    console.error(`COUNT MISMATCH: ${pngFiles.length} files vs ${questions.length} questions — SKIPPING`);
    continue;
  }

  // 4. Upload and update
  let replaced = 0;
  for (let i = 0; i < pngFiles.length; i++) {
    const file = pngFiles[i];
    const question = questions[i];
    const filePath = join(job.folder, file);
    const fileBuffer = await readFile(filePath);

    const blobPath = `state-test-questions/${job.year}/grade-${job.grade}/${question.questionId}.png`;
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      contentType: 'image/png',
      allowOverwrite: true,
      token: BLOB_TOKEN,
    });

    await collection.updateOne(
      { questionId: question.questionId },
      { $set: { screenshotUrl: blob.url } }
    );

    replaced++;
    console.log(`  [${i + 1}/${pngFiles.length}] ${question.questionId} (Q${question.pageIndex}) <- ${file}`);
  }

  console.log(`Done: ${replaced}/${pngFiles.length} replaced`);
}

await mongoose.disconnect();
console.log('\nAll done!');
