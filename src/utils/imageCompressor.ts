import imageCompression from "browser-image-compression";

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

export async function compressAndConvertToWebP(
  file: File,
  options: CompressionOptions = {},
): Promise<File> {
  const { maxSizeMB = 1, maxWidthOrHeight = 1920, useWebWorker = true, quality = 0.85 } = options;

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
    });

    if (compressedFile.type === "image/webp") {
      return compressedFile;
    }

    return await convertToWebP(compressedFile, quality);
  } catch (error) {
    console.error("Error compressing image:", error);
    throw new Error("Lỗi khi xử lý ảnh");
  }
}

async function convertToWebP(file: File, quality: number = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Không thể lấy canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Lỗi khi tạo WebP blob"));
              return;
            }

            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: "image/webp",
            });

            resolve(webpFile);
          },
          "image/webp",
          quality,
        );
      };

      img.onerror = () => reject(new Error("Lỗi khi load ảnh"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Lỗi khi đọc file"));
    reader.readAsDataURL(file);
  });
}

export async function compressAndConvertMultipleImages(
  files: File[],
  options?: CompressionOptions,
): Promise<File[]> {
  return Promise.all(files.map((file) => compressAndConvertToWebP(file, options)));
}
