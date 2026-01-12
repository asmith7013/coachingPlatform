export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes for Chromium + PPTX generation + Google upload

import { NextRequest, NextResponse } from 'next/server';
import { uploadPptxToUserGoogleSlides } from '@/lib/integrations/google-drive/user-oauth';
import { generatePptxFromSlides, RenderError } from '../export-pptx/helpers';
import { handlePuppeteerError } from '@error/handlers/puppeteer';
import { withDbConnection } from '@server/db/ensure-connection';
import { WorkedExampleDeck } from '@mongoose-schema/worked-example-deck.model';

/**
 * Export slides to Google Slides via PPTX upload and conversion
 * Flow: Generate PPTX → Upload to Google Drive → Convert to Google Slides
 * If slug is provided, saves the Google Slides URL to the database (replacing any existing)
 * Returns the Google Slides URL
 */
export async function POST(request: NextRequest) {
  console.log('[export-google-slides] ========== ROUTE HANDLER STARTED ==========');

  try {
    console.log('[export-google-slides] Parsing request body...');
    const { slides, title, mathConcept, slug } = await request.json();
    console.log('[export-google-slides] Request body parsed successfully');

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      console.error('[export-google-slides] No slides provided');
      return NextResponse.json({ error: 'No slides provided' }, { status: 400 });
    }

    console.log('[export-google-slides] Starting export...');
    console.log(`[export-google-slides] Processing ${slides.length} slides`);
    console.log(`[export-google-slides] Title: "${title || 'Worked Example'}"`);
    if (slug) {
      console.log(`[export-google-slides] Slug: "${slug}" (will save URL to database)`);
    }

    // Generate PPTX using shared function
    const result = await generatePptxFromSlides(slides, {
      title,
      mathConcept,
      slug,
      onProgress: (current, total, message, step) => {
        console.log(`[export-google-slides] [${step}] ${message} (${current}/${total})`);
      },
    });

    console.log(`[export-google-slides] PPTX generated: ${result.filename}`);
    console.log(`[export-google-slides] Base64 size: ${(result.pptxBase64.length / 1024).toFixed(1)} KB`);

    // Validate PPTX was generated
    if (!result.pptxBase64 || result.pptxBase64.length === 0) {
      console.error('[export-google-slides] PPTX generation returned empty content');
      return NextResponse.json({ error: 'PPTX generation failed - empty content' }, { status: 500 });
    }

    // Convert base64 to buffer
    const pptxBuffer = Buffer.from(result.pptxBase64, 'base64');
    console.log(`[export-google-slides] Buffer size: ${(pptxBuffer.length / 1024).toFixed(1)} KB`);

    // Validate buffer is not empty
    if (pptxBuffer.length === 0) {
      console.error('[export-google-slides] PPTX buffer is empty after base64 decode');
      return NextResponse.json({ error: 'PPTX generation failed - invalid content' }, { status: 500 });
    }

    // Validate PPTX file signature (PK = ZIP format that PPTX uses)
    const pkSignature = pptxBuffer.slice(0, 2).toString();
    if (pkSignature !== 'PK') {
      console.error(`[export-google-slides] Invalid PPTX signature: ${pkSignature} (expected PK)`);
      return NextResponse.json({ error: 'PPTX generation failed - invalid file format' }, { status: 500 });
    }

    console.log('[export-google-slides] Uploading to user\'s Google Drive...');
    console.log('[export-google-slides] Display title:', result.displayTitle);

    // Upload to user's Google Drive and convert to Google Slides
    // Use displayTitle for human-readable name in Google Drive
    const uploadResult = await uploadPptxToUserGoogleSlides(pptxBuffer, result.displayTitle);

    if (!uploadResult.success) {
      console.error('[export-google-slides] Upload failed:', uploadResult.error);
      return NextResponse.json({ error: uploadResult.error }, { status: 500 });
    }

    console.log('[export-google-slides] Upload successful!');
    console.log(`[export-google-slides] File ID: ${uploadResult.fileId}`);
    console.log(`[export-google-slides] URL: ${uploadResult.url}`);

    // Save the Google Slides URL to the database if slug is provided
    if (slug && uploadResult.url) {
      try {
        await withDbConnection(async () => {
          const updateResult = await WorkedExampleDeck.findOneAndUpdate(
            { slug },
            { googleSlidesUrl: uploadResult.url },
            { new: true }
          );
          if (updateResult) {
            console.log(`[export-google-slides] Saved URL to database for slug: ${slug}`);
          } else {
            console.log(`[export-google-slides] No deck found with slug: ${slug} (URL not saved)`);
          }
        });
      } catch (dbError) {
        // Log but don't fail the request - the export still succeeded
        console.error('[export-google-slides] Failed to save URL to database:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      fileId: uploadResult.fileId,
    });

  } catch (error) {
    console.error('[export-google-slides] ========== CATCH BLOCK ==========');
    console.error('[export-google-slides] Error type:', error?.constructor?.name);
    console.error('[export-google-slides] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[export-google-slides] Full error:', error);

    // Use handlePuppeteerError for rendering-related errors
    if (error instanceof RenderError) {
      console.error('[export-google-slides] Returning RenderError:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Check if it's a puppeteer-related error (even if not wrapped in RenderError)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes('Chrome') ||
      errorMessage.includes('browser') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('Target closed')
    ) {
      const puppeteerError = handlePuppeteerError(error, 'Google Slides export');
      console.error('[export-google-slides] Returning puppeteer error:', puppeteerError);
      return NextResponse.json(
        { error: puppeteerError },
        { status: 500 }
      );
    }

    const finalError = error instanceof Error ? error.message : 'Failed to export to Google Slides';
    console.error('[export-google-slides] Returning generic error:', finalError);
    return NextResponse.json(
      { error: finalError },
      { status: 500 }
    );
  }
}
