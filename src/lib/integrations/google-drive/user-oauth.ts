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

    // Extract detailed error info from Google API errors (GaxiosError structure)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const googleError = error as any;

    // GaxiosError has: response.status, response.data, errors array
    const responseStatus = googleError?.response?.status;
    const responseData = googleError?.response?.data;
    const errorDetails = responseData?.error;
    const errorsArray = googleError?.errors || errorDetails?.errors;

    console.error('[uploadToUserDrive] Response status:', responseStatus);
    if (responseData) {
      console.error('[uploadToUserDrive] Response data:', JSON.stringify(responseData, null, 2));
    }
    if (errorsArray) {
      console.error('[uploadToUserDrive] Errors array:', JSON.stringify(errorsArray, null, 2));
    }

    // Build complete error message from all sources
    const errorMessage = [
      error instanceof Error ? error.message : String(error),
      errorDetails?.message,
      errorsArray?.[0]?.message,
      errorsArray?.[0]?.reason,
    ].filter(Boolean).join(' ');

    // Check for specific status codes first
    if (responseStatus === 401 || errorMessage.includes('invalid_grant')) {
      return {
        success: false,
        error: 'Google authorization expired. Please sign out and sign in again.',
      };
    }

    if (responseStatus === 403 || errorMessage.includes('insufficientPermissions') || errorMessage.includes('insufficient authentication scopes')) {
      return {
        success: false,
        error: 'Missing Google Drive permissions. Please sign out, then sign in again with Google to grant Drive access.',
      };
    }

    // Handle 400 Bad Request - often means the file conversion failed
    if (responseStatus === 400 || errorMessage.includes('Bad Request')) {
      // Try to get the most specific error detail
      const specificError = errorsArray?.[0]?.message || errorDetails?.message;
      const detail = specificError || 'The file may be invalid or too complex for Google Slides conversion.';
      return {
        success: false,
        error: `Google Drive rejected the upload: ${detail}`,
      };
    }

    // Handle quota/rate limit errors
    if (responseStatus === 429 || errorMessage.includes('rateLimitExceeded')) {
      return {
        success: false,
        error: 'Google Drive rate limit reached. Please wait a moment and try again.',
      };
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
