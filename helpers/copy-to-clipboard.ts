export const copyToClipboard = async (
  textToCopy: string,
  callback?: (item: string) => void,
  item?: string
) => {
  try {
    await navigator.clipboard.writeText(textToCopy);
    if (callback && item) {
      callback(item);
      setTimeout(() => callback(""), 2000);
    }
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
  }
};
