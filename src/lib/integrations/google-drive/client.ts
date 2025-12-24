import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Google Drive API client configuration
 * Uses service account for file upload, conversion, and sharing
 */
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/drive.file', // Create/manage files
  ],
});

export const drive = google.drive({ version: 'v3', auth });

/**
 * Upload a file to Google Drive and optionally convert to Google format
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  options?: {
    convertToGoogleFormat?: boolean;
    folderId?: string;
  }
): Promise<{ success: true; fileId: string; webViewLink: string } | { success: false; error: string }> {
  try {
    // Convert Buffer to Readable stream
    const stream = Readable.from(buffer);

    const fileMetadata: { name: string; mimeType?: string; parents?: string[] } = {
      name: filename,
    };

    // If converting, set the target mimeType
    if (options?.convertToGoogleFormat) {
      if (mimeType.includes('presentation') || mimeType.includes('pptx')) {
        fileMetadata.mimeType = 'application/vnd.google-apps.presentation';
      } else if (mimeType.includes('spreadsheet') || mimeType.includes('xlsx')) {
        fileMetadata.mimeType = 'application/vnd.google-apps.spreadsheet';
      } else if (mimeType.includes('document') || mimeType.includes('docx')) {
        fileMetadata.mimeType = 'application/vnd.google-apps.document';
      }
    }

    if (options?.folderId) {
      fileMetadata.parents = [options.folderId];
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    if (!response.data.id) {
      return { success: false, error: 'Failed to get file ID from response' };
    }

    return {
      success: true,
      fileId: response.data.id,
      webViewLink: response.data.webViewLink || `https://docs.google.com/presentation/d/${response.data.id}/edit`,
    };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Share a file with a specific user by email
 */
export async function shareFileWithUser(
  fileId: string,
  email: string,
  role: 'reader' | 'writer' | 'commenter' = 'writer'
): Promise<{ success: boolean; error?: string }> {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        type: 'user',
        role,
        emailAddress: email,
      },
      sendNotificationEmail: false,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sharing file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Make a file accessible to anyone with the link
 */
export async function makeFilePublic(
  fileId: string,
  role: 'reader' | 'writer' | 'commenter' = 'reader'
): Promise<{ success: boolean; error?: string }> {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        type: 'anyone',
        role,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error making file public:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload a PPTX file and convert it to Google Slides
 * Returns the Google Slides URL
 */
export async function uploadPptxAsGoogleSlides(
  pptxBuffer: Buffer,
  filename: string,
  shareWithEmail?: string
): Promise<{ success: true; fileId: string; url: string } | { success: false; error: string }> {
  // Upload and convert to Google Slides
  const uploadResult = await uploadFile(
    pptxBuffer,
    filename.replace(/\.pptx$/i, ''),
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    { convertToGoogleFormat: true }
  );

  if (!uploadResult.success) {
    return uploadResult;
  }

  // Share with user if email provided
  if (shareWithEmail) {
    const shareResult = await shareFileWithUser(uploadResult.fileId, shareWithEmail, 'writer');
    if (!shareResult.success) {
      console.warn('Failed to share file with user:', shareResult.error);
      // Don't fail the entire operation, just log warning
    }
  }

  return {
    success: true,
    fileId: uploadResult.fileId,
    url: uploadResult.webViewLink,
  };
}
