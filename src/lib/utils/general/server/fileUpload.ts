export async function uploadFileWithProgress(
  file: File,
  onProgress?: (progress: number) => void
) {
  return new Promise<{ url: string }>((resolve, _reject) => {
    // This is a placeholder implementation
    // In a real app, you would implement file upload logic here
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (onProgress) onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        resolve({ url: `https://example.com/files/${file.name}` });
      }
    }, 500);
  });
} 