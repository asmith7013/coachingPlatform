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
  console.log('[getUserGoogleOAuthToken] Starting...');
  try {
    // Get the current user's ID
    console.log('[getUserGoogleOAuthToken] Getting auth...');
    const { userId } = await auth();
    console.log('[getUserGoogleOAuthToken] userId:', userId ? 'present' : 'missing');

    if (!userId) {
      console.error('[getUserGoogleOAuthToken] FAIL: No userId');
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get the Clerk client
    console.log('[getUserGoogleOAuthToken] Getting Clerk client...');
    const clerk = await clerkClient();
    console.log('[getUserGoogleOAuthToken] Clerk client obtained');

    // Get the user's Google OAuth token
    console.log('[getUserGoogleOAuthToken] Getting OAuth token from Clerk...');
    const tokens = await clerk.users.getUserOauthAccessToken(userId, 'google');
    console.log('[getUserGoogleOAuthToken] Tokens response:', tokens?.data?.length || 0, 'tokens');

    if (!tokens || tokens.data.length === 0) {
      console.error('[getUserGoogleOAuthToken] FAIL: No tokens found');
      return {
        success: false,
        error: 'No Google OAuth token found. Please sign in with Google and grant Drive access.',
      };
    }

    // Use the first token (most recent)
    const token = tokens.data[0];
    console.log('[getUserGoogleOAuthToken] Token present:', !!token.token);

    if (!token.token) {
      console.error('[getUserGoogleOAuthToken] FAIL: Token is empty');
      return {
        success: false,
        error: 'Google OAuth token is empty. Please re-authorize with Google.',
      };
    }

    console.log('[getUserGoogleOAuthToken] SUCCESS: Token obtained');
    return {
      success: true,
      accessToken: token.token,
      userId,
    };
  } catch (error) {
    console.error('[getUserGoogleOAuthToken] CATCH ERROR:', error);

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
  console.log('[createUserDriveClient] Creating OAuth2 client...');
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  console.log('[createUserDriveClient] Creating Drive client...');
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  console.log('[createUserDriveClient] Drive client created');
  return drive;
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
  console.log('[uploadToUserDrive] Starting...');
  console.log('[uploadToUserDrive] filename:', filename);
  console.log('[uploadToUserDrive] mimeType:', mimeType);
  console.log('[uploadToUserDrive] buffer size:', buffer.length, 'bytes');
  console.log('[uploadToUserDrive] convertToGoogleFormat:', options?.convertToGoogleFormat);

  try {
    console.log('[uploadToUserDrive] Creating Drive client...');
    const drive = createUserDriveClient(accessToken);
    console.log('[uploadToUserDrive] Drive client created');

    // Convert Buffer to Readable stream
    console.log('[uploadToUserDrive] Creating stream from buffer...');
    const stream = Readable.from(buffer);
    console.log('[uploadToUserDrive] Stream created');

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

    console.log('[uploadToUserDrive] fileMetadata:', JSON.stringify(fileMetadata));
    console.log('[uploadToUserDrive] Calling drive.files.create...');

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    console.log('[uploadToUserDrive] drive.files.create returned');
    console.log('[uploadToUserDrive] response.status:', response.status);
    console.log('[uploadToUserDrive] response.data:', JSON.stringify(response.data));

    if (!response.data.id) {
      console.error('[uploadToUserDrive] FAIL: No file ID in response');
      return { success: false, error: 'Failed to get file ID from response' };
    }

    console.log('[uploadToUserDrive] SUCCESS: File uploaded, ID:', response.data.id);
    return {
      success: true,
      fileId: response.data.id,
      webViewLink: response.data.webViewLink || `https://docs.google.com/presentation/d/${response.data.id}/edit`,
    };
  } catch (error) {
    console.error('[uploadToUserDrive] CATCH ERROR');
    // Log everything we can about the error
    console.error('[uploadToUserDrive] Error type:', error?.constructor?.name);
    console.error('[uploadToUserDrive] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[uploadToUserDrive] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error as object), 2));

    // Extract detailed error info from Google API errors (GaxiosError structure)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const googleError = error as any;

    // Log all available properties
    console.error('[uploadToUserDrive] Error keys:', Object.keys(googleError || {}));
    console.error('[uploadToUserDrive] response:', googleError?.response);
    console.error('[uploadToUserDrive] code:', googleError?.code);
    console.error('[uploadToUserDrive] status:', googleError?.status);

    // GaxiosError has: response.status, response.data, errors array
    const responseStatus = googleError?.response?.status || googleError?.status || googleError?.code;
    const responseData = googleError?.response?.data || googleError?.data;
    const errorDetails = responseData?.error;
    const errorsArray = googleError?.errors || errorDetails?.errors;

    console.error('[uploadToUserDrive] Extracted status:', responseStatus);
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

    console.error('[uploadToUserDrive] errorMessage for matching:', errorMessage);
    console.error('[uploadToUserDrive] responseStatus for matching:', responseStatus);
    console.error('[uploadToUserDrive] includes Bad Request?:', errorMessage.includes('Bad Request'));

    // Check for specific status codes first
    if (responseStatus === 401 || errorMessage.includes('invalid_grant')) {
      console.error('[uploadToUserDrive] Returning: auth expired');
      return {
        success: false,
        error: 'Google authorization expired. Please sign out and sign in again.',
      };
    }

    if (responseStatus === 403 || errorMessage.includes('insufficientPermissions') || errorMessage.includes('insufficient authentication scopes')) {
      console.error('[uploadToUserDrive] Returning: missing permissions');
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
      console.error('[uploadToUserDrive] Returning: 400 Bad Request with detail:', detail);
      return {
        success: false,
        error: `Google Drive rejected the upload: ${detail}`,
      };
    }

    // Handle quota/rate limit errors
    if (responseStatus === 429 || errorMessage.includes('rateLimitExceeded')) {
      console.error('[uploadToUserDrive] Returning: rate limit');
      return {
        success: false,
        error: 'Google Drive rate limit reached. Please wait a moment and try again.',
      };
    }

    console.error('[uploadToUserDrive] Returning: generic error message');
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
  console.log('[uploadPptxToUserGoogleSlides] Starting...');
  console.log('[uploadPptxToUserGoogleSlides] filename:', filename);
  console.log('[uploadPptxToUserGoogleSlides] buffer size:', pptxBuffer.length, 'bytes');

  // Get the user's OAuth token
  console.log('[uploadPptxToUserGoogleSlides] Getting OAuth token...');
  const tokenResult = await getUserGoogleOAuthToken();

  if (!tokenResult.success) {
    console.error('[uploadPptxToUserGoogleSlides] FAIL: Token fetch failed:', tokenResult.error);
    return tokenResult;
  }
  console.log('[uploadPptxToUserGoogleSlides] Token obtained successfully');

  // Upload and convert to Google Slides
  console.log('[uploadPptxToUserGoogleSlides] Calling uploadToUserDrive...');
  const uploadResult = await uploadToUserDrive(
    tokenResult.accessToken,
    pptxBuffer,
    filename.replace(/\.pptx$/i, ''),
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    { convertToGoogleFormat: true }
  );

  if (!uploadResult.success) {
    console.error('[uploadPptxToUserGoogleSlides] FAIL: Upload failed:', uploadResult.error);
    return uploadResult;
  }

  console.log('[uploadPptxToUserGoogleSlides] SUCCESS: Upload complete');
  console.log('[uploadPptxToUserGoogleSlides] fileId:', uploadResult.fileId);
  console.log('[uploadPptxToUserGoogleSlides] url:', uploadResult.webViewLink);

  return {
    success: true,
    fileId: uploadResult.fileId,
    url: uploadResult.webViewLink,
  };
}
