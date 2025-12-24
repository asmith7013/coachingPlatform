import { clerkClient, auth } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Get the current user's Google OAuth access token from Clerk
 * Requires the user to have signed in with Google and granted the drive.file scope
 */
export async function getUserGoogleOAuthToken(): Promise<{
  success: true;
  accessToken: string;
  userId: string;
} | {
  success: false;
  error: string;
}> {
  try {
    // Get the current user's ID
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get the Clerk client
    const clerk = await clerkClient();

    // Get the user's Google OAuth token
    // This returns an array of tokens (user might have multiple Google accounts)
    // Note: Use 'google' not 'oauth_google' (deprecated)
    const tokens = await clerk.users.getUserOauthAccessToken(userId, 'google');

    if (!tokens || tokens.data.length === 0) {
      return {
        success: false,
        error: 'No Google OAuth token found. Please sign in with Google and grant Drive access.',
      };
    }

    // Use the first token (most recent)
    const token = tokens.data[0];

    if (!token.token) {
      return {
        success: false,
        error: 'Google OAuth token is empty. Please re-authorize with Google.',
      };
    }

    return {
      success: true,
      accessToken: token.token,
      userId,
    };
  } catch (error) {
    console.error('[getUserGoogleOAuthToken] Error:', error);

    // Check for specific Clerk errors
    if (error instanceof Error) {
      if (error.message.includes('Unprocessable Entity')) {
        return {
          success: false,
          error: 'Google OAuth token expired or invalid. Please sign out and sign in again with Google.',
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Google OAuth token',
    };
  }
}

/**
 * Create a Google Drive client using the user's OAuth token
 */
export function createUserDriveClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Upload a file to the user's Google Drive
 */
export async function uploadToUserDrive(
  accessToken: string,
  buffer: Buffer,
  filename: string,
  mimeType: string,
  options?: {
    convertToGoogleFormat?: boolean;
  }
): Promise<{ success: true; fileId: string; webViewLink: string } | { success: false; error: string }> {
  try {
    const drive = createUserDriveClient(accessToken);

    // Convert Buffer to Readable stream
    const stream = Readable.from(buffer);

    const fileMetadata: { name: string; mimeType?: string } = {
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
    console.error('[uploadToUserDrive] Error:', error);

    // Check for auth errors
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('invalid_grant')) {
        return {
          success: false,
          error: 'Google authorization expired. Please sign out and sign in again.',
        };
      }
      if (error.message.includes('403') || error.message.includes('insufficientPermissions') || error.message.includes('insufficient authentication scopes')) {
        return {
          success: false,
          error: 'Missing Google Drive permissions. Please sign out, then sign in again with Google to grant Drive access.',
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

/**
 * Upload PPTX to user's Google Drive and convert to Google Slides
 */
export async function uploadPptxToUserGoogleSlides(
  pptxBuffer: Buffer,
  filename: string
): Promise<{ success: true; fileId: string; url: string } | { success: false; error: string }> {
  // Get the user's OAuth token
  const tokenResult = await getUserGoogleOAuthToken();

  if (!tokenResult.success) {
    return tokenResult;
  }

  // Upload and convert to Google Slides
  const uploadResult = await uploadToUserDrive(
    tokenResult.accessToken,
    pptxBuffer,
    filename.replace(/\.pptx$/i, ''),
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    { convertToGoogleFormat: true }
  );

  if (!uploadResult.success) {
    return uploadResult;
  }

  return {
    success: true,
    fileId: uploadResult.fileId,
    url: uploadResult.webViewLink,
  };
}
