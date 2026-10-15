import { supabase } from '../lib/supabase';

export interface CropDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Loads an image from a File, Blob, or URL into an HTMLImageElement
 */
export function loadImageElement(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.src = url;
    }
  });
}

/**
 * Crops and resizes an image on an HTML Canvas, outputting an optimized WebP or JPEG
 */
export async function cropAndResizeImage(
  source: File | Blob | string,
  options: {
    crop?: CropDimensions;
    maxWidth?: number;
    maxHeight?: number;
    mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
    quality?: number;
  } = {}
): Promise<ProcessedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    mimeType = 'image/webp',
    quality = 0.85
  } = options;

  const img = await loadImageElement(source);

  // Source crop area or full image
  const srcX = options.crop?.x ?? 0;
  const srcY = options.crop?.y ?? 0;
  const srcW = options.crop?.width ?? img.naturalWidth;
  const srcH = options.crop?.height ?? img.naturalHeight;

  // Calculate target dimensions keeping aspect ratio within max bounds
  let targetW = srcW;
  let targetH = srcH;

  if (targetW > maxWidth || targetH > maxHeight) {
    const ratio = Math.min(maxWidth / targetW, maxHeight / targetH);
    targetW = Math.round(targetW * ratio);
    targetH = Math.round(targetH * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, targetW);
  canvas.height = Math.max(1, targetH);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // High quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob conversion failed'));
          return;
        }
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({
          blob,
          dataUrl,
          width: targetW,
          height: targetH,
          sizeBytes: blob.size
        });
      },
      mimeType,
      quality
    );
  });
}

/**
 * Uploads an image to Supabase Storage with graceful fallback.
 * Checks existing buckets ('images', 'public', 'cms'), generates public URL,
 * and if storage bucket access fails, falls back to optimized data URL.
 */
export async function uploadImageToSupabaseStorage(
  fileOrBlob: Blob | File,
  filenamePrefix: string = 'topic'
): Promise<{ url: string; source: 'supabase_storage' | 'optimized_data_url' }> {
  const timestamp = Date.now();
  const cleanPrefix = filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const filename = `${cleanPrefix}_${timestamp}.webp`;

  // Candidate buckets to try in order
  const candidateBuckets = ['images', 'public', 'media', 'uploads', 'assets'];

  for (const bucket of candidateBuckets) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`topics/${filename}`, fileOrBlob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (!error && data?.path) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        if (urlData?.publicUrl) {
          return { url: urlData.publicUrl, source: 'supabase_storage' };
        }
      }
    } catch {
      // try next bucket
    }
  }

  // Graceful fallback: convert to base64 data URL if buckets are not accessible to anon
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        source: 'optimized_data_url'
      });
    };
    reader.onerror = () => reject(new Error('Failed reading file fallback'));
    reader.readAsDataURL(fileOrBlob);
  });
}
