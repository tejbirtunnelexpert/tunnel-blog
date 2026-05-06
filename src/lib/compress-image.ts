/**
 * Client-side image compression using Canvas API.
 * Reduces image quality/size to fit under maxSizeMB.
 */

export const MAX_IMAGE_MB = 5;

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function fileSizeMB(file: File): number {
  return file.size / (1024 * 1024);
}

export async function compressImage(file: File, maxSizeMB = MAX_IMAGE_MB): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Scale down if very large dimensions
      const MAX_DIM = 2048;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality until under maxSizeMB
      let quality = 0.9;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error("Compression failed")); return; }
            const sizeMB = blob.size / (1024 * 1024);
            if (sizeMB <= maxSizeMB || quality <= 0.1) {
              const compressed = new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() });
              resolve(compressed);
            } else {
              quality = Math.max(0.1, quality - 0.15);
              tryCompress();
            }
          },
          "image/jpeg",
          quality
        );
      };
      tryCompress();
    };

    img.onerror = () => reject(new Error("Could not load image"));
    img.src = url;
  });
}
