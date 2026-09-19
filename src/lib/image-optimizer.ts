/**
 * Image Optimization & Cloud Hosting Utilities for QR Code Generation
 */

export interface CompressionResult {
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
}

export interface CloudUploadResult {
  url: string;
  directUrl: string;
}

/**
 * Format bytes to human readable format (e.g. 1.4 MB, 320 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Upload an image file to free, fast anonymous cloud storage (tmpfiles.org)
 * Returns direct URL suitable for embedding in scannable QR codes.
 */
export async function uploadImageToCloud(file: File): Promise<CloudUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload server responded with status: ${response.status}`);
  }

  const result = await response.json();

  if (result.status !== "success" || !result.data?.url) {
    throw new Error(result.message || "Upload failed. Please try again.");
  }

  const pageUrl = String(result.data.url);
  // tmpfiles.org URLs format: https://tmpfiles.org/12345/filename.png
  // Direct download / image link format: https://tmpfiles.org/dl/12345/filename.png
  const directUrl = pageUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/");

  return {
    url: pageUrl,
    directUrl,
  };
}

/**
 * Compress an image down to fit directly within the binary capacity of a QR code
 * QR codes can hold at most ~2,953 bytes in Version 40 (Level L).
 * Target max is ~1,800 bytes for reliable camera scanning.
 */
export function compressImageForQr(file: File, targetMaxBytes = 1800): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image for processing."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not initialize 2D canvas context."));
          return;
        }

        // Iterative downscaling to reach target byte size
        const sizesToTry = [72, 56, 44, 32, 24];
        const qualitiesToTry = [0.65, 0.5, 0.35, 0.25];

        let bestResult: CompressionResult | null = null;

        for (const maxDim of sizesToTry) {
          let w = img.width;
          let h = img.height;

          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }

          canvas.width = Math.max(w, 16);
          canvas.height = Math.max(h, 16);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          for (const quality of qualitiesToTry) {
            // Prefer WebP for high compression ratio, fallback to JPEG
            let dataUrl = "";
            try {
              dataUrl = canvas.toDataURL("image/webp", quality);
              if (!dataUrl.startsWith("data:image/webp")) {
                dataUrl = canvas.toDataURL("image/jpeg", quality);
              }
            } catch {
              dataUrl = canvas.toDataURL("image/jpeg", quality);
            }

            const sizeBytes = Math.round((dataUrl.length * 3) / 4);

            const current = {
              dataUrl,
              sizeBytes,
              width: canvas.width,
              height: canvas.height,
            };

            if (!bestResult || sizeBytes < bestResult.sizeBytes) {
              bestResult = current;
            }

            if (dataUrl.length <= targetMaxBytes) {
              resolve(current);
              return;
            }
          }
        }

        if (bestResult) {
          resolve(bestResult);
        } else {
          reject(new Error("Could not compress image to target QR capacity."));
        }
      };

      img.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}
