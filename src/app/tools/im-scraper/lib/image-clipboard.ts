/**
 * Utility for copying images to clipboard using fetch-based approach
 * Optimized for local screenshot files served from /screenshots/
 */

export interface ClipboardCopyResult {
  success: boolean;
  error?: string;
}

/**
 * Copy image to clipboard using fetch approach
 * Works best for same-origin images (our screenshot files)
 */
export async function copyImageToClipboard(imageUrl: string): Promise<ClipboardCopyResult> {
  try {
    // Check if clipboard API is available
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error('Clipboard API not supported in this browser');
    }

    // Fetch the image as a blob
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Verify it's an image
    if (!blob.type.startsWith('image/')) {
      throw new Error('File is not a valid image type');
    }

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);

    return { success: true };

  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Copy image with automatic fallback to opening in new tab
 */
export async function copyImageWithFallback(imageUrl: string): Promise<ClipboardCopyResult> {
  const result = await copyImageToClipboard(imageUrl);
  
  if (!result.success) {
    // Fallback: open in new tab for manual copy
    try {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
      return {
        success: true,
        error: 'Opened in new tab for manual copy'
      };
    } catch {
      return {
        success: false,
        error: 'Both clipboard copy and fallback failed'
      };
    }
  }
  
  return result;
}

/**
 * Check if clipboard image copying is supported
 */
export function isClipboardImageSupported(): boolean {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.write === 'function' &&
    typeof window !== 'undefined' &&
    window.ClipboardItem
  );
}
