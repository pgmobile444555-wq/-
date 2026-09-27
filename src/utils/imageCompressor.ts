/**
 * Client-Side Image Compression for Mobile Flood Reporting
 * Compresses camera photos before uploading to prevent payload size issues
 * and speeds up upload on spotty mobile networks.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image file, reject gracefully
    if (!file.type.startsWith('image/')) {
      reject(new Error('ไฟล์ที่เลือกไม่ใช่รูปภาพ'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('ไม่สามารถอ่านไฟล์ภาพได้'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original base64 if canvas context is unavailable
            resolve(result);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          // If canvas fails (e.g. tainted or memory constraint), fallback to original
          resolve(result);
        }
      };

      img.onerror = () => {
        // Fallback to original if Image decode fails
        resolve(result);
      };

      img.src = result;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
