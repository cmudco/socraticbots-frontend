/**
 * Copies text to the user's clipboard using the modern Clipboard API
 * with fallback for older browsers
 * @param text - The text to copy to clipboard
 * @returns Promise<boolean> - Success status of the copy operation
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Try modern Clipboard API first
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Modern clipboard API failed, trying fallback:', error);

    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        return true;
      } else {
        throw new Error('execCommand copy failed');
      }
    } catch (fallbackError) {
      console.error('All clipboard methods failed:', fallbackError);
      return false;
    }
  }
};
