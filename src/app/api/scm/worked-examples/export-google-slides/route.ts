export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { uploadPptxToUserGoogleSlides } from '@/lib/integrations/google-drive/user-oauth';
import { generatePptxFromSlides } from '../export-pptx/helpers';
import { withDbConnection } from '@server/db/ensure-connection';
import { WorkedExampleDeck } from '@mongoose-schema/worked-example-deck.model';

/**
 * Export slides to Google Slides via PPTX upload and conversion
 * Flow: Generate PPTX → Upload to Google Drive → Convert to Google Slides
 * If slug is provided, saves the Google Slides URL to the database (replacing any existing)
 * Returns the Google Slides URL
 */
export async function POST(request: NextRequest) {
  try {
    const { slides, title, mathConcept, slug } = await request.json();

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
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

    // Convert base64 to buffer
    const pptxBuffer = Buffer.from(result.pptxBase64, 'base64');
    console.log(`[export-google-slides] Buffer size: ${(pptxBuffer.length / 1024).toFixed(1)} KB`);

    console.log('[export-google-slides] Uploading to user\'s Google Drive...');

    // Upload to user's Google Drive and convert to Google Slides
    const uploadResult = await uploadPptxToUserGoogleSlides(pptxBuffer, result.filename);

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
    console.error('[export-google-slides] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export to Google Slides' },
      { status: 500 }
    );
  }
}
