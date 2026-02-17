/**
 * Client-side clipboard utilities
 * Handles copying data to clipboard with fallback support
 */

/**
 * Copies text to clipboard using the Clipboard API with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern Clipboard API (preferred method)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers or non-secure contexts
    return copyToClipboardFallback(text);
  } catch (error) {
    console.error("Clipboard copy failed:", error);

    // Try fallback method if modern API fails
    return copyToClipboardFallback(text);
  }
}

/**
 * Fallback clipboard copy method using document.execCommand
 */
function copyToClipboardFallback(text: string): boolean {
  try {
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Make it invisible
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";

    // Add to DOM, select, copy, and remove
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textArea);

    return success;
  } catch (error) {
    console.error("Fallback clipboard copy failed:", error);
    return false;
  }
}

/**
 * Checks if clipboard functionality is available
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard || document.execCommand);
}
